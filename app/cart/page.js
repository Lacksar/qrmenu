import React from "react";
import ViewCartPage from "./CartPage";

// app/cart/page.js
export const metadata = {
  title: "Cart",
  description: "Review your Pancetta order before checkout.",
  openGraph: {
    title: "Cart | Pancetta",
    description: "Review your Pancetta order before checkout.",
    type: "website",
    images: ["/logo.png"], // optional
  },
  twitter: {
    card: "summary_large_image",
    title: "Cart | Pancetta",
    description: "Review your Pancetta order before checkout.",
    images: ["/logo.png"],
    creator: "@pancetta",
  },
};

export default function CartPage() {
  return <ViewCartPage />;
}
