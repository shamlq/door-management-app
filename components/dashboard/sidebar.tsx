"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { CloseIcon, NavIcon } from "./icons";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  permissions: string[];
};

export function Sidebar({
  open,
  onClose,
  permissions,
}: SidebarProps) {


  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:shrink-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-800 px-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 ring-1 ring-amber-500/40">
              <svg
                className="h-5 w-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.125c.621 0 1.125-.504 1.125-1.125V9.375M8.25 21H4.875c-.621 0-1.125-.504-1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125h3.375m9.75 12.75h3.375c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125h-3.375m-9.75 0V5.25A2.25 2.25 0 0110.5 3h3a2.25 2.25 0 012.25 2.25v4.125"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                DoorHub ERP
              </p>
              <p className="truncate text-xs text-slate-500">Order Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>
          <ul className="space-y-0.5">
            {navItems
  .filter(
    (item) =>
      !item.permission ||
      (permissions ?? []).includes(item.permission)
  )
  .map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <NavIcon
                      name={item.icon}
                      className={`w-5 h-5 shrink-0 ${isActive ? "text-amber-400" : ""}`}
                    />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-800/50 p-3 ring-1 ring-slate-700/50">
            <p className="text-xs font-medium text-slate-300">Need help?</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Contact support for order issues
            </p>
            <button
              type="button"
              className="mt-2 w-full rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              Get Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
