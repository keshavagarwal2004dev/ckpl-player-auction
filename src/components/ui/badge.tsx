import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        outline: "text-foreground border-border",
        live: "border-transparent bg-destructive text-destructive-foreground animate-pulse",
        national: "border-transparent bg-gradient-to-r from-amber-500 to-yellow-500 text-black",
        state: "border-transparent bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground",
        district: "border-transparent bg-gradient-to-r from-violet-500 to-purple-500 text-white",
        school: "border-transparent bg-gradient-to-r from-emerald-500 to-green-500 text-white",
        others: "border-transparent bg-secondary text-secondary-foreground",
        basketball: "border-transparent bg-gradient-to-r from-orange-500 to-amber-500 text-white",
        football: "border-transparent bg-gradient-to-r from-emerald-500 to-green-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
