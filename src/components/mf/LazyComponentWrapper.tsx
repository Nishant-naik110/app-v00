"use client";
import React, { Suspense, ReactNode } from "react";

interface LazyComponentWrapperProps {
  children: ReactNode;
}

export default function LazyComponentWrapper({
  children,
}: LazyComponentWrapperProps) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

