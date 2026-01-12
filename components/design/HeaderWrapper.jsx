"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const HeaderWrapper = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");
  const isChefPage = pathname.startsWith("/chef");
  const isWaiterPage = pathname.startsWith("/waiter");
  const isCashierPage = pathname.startsWith("/cashier");
  const isMenuPage = pathname.startsWith("/menu");
  const isLoginPage = pathname.startsWith("/login");
  const isChangePasswordPage = pathname.startsWith("/change-password");

  const hideHeader =
    isHomePage ||
    isAdminPage ||
    isChefPage ||
    isWaiterPage ||
    isCashierPage ||
    isMenuPage ||
    isLoginPage ||
    isChangePasswordPage;

  return !hideHeader ? (
    <div className="bg-black z-[1000] md:bg-white">
      <Header />
    </div>
  ) : null;
};

export default HeaderWrapper;
