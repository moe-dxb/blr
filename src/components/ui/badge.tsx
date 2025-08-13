import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Badge: React.FC<BadgeProps> = ({ className, ...props }) => {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs", className)} {...props} />
  );
};

export default Badge;