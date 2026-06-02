"use client";

import { BellIcon, MenuIcon, SearchIcon } from "./icons";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      <div className="flex flex-1 items-center gap-4 min-w-0">
        <div className="hidden sm:block min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 truncate dark:text-slate-400">
            Door & hardware order overview
          </p>
        </div>

        <div className="relative ml-auto flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search orders, customers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <BellIcon />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">Operations Manager</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white ring-2 ring-slate-200">
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
