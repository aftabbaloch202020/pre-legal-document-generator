import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const template = await prisma.template.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found." },
        { status: 404 }
      );
    }

    const parsedTemplate = {
      ...template,
      fieldsSchema: JSON.parse(template.fieldsSchema),
    };

    return NextResponse.json({
      success: true,
      template: parsedTemplate,
    });
  } catch (error: any) {
    console.error("Fetch single template error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch template." },
      { status: 500 }
    );
  }
}
