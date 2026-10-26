import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300 focus-visible:ring-primary-500",
  secondary:
    "bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400 focus-visible:ring-primary-500",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 focus-visible:ring-red-500",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300 focus-visible:ring-primary-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-colors duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:shadow-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
