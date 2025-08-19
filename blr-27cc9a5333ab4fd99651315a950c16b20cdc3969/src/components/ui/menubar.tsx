"use client"

import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

// Lightweight Menubar replacement without radix dependency
// API-compatible enough for existing usages in this repo

type BaseProps = React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }

function MenubarMenu({ ...props }: BaseProps) {
  return <div data-slot="menubar-menu" {...props} />
}

function MenubarGroup({ ...props }: BaseProps) {
  return <div data-slot="menubar-group" {...props} />
}

function MenubarPortal({ ...props }: BaseProps) {
  return <div data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({ ...props }: BaseProps) {
  return <div role="radiogroup" data-slot="menubar-radiogroup" {...props} />
}

function MenubarSub({ ...props }: BaseProps) {
  return <div data-slot="menubar-sub" {...props} />
}

const Menubar = React.forwardRef<HTMLDivElement, BaseProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
      className
    )}
    {...props}
  />
))
Menubar.displayName = "Menubar"

const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
)
MenubarTrigger.displayName = "MenubarTrigger"

const MenubarSubTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { inset?: boolean }>(
  ({ className, inset, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  )
)
MenubarSubTrigger.displayName = "MenubarSubTrigger"

const MenubarSubContent = React.forwardRef<HTMLDivElement, BaseProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = "MenubarSubContent"

const MenubarContent = React.forwardRef<HTMLDivElement, BaseProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    />
  )
)
MenubarContent.displayName = "MenubarContent"

const MenubarItem = React.forwardRef<HTMLDivElement, BaseProps & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
)
MenubarItem.displayName = "MenubarItem"

const MenubarCheckboxItem = React.forwardRef<HTMLDivElement, BaseProps & { checked?: boolean }>(
  ({ className, children, checked, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
        className
      )}
      role="menuitemcheckbox"
      aria-checked={!!checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked ? <Check className="h-4 w-4" /> : null}
      </span>
      {children}
    </div>
  )
)
MenubarCheckboxItem.displayName = "MenubarCheckboxItem"

const MenubarRadioItem = React.forwardRef<HTMLDivElement, BaseProps & { checked?: boolean }>(
  ({ className, children, checked, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground",
        className
      )}
      role="menuitemradio"
      aria-checked={!!checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked ? <Circle className="h-2 w-2 fill-current" /> : null}
      </span>
      {children}
    </div>
  )
)
MenubarRadioItem.displayName = "MenubarRadioItem"

const MenubarLabel = React.forwardRef<HTMLDivElement, BaseProps & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
      {...props}
    />
  )
)
MenubarLabel.displayName = "MenubarLabel"

const MenubarSeparator = React.forwardRef<HTMLDivElement, BaseProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
MenubarSeparator.displayName = "MenubarSeparator"

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}