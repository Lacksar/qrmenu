import React from "react";
import OrderPage from "./OrderPage";

// app/order/page.js
export const metadata = {
  title: "Order Online",
  description: "Order your favorite Pancetta dishes quickly and easily online.",
  openGraph: {
    title: "Order Online | Pancetta",
    description:
      "Order your favorite Pancetta dishes quickly and easily online.",
    type: "website",
    images: ["/logo.png"], // optional
  },
  twitter: {
    card: "summary_large_image",
    title: "Order Online | Pancetta",
    description:
      "Order your favorite Pancetta dishes quickly and easily online.",
    images: ["/logo.png"],
    creator: "@pancetta",
  },
};

export default function Order() {
  return <OrderPage />;
}
