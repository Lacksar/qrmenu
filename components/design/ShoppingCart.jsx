"use client";

import { useState, useMemo, useContext, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { BsTrash } from "react-icons/bs";
import { CartContext } from "@/app/context/CartContext";
import Link from "next/link";

const ShoppingCart = () => {
  const { state, dispatch } = useContext(CartContext);
  const { items: cartItems = [] } = state || {};
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // marks that we are on client
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

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const total = subtotal; // Assuming no other charges for now

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white w-16 h-16 rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors relative"
        >
          <FiShoppingCart size={24} />
          {isClient && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:max-w-sm bg-white shadow-xl z-[10000] transform transition-transform duration-300 ease-in-out sansita-regular ${
          isOpen ? "translate-x-0 shadow-2xl shadow-black" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          {isClient && (
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {totalItems} item{totalItems !== 1 ? "s" : ""} in cart
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-2xl">
                <IoClose className="border-2 border-white rounded-full" />
              </button>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto bg-gray-100 p-4 space-y-4">
            {isClient &&
              cartItems.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{item.name}</h3>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <BsTrash size={18} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <span className="text-gray-700 mr-4">
                        ${item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className="px-2 py-1 text-lg"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="px-2 py-1 text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <hr className="mt-4" />
                </div>
              ))}
          </div>

          {/* Footer/Summary */}
          <div className="bg-white p-4 border-t">
            {isClient && (
              <div className="my-4 space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <hr className="border-dashed" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total </span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="delivery_option"
                  value="pickup"
                  className="form-radio h-4 w-4 text-green-600"
                  defaultChecked
                />
                <span className="ml-2 text-gray-800">Pickup</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href={"/cart"}
                className="text-center w-full px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                View Cart
              </Link>
              <Link
                href={"/checkout"}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 text-center"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;
