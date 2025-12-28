"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FiArrowUp } from "react-icons/fi";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Hide on specific pages
  const isAdminPage = pathname.startsWith("/admin");
  const isChefPage = pathname.startsWith("/chef");
  const isWaiterPage = pathname.startsWith("/waiter");
  const isMenuPage = pathname.startsWith("/menu");
  const isLoginPage = pathname.startsWith("/login");

  const hideButton =
    isAdminPage || isChefPage || isWaiterPage || isMenuPage || isLoginPage;

  // Show button after scrolling down 200px
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible || hideButton) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-50 bg-black text-white h-10 w-10 md:w-16 md:h-16 rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
    >
      <FiArrowUp size={24} />
    </button>
  );
};

export default ScrollToTopButton;
