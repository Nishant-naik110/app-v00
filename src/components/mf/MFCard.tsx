import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface MFCardProps {
  title: string;
  titleClass?: string;
  description?: string;
  descriptionClass?: string;
  loading?: boolean;
  children?: React.ReactNode;
  align: "left" | "center" | "right";
}

export default function MFCard({
  title,
  titleClass,
  loading,
  children,
  description,
  descriptionClass,
  align = "left",
}: MFCardProps) {
  if (loading)
    return (
      <Card className="w-full">
        <div className="flex content-center justify-center">Loading</div>
      </Card>
    );
  return (
    <Card className={`text-${align}`}>
      <CardHeader>
        <CardTitle className={titleClass}>{title}</CardTitle>
        {description && (
          <CardDescription className={descriptionClass}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
