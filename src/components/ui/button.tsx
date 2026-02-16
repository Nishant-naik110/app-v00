import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center dark:text-white justify-center whitespace-nowrap rounded-md text-subBody font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:opacity-75 rounded-full capitalize",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 capitalize",
        outline:
          "border border-input border-primary dark:border-gray-400 bg-background hover:bg-accent hover:text-accent-foreground capitalize dark:text-accent-foreground dark:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:text-slate-800 capitalize",
        ghost: "hover:bg-accent hover:text-accent-foreground capitalize dark:text-white",
        link: "text-primary underline-offset-4 hover:underline capitalize",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-6 rounded-md px-2 py-1",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-xs": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
