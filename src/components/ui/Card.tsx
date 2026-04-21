import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "outlined" | "premium" | "editorial";
  interactive?: boolean;
}

const variantClasses = {
  default: "bg-cream shadow-[var(--shadow-editorial)]",
  flat: "bg-cream",
  outlined: "bg-cream border border-sage-200",
  premium:
    "bg-cream shadow-[var(--shadow-editorial-lg)] ring-[1.5px] ring-clay-500/30",
  editorial:
    "bg-linen border-l-[3px] border-clay-800 shadow-[var(--shadow-editorial)]",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", interactive, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[20px] overflow-hidden transition-all duration-200",
          variantClasses[variant],
          interactive &&
            "cursor-pointer hover:shadow-[0_10px_36px_rgba(28,42,33,0.1)] hover:-translate-y-0.5 active:scale-[0.99]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-[22px]", className)} {...props} />;
}
