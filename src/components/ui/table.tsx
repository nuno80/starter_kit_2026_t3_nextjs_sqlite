import * as React from "react";

export const Table = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`border-b border-line bg-plaster-deep ${className}`} {...props} />
);

export const TableBody = ({ className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`divide-y divide-line ${className}`} {...props} />
);

export const TableRow = ({ className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`transition-colors hover:bg-plaster-warm/50 ${className}`} {...props} />
);

export const TableHead = ({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`h-10 px-4 text-left align-middle font-serif font-medium text-ink-soft ${className}`} {...props} />
);

export const TableCell = ({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-4 align-middle text-ink ${className}`} {...props} />
);
