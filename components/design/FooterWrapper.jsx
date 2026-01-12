"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const FooterWrapper = () => {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const isChefPage = pathname.startsWith("/chef");
  const isWaiterPage = pathname.startsWith("/waiter");
  const isCashierPage = pathname.startsWith("/cashier");
  const isMenuPage = pathname.startsWith("/menu");
  const isLoginPage = pathname.startsWith("/login");
  const isChangePasswordPage = pathname.startsWith("/change-password");

  const hideFooter =
    isAdminPage ||
    isChefPage ||
    isWaiterPage ||
    isCashierPage ||
    isMenuPage ||
    isLoginPage ||
    isChangePasswordPage;

  return !hideFooter ? <Footer /> : null;
};

export default FooterWrapper;
