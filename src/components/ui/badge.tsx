import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#06b6d4]/10 text-[#06b6d4] dark:bg-[#06b6d4]/20",
        secondary:
          "border-gray-200 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        destructive:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        outline:
          "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400",
        success:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        error:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        info:
          "border-transparent bg-[#06b6d4]/10 text-[#06b6d4] dark:bg-[#06b6d4]/20",
        light:
          "border-gray-200 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        blue:
          "border-transparent bg-[#0f7aff]/10 text-[#0f7aff] dark:bg-[#0f7aff]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
