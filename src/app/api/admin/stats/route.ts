import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin required." }, { status: 403 });
    }

    const [
      totalUsers,
      totalDocuments,
      totalTemplates,
      totalCategories,
      recentUsers,
      recentDocuments,
      templateCounts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.template.count(),
      prisma.category.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { documents: true } },
        },
      }),
      prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          template: { select: { title: true } },
        },
      }),
      prisma.template.findMany({
        select: {
          id: true,
          title: true,
          _count: { select: { documents: true } },
        },
        orderBy: { documents: { _count: "desc" } },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDocuments,
        totalTemplates,
        totalCategories,
        recentUsers,
        recentDocuments,
        templateUsage: templateCounts.map((t) => ({
          title: t.title,
          count: t._count.documents,
        })),
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch admin stats." }, { status: 500 });
  }
}
