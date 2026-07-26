import * as React from "react";

export const Select = ({
  value,
  onChange,
  disabled,
  children,
  className = "",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`flex h-9 rounded-md border border-line bg-plaster px-3 py-1 text-sm text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </select>
  );
};
