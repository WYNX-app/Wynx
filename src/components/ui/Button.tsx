import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils"; // função simples de merge

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gradient";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-text-primary shadow-cta hover:bg-accent-hover",
  secondary:
    "bg-bg-surface text-text-primary border border-border-strong hover:bg-[#FAF5FF]",
  ghost:
    "bg-transparent text-text-secondary hover:bg-bg-soft/60",
  danger:
    "bg-danger text-white hover:brightness-95",
  gradient:
    "bg-brand-gradient text-white shadow-card hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-violet/40",
        "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";