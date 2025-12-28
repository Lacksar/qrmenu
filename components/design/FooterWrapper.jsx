"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const FooterWrapper = () => {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const isChefPage = pathname.startsWith("/chef");
  const isWaiterPage = pathname.startsWith("/waiter");
  const isMenuPage = pathname.startsWith("/menu");
  const isLoginPage = pathname.startsWith("/login");

  const hideFooter =
    isAdminPage || isChefPage || isWaiterPage || isMenuPage || isLoginPage;

  return !hideFooter ? <Footer /> : null;
};

export default FooterWrapper;
