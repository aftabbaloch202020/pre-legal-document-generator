import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-key-change-in-production-saas-32"
);

const AUTH_COOKIE_NAME = "prelegal_auth_token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  let sessionUser: { id: string; role: string; email: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      sessionUser = {
        id: payload.id as string,
        role: payload.role as string,
        email: payload.email as string,
      };
    } catch {
      sessionUser = null;
    }
  }

  // Check Admin Routes
  const isAdminRoute = pathname.startsWith("/dashboard/admin") || pathname.startsWith("/api/admin");
  if (isAdminRoute) {
    if (!sessionUser) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
    }
    if (sessionUser.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Forbidden: Admin access required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Check Protected Dashboard and API Routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/documents") ||
    pathname.startsWith("/api/profile");

  if (isProtectedRoute && !sessionUser) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login or register, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && sessionUser) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/documents/:path*",
    "/api/profile/:path*",
    "/api/admin/:path*",
  ],
};
