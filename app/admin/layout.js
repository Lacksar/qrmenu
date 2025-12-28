"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  Truck,
  Menu,
  Users,
  Table as TableIcon,
  QrCode,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const NavLink = ({ href, children, className }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary",
        className
      )}
    >
      {children}
    </Link>
  );
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login?callbackUrl=/admin");
    },
  });

  if (status === "loading") {
    return null; // Or a loading spinner
  }

  if (!session?.user?.isAdmin) {
    router.replace("/"); // Fallback for non-admins
    return null;
  }

  const NavLinks = (
    <nav className="grid items-start gap-2 text-sm font-medium">
      <NavLink href="/admin">
        <Home className="h-4 w-4" />
        Dashboard
      </NavLink>
      <NavLink href="/admin/orders">
        <ShoppingCart className="h-4 w-4" />
        Orders
      </NavLink>
      <NavLink href="/admin/table-orders">
        <UtensilsCrossed className="h-4 w-4" />
        Table Orders
      </NavLink>
      <NavLink href="/admin/menu">
        <Package className="h-4 w-4" />
        Menus
      </NavLink>
      <NavLink href="/admin/categories">
        <ClipboardList className="h-4 w-4" />
        Categories
      </NavLink>
      <NavLink href="/admin/details">
        <Truck className="h-4 w-4" />
        Details
      </NavLink>
      <NavLink href="/admin/reservations">
        <ClipboardList className="h-4 w-4" />
        Reservations
      </NavLink>
      <NavLink href="/admin/tables">
        <TableIcon className="h-4 w-4" />
        Tables
      </NavLink>
      <NavLink href="/admin/qr-codes">
        <QrCode className="h-4 w-4" />
        QR Codes
      </NavLink>
      <NavLink href="/admin/users">
        <Users className="h-4 w-4" />
        Users
      </NavLink>
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="">Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">{NavLinks}</div>
        </div>
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Package className="h-6 w-6" />
                <span>Admin Panel</span>
              </div>
              {NavLinks}
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}
