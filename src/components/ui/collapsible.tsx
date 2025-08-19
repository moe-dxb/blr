"use client"

import * as React from "react"

type CollapsibleContextType = {
  open: boolean
  setOpen: (v: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null)

interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const Collapsible = ({ open, defaultOpen, onOpenChange, ...props }: RootProps) => {
  const [internal, setInternal] = React.useState<boolean>(defaultOpen ?? false)
  const isControlled = open !== undefined
  const state = isControlled ? (open as boolean) : internal

  const setOpen = (v: boolean) => {
    if (!isControlled) setInternal(v)
    onOpenChange?.(v)
  }

  return (
    <CollapsibleContext.Provider value={{ open: state, setOpen }}>
      <div data-state={state ? "open" : "closed"} {...props} />
    </CollapsibleContext.Provider>
  )
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const ctx = React.useContext(CollapsibleContext)
    return (
      <button
        ref={ref}
        data-state={ctx?.open ? "open" : "closed"}
        onClick={(e) => {
          ctx?.setOpen(!ctx.open)
          onClick?.(e)
        }}
        {...props}
      />
    )
  }
)

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, ...props }, ref) => {
  const ctx = React.useContext(CollapsibleContext)
  return (
    <div
      ref={ref}
      hidden={!ctx?.open}
      data-state={ctx?.open ? "open" : "closed"}
      style={style}
      {...props}
    />
  )
})

export { Collapsible, CollapsibleTrigger, CollapsibleContent }