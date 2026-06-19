"use client";

import { useEffect, useState } from "react";

import { getToken, removeToken } from "@/lib/auth";

export default function DashboardPage() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getToken();

    setHasToken(Boolean(token));
  }, []);

  function handleLogout() {
    removeToken();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold">FlowOps Dashboard</h1>
            <p className="text-sm text-slate-400">
              Frontend and backend connection foundation
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </nav>

        <section className="py-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Login Status
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              {hasToken ? "Authenticated" : "No token found"}
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              {hasToken
                ? "The access token was saved successfully. In the next stage, this dashboard will fetch real organization and dashboard summary data from the backend."
                : "Please login first to save an access token."}
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="/"
                className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Home
              </a>

              <a
                href="/login"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}