import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes&lt;HTMLButtonElement&gt;,
    VariantProps&lt;typeof buttonVariants&gt; {
  asChild?: boolean;
}

export const Button = React.forwardRef&lt;HTMLButtonElement, ButtonProps&gt;(
  ({ className, variant, size, asChild, ...props }, ref) =&gt; {
    const Comp: any = asChild ? Slot : "button";
    return (
      &lt;Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} /&gt;
    );
  }
);
Button.displayName = "Button";

export default Button;