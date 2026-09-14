import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};

    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [templates, categories] = await Promise.all([
      prisma.template.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [{ isPopular: "desc" }, { title: "asc" }],
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    // Parse fieldsSchema into JSON for convenience
    const parsedTemplates = templates.map((t) => ({
      ...t,
      fieldsSchema: JSON.parse(t.fieldsSchema),
    }));

    return NextResponse.json({
      success: true,
      templates: parsedTemplates,
      categories,
    });
  } catch (error: any) {
    console.error("Fetch templates error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document templates." },
      { status: 500 }
    );
  }
}
