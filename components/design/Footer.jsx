"use client";

import Link from "next/link";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FaChevronUp } from "react-icons/fa";

const Footer = () => {
  const footerBgImage = "/images/pizzabg2.webp";

  return (
    <footer className="relative text-white bg-black/30">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(/images/pizzabg2.webp)` }}
        aria-hidden="true"
      />

      {/* Dark Overlay to improve text readability */}
      <div
        className="absolute inset-0 bg-black/50 bg-opacity-70"
        aria-hidden="true"
      ></div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="mb-6">
          <BsFillTelephoneFill className="text-orange-500 text-4xl" />
        </div>

        <h2 className="font-serif text-3xl md:text-4xl font-normal mb-6">
          Call Us for Any Kind Of Enquiries
        </h2>

        <div className="space-y-3 text-2xl md:text-3xl font-serif mb-12">
          <Link
            href={"tel:+61 02 7251 1826"}
            className="text-shadow-lg underline"
          >
            (02) 7251 1826 (Engadine)
          </Link>
          <br />
          <br />
          <Link
            href={"tel:+61 00 9570 4443"}
            className="text-shadow-lg underline"
          >
            (00) 9570 4443 (Hurstville)
          </Link>
        </div>

        <div className="text-xs sm:text-sm text-gray-200 font-sans tracking-wide">
          <span>Copyright © 2025 </span>
          <span className="mx-2">|</span>
          <span>Caffé Pancetta</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
