import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        "ring-1 ring-inset ring-black/5",
        className
      )}
      {...props}
    />
  );
}
