import React from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { DocumentPreview } from "@/components/document/DocumentPreview";

export default async function DocumentViewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      template: {
        include: { category: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!document) {
    notFound();
  }

  // Ownership verification
  if (document.userId !== session.id && session.role !== "ADMIN") {
    redirect("/dashboard/documents");
  }

  return (
    <div className="pb-16">
      <DocumentPreview
        documentId={document.id}
        title={document.title}
        templateTitle={document.template.title}
        categoryName={document.template.category.name}
        content={document.generatedContent}
        createdAt={document.createdAt.toISOString()}
        updatedAt={document.updatedAt.toISOString()}
        userName={document.user.name}
        editUrl={`/dashboard/documents/${document.id}/edit`}
      />
    </div>
  );
}
