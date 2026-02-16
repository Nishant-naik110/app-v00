import React from "react";
import { FileX, Search, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconType?: "file" | "search" | "inbox" | "custom";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  height?: string | number;
}

const EmptyState = ({
  title = "No Data Found",
  description,
  icon,
  iconType = "file",
  action,
  className,
  height = "400px",
}:EmptyStateProps) => {
  const getDefaultIcon = () => {
    switch (iconType) {
      case "search":
        return <Search className="h-12 w-12 text-gray-400" />;
      case "inbox":
        return <Inbox className="h-12 w-12 text-gray-400" />;
      case "file":
      default:
        return <FileX className="h-12 w-12 text-gray-400" />;
    }
  };

  const displayIcon = icon || getDefaultIcon();
  const heightValue = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full",
        className
      )}
      style={{ height: heightValue }}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center px-4">
        {/* Icon */}
        <div className="flex items-center justify-center">{displayIcon}</div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-body font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-subBody text-gray-500 dark:text-gray-400 max-w-md">
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 px-4 py-2 text-subBody font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

