import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pre Legal Document Generator | Fast Pre-Legal Document Creation",
  description:
    "Generate structured, pre-legal documents from reusable customizable templates in minutes. Not legal advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
