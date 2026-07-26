import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-line bg-plaster px-3 py-2 text-sm text-ink ring-offset-plaster file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
});
Input.displayName = "Input";
