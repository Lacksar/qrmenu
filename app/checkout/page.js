"use client";
import React, { Suspense } from "react";
import CheckoutFlow from "./CheckoutFlow";

export default function Checkout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutFlow />
    </Suspense>
  );
}

// "use client";
// import React from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import CheckOutForm from "./CheckOutForm";

// const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// );

// export default function Checkout() {
//   const options = {
//     mode: "payment",
//     amount: 1099,
//     currency: "aud",
//     // For more options, see https://stripe.com/docs/js/elements_object/create#stripe_elements_create-options
//   };
//   return (
//     <Elements stripe={stripePromise} options={options}>
//       <CheckOutForm />
//     </Elements>
//   );
// }
