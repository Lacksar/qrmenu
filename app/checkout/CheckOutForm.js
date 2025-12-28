"use client";
import { useState, useMemo, useContext, useEffect, useRef } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { CartContext } from "../context/CartContext";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import StatusModal from "@/components/design/StatusModal";
import Image from "next/image";
import MaintenanceWrapper from "@/components/MaintainenceWrapper";

const CheckOutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { state, dispatch } = useContext(CartContext);
  const { items: orderItems = [] } = state || {};
  const { data: session } = useSession();
  const router = useRouter();

  const formRef = useRef(null);

  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "",
    message: "",
    deliveryCode: "",
    orderId: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "Australia",
    street: "",
    suburb: "",
    state: "New South Wales",
    postcode: "",
    phone: "",
    email: "",
    outlet: "Engadine",
    orderNotes: "",
    orderType: "pickup",
    pickupDate: "",
    pickupTime: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("online");

  const [onlineOutlets, setOnlineOutlets] = useState({});
  useEffect(() => {
    setIsClient(true);
    async function fetchOnlineStatus() {
      try {
        const response = await fetch("/api/online", { cache: "no-store" });
        const data = await response.json();

        // Convert outlets array to key-value object
        const outletStatus = data.data.outlets.reduce((acc, outlet) => {
          acc[outlet.name] = outlet.online;
          return acc;
        }, {});
        console.log("Fetched outlet status:", outletStatus);
        setOnlineOutlets(outletStatus); // ✅ e.g. { HURSTVILLE: true, ENGADINE: true }
      } catch (error) {
        console.error("Error fetching online status:", error);
      }
    }

    fetchOnlineStatus();
  }, []);

  useEffect(() => {
    // If the currently selected outlet is offline, find the first available online outlet and set it as selected.
    if (onlineOutlets && !onlineOutlets[formData.outlet.toUpperCase()]) {
      const firstOnlineOutlet = Object.keys(onlineOutlets).find(
        (outletName) => onlineOutlets[outletName]
      );
      if (firstOnlineOutlet) {
        // Convert to proper case to match value, e.g., "ENGADINE" -> "Engadine"
        const formattedOutletName =
          firstOnlineOutlet.charAt(0).toUpperCase() +
          firstOnlineOutlet.slice(1).toLowerCase();
        setFormData((prev) => ({ ...prev, outlet: formattedOutletName }));
      }
    }
  }, [onlineOutlets, formData.outlet]);

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required.";
    if (!formData.lastName) errors.lastName = "Last name is required.";
    if (!formData.phone) errors.phone = "Phone number is required.";
    if (!formData.email) errors.email = "Email address is required.";
    if (!formData.outlet) errors.outlet = "Please select an outlet.";
    if (formData.orderType === "pickup" && !formData.pickupDate) {
      errors.pickupDate = "Pickup date is required.";
    }
    if (formData.orderType === "pickup" && !formData.pickupTime) {
      errors.pickupTime = "Pickup time is required.";
    }
    if (orderItems.length === 0) errors.menu = "Your cart is empty.";
    return errors;
  };

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({ ...prev, email: session.user.email || "" }));
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [orderItems]);

  const total = subtotal;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = formRef.current;
      const focusable = Array.from(
        form.querySelectorAll("input, select, textarea")
      );
      const index = focusable.indexOf(e.target);
      if (index > -1 && index < focusable.length - 1) {
        focusable[index + 1].focus();
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Run your custom validation for non-payment fields
    const customErrors = validateForm();
    if (Object.keys(customErrors).length > 0) {
      setFormErrors(customErrors);
      toast.error("Please fill in all required fields.");
      setIsProcessing(false);
      return;
    }
    setFormErrors({});

    const orderData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      street: formData.street,
      suburb: formData.suburb,
      postcode: formData.postcode,
      state: formData.state,
      country: formData.country,
      outlet: formData.outlet,
      notes: formData.orderNotes,
      orderType: formData.orderType,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      menu: orderItems.map((item) => ({
        menuId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount: total,
      paymentMethod,
    };

    // --- LOGIC FOR CASH ORDERS (simple) ---
    if (paymentMethod === "cash") {
      setModalState({
        isOpen: true,
        status: "loading",
        message: "Placing your order...",
      });
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to place order");
        }
        const result = await res.json();
        dispatch({ type: "CLEAR_CART" });
        setModalState({
          isOpen: true,
          status: "success",
          deliveryCode: result.data.deliveryCode,
          orderId: result.data._id,
        });
      } catch (err) {
        setModalState({ isOpen: true, status: "error", message: err.message });
      } finally {
        setIsProcessing(false);
      }
      return; // End execution for cash orders
    }

    // --- LOGIC FOR ONLINE ORDERS (follows Stripe's required flow) ---
    if (!stripe || !elements) {
      toast.error("Payment system is not ready. Please try again.");
      setIsProcessing(false);
      return;
    }

    // STEP 1: Trigger client-side validation from Stripe Elements
    const { error: submitError } = await elements.submit();
    if (submitError) {
      toast.error(submitError.message);
      setIsProcessing(false);
      return;
    }

    let orderToCancel = null;
    try {
      // Show processing modal immediately
      setModalState({
        isOpen: true,
        status: "processing",
        message: "Creating your order...",
      });

      // STEP 2: Create order and Payment Intent on your server
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create order on server");
      }
      const { clientSecret, data: order } = await res.json();
      orderToCancel = order;

      // Update modal to show payment processing
      setModalState({
        isOpen: true,
        status: "processing",
        message: "Processing your payment...",
      });

      // STEP 3: Confirm the payment with Stripe using the clientSecret
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?orderId=${order._id}`,
        },
      });

      // This code will only run if an immediate error occurs.
      // Otherwise, the user is redirected to the return_url.
      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      if (orderToCancel) {
        try {
          await fetch("/api/cancel/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderToCancel._id,
              deliveryCode: orderToCancel.deliveryCode,
            }),
          });
          // toast.info("Your order was automatically cancelled.");
        } catch (cancelError) {
          // console.error("Failed to automatically cancel order:", cancelError);
          // toast.error(
          //   "Payment failed and we couldn't cancel the order automatically. Please contact support."
          // );
        }
      }
      setModalState({
        isOpen: true,
        status: "error",
        message: `Payment failed: ${err.message}. Your order has been cancelled.`,
      });
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      status: "",
      message: "",
      deliveryCode: "",
      orderId: "",
    });
  };

  if (!isClient) {
    return (
      <div className="bg-white min-h-screen p-4 sm-p-8">
        <div className="max-w-6xl mx-auto text-center">
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MaintenanceWrapper>
        {Object.values(onlineOutlets).some((status) => status === true) ? (
          <>
            <section
              className="relative h-[60vh] md:h-[400px] bg-cover bg-center"
              style={{ backgroundImage: "url('/images/aboutbg.webp')" }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
                <h1 className="text-5xl md:text-6xl header-font">CheckOut</h1>
                <Image
                  src="/images/underline.png"
                  alt="decorative underline"
                  width={150}
                  height={50}
                  className="mt-2"
                />
              </div>
            </section>
            <div className="bg-white min-h-screen p-4 sm:p-8">
              {modalState.isOpen && (
                <StatusModal
                  status={modalState.status}
                  message={modalState.message}
                  deliveryCode={modalState.deliveryCode}
                  orderId={modalState.orderId}
                  onClose={closeModal}
                />
              )}
              <div className="max-w-6xl mx-auto sansita-regular">
                <h1 className="text-4xl mb-4 sansita-regular-italic">
                  Your Order Details
                </h1>
                <form
                  onSubmit={handlePlaceOrder}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                >
                  <div>
                    <div className="mt-6 mb-6">
                      <h3 className="text-xl mb-4">Payment Method</h3>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={paymentMethod === "online"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-radio"
                          />
                          <span className="ml-2">Pay and Pickup</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={paymentMethod === "cash"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="form-radio"
                          />
                          <span className="ml-2">Payment on Pickup</span>
                        </label>
                      </div>
                    </div>
                    <div ref={formRef} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label>First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            placeholder="First name *"
                            className={`border p-2 rounded w-full ${
                              formErrors.firstName
                                ? "border-red-500"
                                : "bg-gray-100"
                            }`}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                          />
                          {formErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label>Last Name</label>

                          <input
                            type="text"
                            name="lastName"
                            placeholder="Last name *"
                            className={`border p-2 rounded w-full ${
                              formErrors.lastName
                                ? "border-red-500"
                                : "bg-gray-100"
                            }`}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                          />
                          {formErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label>Phone no.</label>

                        <input
                          type="tel"
                          name="phone"
                          placeholder="e.g. 61XXXXXXXXXX"
                          className={`border p-2 rounded w-full ${
                            formErrors.phone ? "border-red-500" : "bg-gray-100"
                          }`}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label>Email address</label>

                        <input
                          type="email"
                          name="email"
                          placeholder="Email address *"
                          className={`border p-2 rounded w-full ${
                            formErrors.email ? "border-red-500" : "bg-gray-100"
                          }`}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          value={formData.email}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label>Outlet</label>

                        <select
                          name="outlet"
                          className={`border p-2 rounded w-full ${
                            formErrors.outlet ? "border-red-500" : "bg-gray-100"
                          }`}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          value={formData.outlet}
                        >
                          {onlineOutlets["ENGADINE"] && (
                            <option value="Engadine">
                              ENGADINE - 13-15 Station Street, Engadine NSW 2333
                            </option>
                          )}
                          {onlineOutlets["HURSTVILLE"] && (
                            <option value="Hurstville">
                              HURSTVILLE - 362 Forest Rd, Hurstville NSW 2220
                            </option>
                          )}
                        </select>
                        {formErrors.outlet && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.outlet}
                          </p>
                        )}
                      </div>
                      <div>
                        <label>Notes</label>
                        <textarea
                          name="orderNotes"
                          placeholder="Notes about your order, e.g. special notes for delivery."
                          className="border p-2 rounded w-full h-24  bg-gray-100"
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                        ></textarea>
                      </div>
                    </div>
                    {formData.orderType === "pickup" && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4">
                          Pickup Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label>Date</label>

                            <input
                              type="date"
                              name="pickupDate"
                              className={`border p-2 rounded w-full ${
                                formErrors.pickupDate
                                  ? "border-red-500"
                                  : "bg-gray-100"
                              }`}
                              onChange={handleInputChange}
                            />
                            {formErrors.pickupDate && (
                              <p className="text-red-500 text-sm mt-1">
                                {formErrors.pickupDate}
                              </p>
                            )}
                          </div>
                          <div>
                            <label>Time</label>

                            <input
                              type="time"
                              name="pickupTime"
                              className={`border p-2 rounded w-full ${
                                formErrors.pickupTime
                                  ? "border-red-500"
                                  : "bg-gray-100"
                              }`}
                              onChange={handleInputChange}
                            />
                            {formErrors.pickupTime && (
                              <p className="text-red-500 text-sm mt-1">
                                {formErrors.pickupTime}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="border rounded-md p-6 bg-gray-50">
                      <h2
                        className="text-2xl font-bold mb-4"
                        style={{ fontFamily: "serif" }}
                      >
                        Your order
                      </h2>
                      <div className="space-y-3 border-b pb-3">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>Product</span>
                          <span>Subtotal</span>
                        </div>
                        {orderItems.map((item) => (
                          <div key={item._id} className="flex justify-between">
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 py-3 border-b">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>
                        {formErrors.menu && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.menu}
                          </p>
                        )}
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <div className="text-right">
                            <span className="font-bold">
                              ${total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {paymentMethod === "online" && (
                        <div className="mt-4">
                          <PaymentElement />
                        </div>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-[#f5a623] text-white font-bold py-3 rounded-full mt-6 hover:bg-orange-500 transition-colors"
                        disabled={
                          isProcessing ||
                          (paymentMethod === "online" && !stripe)
                        }
                      >
                        {isProcessing ? "Processing..." : "Place Order"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="h-[90vh] flex items-center justify-center bg-gray-50">
              <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-lg">
                <div className="flex justify-center mb-6">
                  {/* Optional icon */}
                  <svg
                    className="w-16 h-16 text-orange-500 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-semibold mb-4 text-gray-800 sansita-regular">
                  We are not receiving orders for the moment
                </p>
                <p className="text-2xl  mb-4 text-gray-800 sansita-regular">
                  U can order after sometime.
                </p>
              </div>
            </div>
          </>
        )}
      </MaintenanceWrapper>
    </>
  );
};

export default CheckOutForm;
