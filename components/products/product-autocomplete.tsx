"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchProductsAction } from "@/lib/actions/products";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/status-config";

type ProductAutocompleteProps = {
  onSelect: (product: Product) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function ProductAutocomplete({
  onSelect,
  placeholder = "Search products by name or category...",
  disabled,
}: ProductAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const items = await searchProductsAction(q);
      setResults(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
      {open && (query.length > 0 || results.length > 0) && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
          {loading && (
            <li className="px-3 py-2 text-xs text-slate-500">Searching...</li>
          )}
          {!loading && results.length === 0 && query.length > 0 && (
            <li className="px-3 py-2 text-xs text-slate-500">No products found</li>
          )}
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                  setOpen(false);
                  setResults([]);
                }}
              >
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {p.name}
                </span>
                <span className="ml-2 text-xs text-slate-500">
                  {p.category} · {formatCurrency(p.basePrice)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
