import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { validateFormData, interpolateTemplate } from "@/lib/template-engine";
import { FieldDefinition } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    // Ownership check (only document owner or admin can view)
    if (document.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not own this document." },
        { status: 403 }
      );
    }

    const parsedDocument = {
      ...document,
      formData: JSON.parse(document.formData),
      template: {
        ...document.template,
        fieldsSchema: JSON.parse(document.template.fieldsSchema),
      },
    };

    return NextResponse.json({
      success: true,
      document: parsedDocument,
    });
  } catch (error: any) {
    console.error("Fetch document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, formData } = body;

    const existingDoc = await prisma.document.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    // Ownership check
    if (existingDoc.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not own this document." },
        { status: 403 }
      );
    }

    const fieldsSchema: FieldDefinition[] = JSON.parse(
      existingDoc.template.fieldsSchema
    );

    // Validate inputs
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

    // Re-generate content
    const updatedContent = interpolateTemplate(
      existingDoc.template.contentTemplate,
      formData
    );

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title: title ? title.trim() : existingDoc.title,
        formData: JSON.stringify(formData),
        generatedContent: updatedContent,
      },
      include: {
        template: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        ...updatedDocument,
        formData: JSON.parse(updatedDocument.formData),
      },
      message: "Document successfully updated and re-generated.",
    });
  } catch (error: any) {
    console.error("Update document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update document." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const existingDoc = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    // Ownership check
    if (existingDoc.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have permission to delete this document." },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document." },
      { status: 500 }
    );
  }
}
