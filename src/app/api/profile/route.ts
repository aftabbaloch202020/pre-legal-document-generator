import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword, comparePassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    // Change password if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const isValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile." }, { status: 500 });
  }
}
