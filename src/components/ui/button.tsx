import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/25",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-lg shadow-success/25",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-lg shadow-warning/25",
        outline: "border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-foreground transition-colors",
        secondary: "bg-secondary/80 text-secondary-foreground hover:bg-secondary shadow-lg shadow-secondary/25",
        ghost: "hover:bg-white/10 text-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        bid: "bg-gradient-to-r from-warning to-amber-500 text-warning-foreground font-bold hover:from-amber-500 hover:to-warning shadow-lg shadow-warning/30 hover:shadow-warning/50 active:scale-95",
        hero: "bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-lg hover:shadow-primary/50 shadow-lg shadow-primary/40 transition-all hover:-translate-y-1 active:translate-y-0",
        glow: "bg-primary text-white animate-pulse shadow-lg shadow-primary/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
