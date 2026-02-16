import { cn } from "@/lib/utils";
import React from "react";

export function MFDivider({
  children,
  direction = "horizontal",
}: {
  children?: React.ReactNode;
  direction?: "horizontal" | "vertical";
}) {
  return (
    <div
      className={cn("flex items-center gap-2", {
        "w-full": direction === "horizontal",
        "h-full": direction === "vertical",
        "flex-col": direction === "vertical",
      })}
    >
      <span
        className={cn("bg-slate-200 dark:bg-slate-700", {
          "h-0.5 w-full": direction === "horizontal",
          "h-full w-0.5": direction === "vertical",
        })}
      ></span>
      <p className="text-xs text-card-foreground">{children ?? "OR"}</p>
      <span
        className={cn("bg-slate-200 dark:bg-slate-700", {
          "h-0.5 w-full": direction === "horizontal",
          "h-full w-0.5": direction === "vertical",
        })}
      ></span>
    </div>
  );
}
