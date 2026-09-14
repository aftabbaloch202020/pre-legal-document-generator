import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const template = await prisma.template.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        fieldsSchema: JSON.parse(template.fieldsSchema),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
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

    const schemaStr =
      typeof fieldsSchema === "string" ? fieldsSchema : JSON.stringify(fieldsSchema);

    const updated = await prisma.template.update({
      where: { id },
      data: {
        title,
        slug: slug.toLowerCase(),
        description,
        categoryId,
        contentTemplate,
        fieldsSchema: schemaStr,
        isPopular: Boolean(isPopular),
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      template: {
        ...updated,
        fieldsSchema: JSON.parse(updated.fieldsSchema),
      },
      message: "Template updated successfully.",
    });
  } catch (error: any) {
    console.error("Update template error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update template." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete template error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template." },
      { status: 500 }
    );
  }
}
