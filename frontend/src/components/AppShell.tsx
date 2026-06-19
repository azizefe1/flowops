"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { removeToken } from "@/lib/auth";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Orders",
    href: "/orders",
  },
  {
    label: "Audit Logs",
    href: "/audit-logs",
  },
];

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const router = useRouter();

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <a href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
              FlowOps
            </a>

            <h1 className="mt-2 text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}

            <a
              href="/"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Home
            </a>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </nav>

        {children}
      </div>
    </main>
  );
}