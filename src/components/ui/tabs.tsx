import * as React from "react"
import { motion } from "motion/react"
import { cn } from "../../lib/utils"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; onValueChange: (value: string) => void }
>(({ className, value, onValueChange, ...props }, ref) => {
  const layoutId = React.useId();
  return (
    <div
      ref={ref}
      className={cn("relative flex space-x-1 rounded-lg bg-black/40 p-1", className)}
      {...props}
    >
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          const isActive = child.props.value === value;
          return React.cloneElement(child, {
            // @ts-ignore
            active: isActive,
            onClick: () => onValueChange(child.props.value),
            pillLayoutId: isActive ? layoutId : undefined,
          })
        }
        return child
      })}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; active?: boolean; pillLayoutId?: string }
>(({ className, active, pillLayoutId, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        active ? "text-white" : "text-white/60 hover:text-white",
        className
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId={pillLayoutId}
          className="absolute inset-0 bg-[#15151F] border border-white/5 rounded-md shadow-sm -z-10"
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
      )}
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

export { Tabs, TabsTrigger }
