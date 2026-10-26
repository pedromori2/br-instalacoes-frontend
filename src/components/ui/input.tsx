import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900",
          "placeholder:text-slate-400",
          "transition-shadow duration-150",
          "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
