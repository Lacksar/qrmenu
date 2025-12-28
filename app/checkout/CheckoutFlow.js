"use client";
import React, {
  useEffect,
  useState,
  Suspense,
  useContext,
  useMemo,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckOutForm from "./CheckOutForm";
import StatusModal from "@/components/design/StatusModal";
import { useSearchParams } from "next/navigation";
import { CartContext } from "../context/CartContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function CheckoutFlow() {
  const { state, dispatch } = useContext(CartContext);
  const { items: orderItems = [] } = state || {};
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [modalState, setModalState] = useState({
    isOpen: !!orderId,
    status: orderId ? "loading" : "",
    message: orderId ? "Processing your payment... Please wait." : "",
    deliveryCode: "",
    orderId: orderId || "",
  });

  useEffect(() => {
    if (!orderId) return;

    let pollInterval;
    let pollCount = 0;
    const maxPolls = 30; // Poll for up to 5 minutes (30 * 10 seconds)

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        const order = data.data;

        if (!order) throw new Error("Order not found");

        if (order.paymentStatus === "paid") {
          dispatch({ type: "CLEAR_CART" });
          setModalState({
            isOpen: true,
            status: "success",
            message: "Payment successful! Your order is confirmed.",
            deliveryCode: order.deliveryCode,
            orderId: order._id,
          });
          if (pollInterval) clearInterval(pollInterval);
        } else if (order.paymentStatus === "pending") {
          const timeRemaining = Math.max(0, maxPolls - pollCount);
          const minutesRemaining = Math.ceil((timeRemaining * 10) / 60);

          setModalState((prevState) => ({
            ...prevState,
            isOpen: true,
            status: "loading",
            message:
              pollCount > 0
                ? `Still processing your payment... (${minutesRemaining} min remaining)`
                : prevState.message,
            deliveryCode: order.deliveryCode,
            orderId: order._id,
          }));

          // Start polling if not already started
          if (!pollInterval) {
            pollInterval = setInterval(() => {
              pollCount++;
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                setModalState({
                  isOpen: true,
                  status: "error",
                  message:
                    "Payment processing is taking longer than expected. Your order may still be processing. Please check your email or contact support with your order ID.",
                  deliveryCode: order.deliveryCode,
                  orderId: order._id,
                });
                return;
              }
              fetchOrderStatus();
            }, 10000); // Poll every 10 seconds
          }
        } else {
          setModalState({
            isOpen: true,
            status: "error",
            message:
              "Payment failed and your order has been cancelled. Please try again.",
            deliveryCode: order.deliveryCode,
            orderId: order._id,
          });
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        setModalState({
          isOpen: true,
          status: "error",
          message: err.message,
          deliveryCode: "",
          orderId,
        });
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    fetchOrderStatus();

    // Cleanup interval on unmount
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId]);

  const closeModal = () => {
    setModalState({
      isOpen: false,
      status: "",
      message: "",
      deliveryCode: "",
      orderId: "",
    });
  };

  const totalAmountInCents = useMemo(() => {
    if (!orderItems || orderItems.length === 0) {
      return 0;
    }
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return Math.round(subtotal * 100);
  }, [orderItems]);

  const options = {
    mode: "payment",
    amount: totalAmountInCents || 100,
    currency: "aud",
    // For more options, see https://stripe.com/docs/js/elements_object/create#stripe_elements_create-options
  };

  return (
    <>
      {modalState.isOpen && (
        <StatusModal
          status={modalState.status}
          message={modalState.message}
          deliveryCode={modalState.deliveryCode}
          orderId={modalState.orderId}
          onClose={closeModal}
        />
      )}
      <Elements stripe={stripePromise} options={options}>
        <CheckOutForm />
      </Elements>
    </>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutFlow />
    </Suspense>
  );
}
