import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-subBody ring-offset-background file:border-0 file:bg-transparent file:text-subBody file:font-medium file:text-foreground placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50 dark:text-white",
  {
    variants: {
      sx: {
        default: "px-3 py-2 h-10",
        sm: "h-8 p-1",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      sx: "default",
    },
  },
);
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ sx, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ sx, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
