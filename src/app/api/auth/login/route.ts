import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const emailNormalized = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "USER" | "ADMIN",
    };

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: sessionUser,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
