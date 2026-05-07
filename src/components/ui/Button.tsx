import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-600/20 active:scale-[0.98]",
      secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 active:scale-[0.98]",
      outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm active:scale-[0.98]",
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-[0.98]",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
