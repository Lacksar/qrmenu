// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Define protected routes with regex and corresponding methods
const protectedRoutes = [
  { regex: /^\/api\/categories$/, methods: ["POST"], roles: ["admin"] },
  {
    regex: /^\/api\/categories\/.*$/,
    methods: ["PUT", "DELETE"],
    roles: ["admin"],
  },
  { regex: /^\/api\/products$/, methods: ["POST"], roles: ["admin"] },
  {
    regex: /^\/api\/products\/.*$/,
    methods: ["PUT", "DELETE"],
    roles: ["admin"],
  },
  {
    regex: /^\/api\/details$/,
    methods: ["POST", "PUT", "DELETE"],
    roles: ["admin"],
  },
  {
    regex: /^\/api\/details\/.*$/,
    methods: ["PUT", "DELETE"],
    roles: ["admin"],
  },
  { regex: /^\/api\/upload$/, methods: ["POST"], roles: ["admin"] },
  {
    regex: /^\/api\/orders$/,
    methods: ["GET"],
    roles: ["admin", "chef", "waiter"],
  },
  {
    regex: /^\/api\/reservations$/,
    methods: ["GET"],
    roles: ["admin", "waiter"],
  },
  {
    regex: /^\/api\/orders\/.*$/,
    methods: ["GET", "PUT", "DELETE"],
    roles: ["admin", "chef", "waiter"],
  },
  { regex: /^\/api\/delivery$/, methods: ["POST"], roles: ["admin"] },
  { regex: /^\/api\/online\/.*\/turnon$/, methods: ["PUT"], roles: ["admin"] },
  { regex: /^\/api\/online\/.*\/turnoff$/, methods: ["PUT"], roles: ["admin"] },
  { regex: /^\/api\/users$/, methods: ["GET", "POST"], roles: ["admin"] },
  {
    regex: /^\/api\/users\/.*$/,
    methods: ["PATCH", "DELETE"],
    roles: ["admin"],
  },
  { regex: /^\/api\/tables$/, methods: ["POST"], roles: ["admin"] },
  {
    regex: /^\/api\/tables\/.*$/,
    methods: ["PATCH", "DELETE"],
    roles: ["admin", "waiter"],
  },
  {
    regex: /^\/api\/table-orders$/,
    methods: ["GET"],
    roles: ["admin", "chef", "waiter", "cashier"],
  },
  {
    regex: /^\/api\/table-orders\/.*$/,
    methods: ["PATCH", "DELETE"],
    roles: ["admin", "chef", "waiter", "cashier"],
  },
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const { method } = req;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow the public cancel route to pass through
  if (pathname === "/api/cancel/order" && method === "POST") {
    return NextResponse.next();
  }

  // Allow public access to menu and table orders creation
  if (pathname === "/api/menu" && method === "GET") {
    return NextResponse.next();
  }
  if (pathname === "/api/table-orders" && method === "POST") {
    return NextResponse.next();
  }
  if (pathname === "/api/tables" && method === "GET") {
    return NextResponse.next();
  }

  console.log(`Request: ${method} ${pathname}`);

  const protectedRoute = protectedRoutes.find(
    (route) => route.regex.test(pathname) && route.methods.includes(method)
  );

  if (protectedRoute) {
    console.log(`Protected route matched: ${method} ${pathname}`);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      console.log("No token found, returning 401");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Special case: Allow users to update their own profile (PATCH /api/users/[id])
    if (pathname.startsWith("/api/users/") && method === "PATCH") {
      const userId = pathname.split("/api/users/")[1];
      if (token.id === userId) {
        console.log("User updating own profile, allowing");
        return NextResponse.next();
      }
    }

    // Check if user has required role
    const userRole = token.role || (token.isAdmin ? "admin" : null);
    if (!userRole || !protectedRoute.roles.includes(userRole)) {
      console.log(`User role ${userRole} not authorized, returning 403`);
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    console.log(`User role ${userRole} verified, proceeding`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*", // Apply middleware to all API routes
};
