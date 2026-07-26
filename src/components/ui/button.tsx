import * as React from "react";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "destructive" | "outline" }
>(({ className = "", variant = "default", ...props }, ref) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-4 py-2 cursor-pointer";
  const variants = {
    default: "bg-terracotta text-plaster hover:bg-terracotta-d font-serif",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-line bg-transparent hover:bg-plaster-deep text-ink",
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Button.displayName = "Button";
