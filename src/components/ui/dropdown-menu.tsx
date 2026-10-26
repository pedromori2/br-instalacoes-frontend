"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, items, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>

      {open && (
        <div
          className={clsx(
            "absolute z-20 mt-1 w-56 animate-scale-in rounded-lg border border-slate-200 bg-white py-1 shadow-popover",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={clsx(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition-colors",
                "hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
              )}
            >
              {item.icon && <item.icon size={15} className="shrink-0 text-slate-400" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
