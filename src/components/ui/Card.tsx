import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card p-6", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-text-primary", className)} {...rest}>
      {children}
    </h3>
  );
}