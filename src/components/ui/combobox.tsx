"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import clsx from "clsx";

export interface ComboboxOption {
  value: number;
  label: string;
  description?: string;
}

interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  emptyMessage?: string;
  hasError?: boolean;
}

export function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  emptyMessage = "Nenhum resultado encontrado.",
  hasError,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const filtered =
    query.trim() === ""
      ? options
      : options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm",
          "transition-shadow duration-150",
          "focus:outline-none focus:ring-2",
          hasError
            ? "border-red-300 focus:border-red-500 focus:ring-red-500/30"
            : "border-slate-300 focus:border-primary-500 focus:ring-primary-500/30"
        )}
      >
        <span className={clsx("truncate", selected ? "text-slate-900" : "text-slate-400")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full animate-scale-in rounded-lg border border-slate-200 bg-white shadow-popover">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            {selected && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setQuery("");
                }}
                className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <ul className="max-h-56 overflow-y-auto py-1 scrollbar-thin">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</li>}
            {filtered.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full flex-col items-start px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                    option.value === value && "bg-primary-50"
                  )}
                >
                  <span className="text-slate-900">{option.label}</span>
                  {option.description && <span className="text-xs text-slate-500">{option.description}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
