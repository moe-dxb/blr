"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Minimal scroll area without radix dependency

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
      <div className="h-full w-full rounded-[inherit] overflow-auto">
        {children}
      </div>
      {/* Decorative custom scrollbar can be added via tailwind utilities if needed */}
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <div
      ref={ref}
      data-orientation={orientation}
      className={cn(
        "pointer-events-none absolute select-none transition-colors",
        orientation === "vertical" && "right-0 top-0 h-full w-2.5",
        orientation === "horizontal" && "bottom-0 left-0 w-full h-2.5",
        className
      )}
      {...props}
    />
  )
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }