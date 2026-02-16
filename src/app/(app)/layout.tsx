"use client";
import AppLayout from "@/components/layouts/AppLayout";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout
  showScrollProgress={true}
  showScrollToTop={true}
  >
    {children}</AppLayout>;
}



