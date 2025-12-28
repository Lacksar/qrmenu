"use client";

import { createContext, useReducer, useEffect } from "react";

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload;
      const items = state.items || [];
      const existingItem = items.find((item) => item._id === newItem._id);
      const updatedItems = existingItem
        ? items.map((item) =>
            item._id === newItem._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...items, { ...newItem, quantity: 1 }];
      return { ...state, items: updatedItems };
    }
    case "REMOVE_ITEM": {
      const items = state.items || [];
      const updatedItems = items.filter(
        (item) => item._id !== action.payload._id
      );
      return { ...state, items: updatedItems };
    }
    case "DECREMENT_ITEM": {
      const items = state.items || [];
      const existingItem = items.find(
        (item) => item._id === action.payload._id
      );

      if (!existingItem) {
        return state;
      }

      const updatedItems =
        existingItem.quantity === 1
          ? items.filter((item) => item._id !== action.payload._id)
          : items.map((item) =>
              item._id === action.payload._id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            );
      return { ...state, items: updatedItems };
    }
    case "CLEAR_CART": {
      return { ...state, items: [] };
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const isClient = typeof window !== "undefined";

  const getInitialState = () => {
    if (!isClient) {
      return { items: [] };
    }
    try {
      const storedState = localStorage.getItem("cart");
      const parsedState = storedState ? JSON.parse(storedState) : {};
      return { items: [], ...parsedState };
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return { items: [] };
    }
  };

  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("cart", JSON.stringify(state));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [state, isClient]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
