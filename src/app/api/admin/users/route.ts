import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role or user ID." },
        { status: 400 }
      );
    }

    // Protect against self-demotion if only admin
    if (userId === session.id && role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "You cannot demote your own admin account." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User role changed to ${role}.`,
      user: updated,
    });
  } catch (error: any) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user role." },
      { status: 500 }
    );
  }
}
