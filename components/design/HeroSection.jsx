"use client";
import Image from "next/image";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Header from "./Header";

const HeroSection = () => {
  return (
    <header
      className="bg-cover bg-center h-screen text-white"
      style={{ backgroundImage: "url('/herobg.webp')" }}
    >
      <div className="bg-opacity-50 h-full flex flex-col">
        {/* Navigation */}
        <Header />

        {/* Hero Content */}
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl md:text-8xl pancetta-header-font">
            Caffé Pancetta
          </h1>
          <p className="text-lg md:text-xl mt-4 max-w-md sansita-normal">
            Fully Licensed Italian Cafe & Restaurant
          </p>
          <div className="mt-8 space-x-4 sansita-regular">
            <Link
              href="/reservation"
              className="bg-[#e59b2f] text-white px-8 py-3 rounded-full text-lg hover:bg-[#c98522] transition-colors"
            >
              Reservation
            </Link>
            <Link
              href="/order"
              className="bg-[#e59b2f] text-white px-8 py-3 rounded-full text-lg hover:bg-[#c98522] transition-colors"
            >
              Pickup Order
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="w-12 border-t-2 border-gray-300"></span>
            <p className="text-lg tracking-widest font-semibold sansita-regular">
              Lunch | Dinner
            </p>
            <span className="w-12 border-t-2 border-gray-300"></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
