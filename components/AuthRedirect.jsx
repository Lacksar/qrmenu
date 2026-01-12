"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect from home page or login page
    if (
      (pathname === "/" || pathname === "/login") &&
      status === "authenticated" &&
      session?.user
    ) {
      if (session.user.role === "admin") {
        router.push("/admin");
      } else if (session.user.role === "chef") {
        router.push("/chef");
      } else if (session.user.role === "waiter") {
        router.push("/waiter");
      } else if (session.user.role === "cashier") {
        router.push("/cashier/pos");
      }
    }
  }, [status, session, router, pathname]);

  return null;
}
