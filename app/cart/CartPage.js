"use client";
import { useState, useMemo, useContext, useEffect } from "react";
import Image from "next/image";
import { IoCloseCircleOutline } from "react-icons/io5";
import { CartContext } from "../context/CartContext";
import Link from "next/link";
import MaintenanceWrapper from "@/components/MaintainenceWrapper";

const ViewCartPage = () => {
  const { state, dispatch } = useContext(CartContext);
  const { items: cartItems = [] } = state || {};
  const [shippingCost, setShippingCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchShippingCost = async () => {
      try {
        const res = await fetch("/api/shipping");
        if (!res.ok) {
          throw new Error("Failed to fetch shipping cost");
        }
        const { data } = await res.json();
        setShippingCost(data.deliveryCharge);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingCost();
  }, []);

  const handleQuantityChange = (item, delta) => {
    if (delta > 0) {
      dispatch({ type: "ADD_ITEM", payload: item });
    } else {
      dispatch({ type: "DECREMENT_ITEM", payload: item });
    }
  };

  const handleRemoveItem = (item) => {
    dispatch({ type: "REMOVE_ITEM", payload: item });
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const total = subtotal + shippingCost;

  if (!isClient) {
    return (
      <div className="bg-white min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto text-center">
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto text-center py-16">
          <h1 className="text-3xl font-semibold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href="/order"
            className="bg-[#f5a623] text-white font-bold py-3 px-6 rounded-full hover:bg-orange-500"
          >
            Start Ordering
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <MaintenanceWrapper>
        <section
          className="relative h-[60vh] md:h-[400px] bg-cover bg-center"
          style={{ backgroundImage: "url('/images/aboutbg.webp')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-5xl md:text-6xl header-font">My Cart</h1>
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
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 ">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-2">
              <div className="hidden sm:grid grid-cols-6 gap-4 text-left font-semibold text-gray-600 border-b pb-2 sansita-regular">
                <div className="col-span-3">Product</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-1">Quantity</div>
                <div className="col-span-1 text-right">Subtotal</div>
              </div>
              <div className="border-b">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-4 sm:grid-cols-6 gap-4 items-center py-4 border-b last:border-b-0 poppins-regular"
                  >
                    {/* Product Details */}
                    <div className="col-span-4 sm:col-span-3 flex items-center gap-4">
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <IoCloseCircleOutline size={24} />
                      </button>
                      <Image
                        src={item.image || "/logo.png"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded"
                      />
                      <span className=" ">{item.name}</span>
                    </div>
                    {/* Price */}
                    <div className="hidden sm:block col-span-1 font-medium">
                      ${item.price.toFixed(2)}
                    </div>
                    {/* Quantity */}
                    <div className="col-span-2 sm:col-span-1">
                      <div className="flex items-center border rounded-md w-max">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          readOnly
                          className="w-12 text-center border-l border-r"
                        />
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="px-3 py-1 text-lg text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Subtotal */}
                    <div className="col-span-2 sm:col-span-1 text-right font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4"></div>
            </div>

            {/* Right Column: Cart Totals */}
            <div className="lg:col-span-1 sansita-regular-italic">
              <div className=" flex flex-col border rounded-md p-6">
                <h2 className="text-2xl font-bold mb-4">Cart totals</h2>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between border-b pb-2">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex  justify-between border-b pb-2">
                    <span className="text-sm">
                      Shipping cost will be calculated on checkout page
                    </span>
                    {/* {loading ? (
                      <span>Loading...</span>
                    ) : error ? (
                      <span className="text-red-500">Error</span>
                    ) : (
                      <span className="font-semibold">
                        ${shippingCost.toFixed(2)}
                      </span>
                    )} */}
                  </div>
                  {/* <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <div>
                      <div className="text-right">${total.toFixed(2)}</div>
                    </div>
                  </div> */}
                </div>
                <Link
                  href={"/checkout"}
                  className="w-full text-center bg-[#f5a623] text-white font-bold py-2 rounded-full mt-6 hover:bg-orange-500"
                >
                  Proceed to checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MaintenanceWrapper>
    </>
  );
};

export default ViewCartPage;
