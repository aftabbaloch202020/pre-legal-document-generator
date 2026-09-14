import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { validateFormData, interpolateTemplate } from "@/lib/template-engine";
import { FieldDefinition } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";

    const where: any = {
      userId: user.id,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { generatedContent: { contains: search } },
      ];
    }

    if (category && category !== "all") {
      where.template = {
        category: {
          slug: category,
        },
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "title") orderBy = { title: "asc" };

    const documents = await prisma.document.findMany({
      where,
      orderBy,
      include: {
        template: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const parsedDocs = documents.map((doc) => ({
      ...doc,
      formData: JSON.parse(doc.formData),
    }));

    return NextResponse.json({
      success: true,
      documents: parsedDocs,
    });
  } catch (error: any) {
    console.error("Fetch documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user documents." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { templateId, title, formData } = body;

    if (!templateId || !title || !formData) {
      return NextResponse.json(
        { success: false, error: "Missing required document data." },
        { status: 400 }
      );
    }

    // Load template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        category: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found." },
        { status: 404 }
      );
    }

    const fieldsSchema: FieldDefinition[] = JSON.parse(template.fieldsSchema);

    // Validate form inputs
    const validation = validateFormData(fieldsSchema, formData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for one or more fields.",
          errors: validation.errors,
        },
        { status: 422 }
      );
    }

    // Interpolate template content
    const generatedContent = interpolateTemplate(template.contentTemplate, formData);

    // Save document
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        templateId: template.id,
        title: title.trim(),
        status: "GENERATED",
        formData: JSON.stringify(formData),
        generatedContent,
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        formData: JSON.parse(document.formData),
      },
      message: "Document successfully generated and saved.",
    });
  } catch (error: any) {
    console.error("Create document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate document." },
      { status: 500 }
    );
  }
}
