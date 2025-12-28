import React from "react";
import ContactPage from "./ContactPage";

// app/contact/page.js
export const metadata = {
  title: "Contact Us",
  description: "Reach out to Pancetta",
  openGraph: {
    title: "Contact Us | Pancetta",
    description: "Reach out to Pancetta",
    images: ["/logo.png"], // relative paths now resolve correctly
    type: "website",
  },
};

export default function Contact() {
  return <ContactPage />;
}
