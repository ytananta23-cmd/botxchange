import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "demo" | "real";
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-white/10 text-white": variant === "default",
          "border-transparent bg-white/5 text-white/70": variant === "secondary",
          "border-transparent bg-red-500/20 text-red-500": variant === "destructive",
          "border-transparent bg-green-500/20 text-green-500": variant === "success",
          "border-transparent bg-blue-500/20 text-blue-400": variant === "demo",
          "border-transparent bg-purple-500/20 text-purple-400": variant === "real",
          "text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
