"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: number[] | number
  defaultValue?: number[] | number
  onValueChange?: (val: number[]) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, defaultValue, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const isControlled = value !== undefined
    const controlledVal = Array.isArray(value) ? value[0] : (value as number | undefined)
    const [internal, setInternal] = React.useState<number>(() => {
      if (controlledVal !== undefined) return controlledVal
      const dv = Array.isArray(defaultValue) ? defaultValue[0] : (defaultValue as number | undefined)
      return dv ?? min
    })

    const current = isControlled ? (controlledVal as number) : internal

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      if (!isControlled) setInternal(v)
      onValueChange?.([v])
    }

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div className="absolute h-full bg-primary" style={{ width: `${((current - min) / (max - min)) * 100}%` }} />
        </div>
        <input
          type="range"
          ref={ref}
          className="absolute inset-0 opacity-0 cursor-pointer"
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={handleChange}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }