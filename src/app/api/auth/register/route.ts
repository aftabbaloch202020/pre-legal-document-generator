import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailNormalized,
        passwordHash,
        role: "USER",
      },
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
    };

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Registration successful.",
      user: sessionUser,
    });

    // Set cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
