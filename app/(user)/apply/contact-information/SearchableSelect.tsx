"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type SearchableItem = {
  key: string;
  label: string;
  icon?: string;
};

export function SearchableSelect<T extends SearchableItem>({
  items,
  value,
  onChange,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  disabled = false,
  emptyLabel = "No matches",
}: {
  items: T[];
  value: string;
  onChange: (item: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyLabel?: string;
}) {
  const selected = items.find((i) => i.key === value);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-left disabled:bg-gray-50/50 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              {selected.icon && <span>{selected.icon}</span>}
              <span className="truncate">{selected.label}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-2 py-2 text-sm outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && <li className="px-4 py-3 text-sm text-gray-400">{emptyLabel}</li>}
            {filtered.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(item);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                    item.key === value ? "bg-gray-50 font-medium" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {item.icon && <span>{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.key === value && <Check className="w-4 h-4 text-[#171717] shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
