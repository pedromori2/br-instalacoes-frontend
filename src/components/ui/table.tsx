import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import clsx from "clsx";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function Thead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx("border-b border-slate-200 bg-slate-50", className)} {...props} />;
}

export function Tbody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={clsx("divide-y divide-slate-100", className)} {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={clsx("transition-colors duration-100 hover:bg-slate-50", className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx("px-4 py-3 text-sm text-slate-700", className)} {...props} />;
}
