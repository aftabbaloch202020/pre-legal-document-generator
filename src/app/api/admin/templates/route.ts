import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const templates = await prisma.template.findMany({
      include: {
        category: true,
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedTemplates = templates.map((t) => ({
      ...t,
      fieldsSchema: JSON.parse(t.fieldsSchema),
    }));

    return NextResponse.json({
      success: true,
      templates: parsedTemplates,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      categoryId,
      contentTemplate,
      fieldsSchema,
      isPopular,
    } = body;

    if (!title || !slug || !description || !categoryId || !contentTemplate || !fieldsSchema) {
      return NextResponse.json(
        { success: false, error: "Missing required template fields." },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.template.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "A template with this slug already exists." },
        { status: 409 }
      );
    }

    const schemaStr =
      typeof fieldsSchema === "string" ? fieldsSchema : JSON.stringify(fieldsSchema);

    const template = await prisma.template.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        categoryId,
        contentTemplate,
        fieldsSchema: schemaStr,
        isPopular: Boolean(isPopular),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        fieldsSchema: JSON.parse(template.fieldsSchema),
      },
      message: "Template created successfully.",
    });
  } catch (error: any) {
    console.error("Create template error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template." },
      { status: 500 }
    );
  }
}
