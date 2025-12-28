"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const HeaderWrapper = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");
  const isChefPage = pathname.startsWith("/chef");
  const isWaiterPage = pathname.startsWith("/waiter");
  const isMenuPage = pathname.startsWith("/menu");
  const isLoginPage = pathname.startsWith("/login");

  const hideHeader =
    isHomePage ||
    isAdminPage ||
    isChefPage ||
    isWaiterPage ||
    isMenuPage ||
    isLoginPage;

  return !hideHeader ? (
    <div className="bg-black z-[1000] md:bg-white">
      <Header />
    </div>
  ) : null;
};

export default HeaderWrapper;
