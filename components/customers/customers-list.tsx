"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Tables } from "@/lib/supabase/database.types";

type Customer = Tables<"customers">;

type Props = {
  customers: Customer[];
};

export function CustomersList({ customers }: Props) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return customers;

    return customers.filter((c) =>
      [
        c.name,
        c.email,
        c.phone,
        c.address,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(q)
        )
    );
  }, [customers, search]);

  return (
    <>
      <div className="border-b border-slate-100 px-5 py-4">
        <input
          type="search"
          placeholder="Search customer name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">
          No matching customers found.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filteredCustomers.map((c) => (
            <li key={c.id}>
              <Link
                href={`/customers/${c.id}`}
                className="block px-5 py-4 hover:bg-slate-50/50"
              >
                <p className="font-medium text-slate-900">
                  {c.name}
                </p>

                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.phone}</span>}
                  {c.address && <span>{c.address}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}