import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent dark:before:via-white/20",
        "after:absolute after:inset-0 after:bg-gradient-to-r after:from-gray-200 after:via-gray-100 after:to-gray-200 dark:after:from-gray-800 dark:after:via-gray-700 dark:after:to-gray-800",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

