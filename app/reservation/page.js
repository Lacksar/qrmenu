import React from "react";
import ReservationPage from "./ReservationPage";

// app/reservation/page.js
export const metadata = {
  title: "Reservation",
  description: "Book a table at Pancetta quickly and easily online.",
  openGraph: {
    title: "Reservation | Pancetta",
    description: "Book a table at Pancetta quickly and easily online.",
    type: "website",
    images: ["/logo.png"], // optional
  },
  twitter: {
    card: "summary_large_image",
    title: "Reservation | Pancetta",
    description: "Book a table at Pancetta quickly and easily online.",
    images: ["/logo.png"],
    creator: "@pancetta",
  },
};

export default function Reservation() {
  return <ReservationPage />;
}
