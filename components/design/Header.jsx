"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); // 👈 get current route

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        const { data } = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // helper to get link color based on active route
  const linkClass = (path) =>
    pathname === path
      ? "text-[#e59b2f] font-semibold transition-colors"
      : "hover:text-[#e59b2f] transition-colors";

  return (
    <nav className="container sansita-regular mx-auto px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Caffé Pancetta Logo"
          width={100}
          height={100}
          className="w-24 md:w-28"
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/" className={linkClass("/")}>
          Home
        </Link>
        <Link href="/about" className={linkClass("/about")}>
          About Us
        </Link>
        <Link href="/menu" className={linkClass("/menu")}>
          Menu
        </Link>
        <Link href="/reservation" className={linkClass("/reservation")}>
          Reservation
        </Link>
        <Link href="/contact" className={linkClass("/contact")}>
          Contact
        </Link>
        <Link
          href="/order"
          className={`${
            pathname === "/order"
              ? "bg-[#c98522]"
              : "bg-[#e59b2f] hover:bg-[#c98522]"
          } text-white px-5 py-2 rounded-full transition-colors`}
        >
          Pickup Order
        </Link>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <button className="text-white text-2xl bg-black p-1 rounded-sm">
              <FiMenu />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-black/80 text-white border-r-0"
          >
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
            <div className="flex flex-col items-center space-y-8 mt-10">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/menu", label: "Menu" },
                { href: "/reservation", label: "Reservation" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)} // 👈 close sidebar when clicked
                  className={`text-2xl ${
                    pathname === href
                      ? "text-[#e59b2f] font-semibold"
                      : "hover:text-[#e59b2f]"
                  } transition-colors`}
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/order"
                onClick={() => setIsMenuOpen(false)} // 👈 close sidebar on click
                className={`${
                  pathname === "/order"
                    ? "bg-[#c98522]"
                    : "bg-[#e59b2f] hover:bg-[#c98522]"
                } text-white px-5 py-2 rounded-full transition-colors text-xl`}
              >
                Pickup Order
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Header;
