import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 px-4 py-2";
    const styles = variant === "outline"
      ? "border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-100"
      : "bg-zinc-900 text-white hover:bg-black";
    return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";


