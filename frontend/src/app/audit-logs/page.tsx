"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type AuditLog = {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: { [key: string]: JsonValue } | null;
  created_at: string;
};

function getActionClass(action: string) {
  if (action.includes("created")) {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (action.includes("updated") || action.includes("changed")) {
    return "bg-cyan-400/10 text-cyan-300";
  }

  if (action.includes("deactivated") || action.includes("cancelled")) {
    return "bg-red-400/10 text-red-200";
  }

  return "bg-yellow-400/10 text-yellow-200";
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleString();
}

export default function AuditLogsPage() {
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAuditLogs() {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const organizations = await apiRequest<Organization[]>(
          "/api/organizations",
          {
            token,
          },
        );

        if (organizations.length === 0) {
          setErrorMessage("No organization found for this user.");
          return;
        }

        const selectedOrganization = organizations[0];

        setOrganization(selectedOrganization);

        const logs = await apiRequest<AuditLog[]>(
          `/api/organizations/${selectedOrganization.id}/audit-logs`,
          {
            token,
          },
        );

        setAuditLogs(logs);
      } catch {
        setErrorMessage("Audit logs could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAuditLogs();
  }, [router]);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-sm text-slate-400">
              {organization ? organization.name : "FlowOps activity history"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Dashboard
            </a>

            <a
              href="/products"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Products
            </a>

            <a
              href="/orders"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Orders
            </a>

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

        <section className="py-10">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Live Backend Data
            </p>

            <h2 className="mt-4 text-4xl font-bold">Activity History</h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              This page fetches audit logs directly from the FastAPI backend and
              displays important organization actions such as product changes,
              inventory movements, order creation, and order status updates.
            </p>

            <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-300">
              Total Audit Logs:{" "}
              <span className="ml-2 font-semibold text-cyan-300">
                {auditLogs.length}
              </span>
            </div>
          </div>
        </section>

        {isLoading ? (
          <section>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <p className="text-slate-300">Loading audit logs...</p>
            </div>
          </section>
        ) : errorMessage ? (
          <section>
            <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-red-200">
              {errorMessage}
            </div>
          </section>
        ) : auditLogs.length === 0 ? (
          <section>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <h3 className="text-xl font-semibold">No audit logs found</h3>
              <p className="mt-3 text-slate-400">
                Create or update products, orders, or inventory movements to see
                audit logs here.
              </p>
            </div>
          </section>
        ) : (
          <section className="space-y-5">
            {auditLogs.map((auditLog) => (
              <div
                key={auditLog.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm ${getActionClass(
                        auditLog.action,
                      )}`}
                    >
                      {auditLog.action}
                    </span>

                    <h3 className="mt-4 text-xl font-semibold">
                      {auditLog.entity_type}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Created at: {formatDate(auditLog.created_at)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <p>
                      Entity ID:{" "}
                      <span className="text-slate-400">
                        {auditLog.entity_id || "N/A"}
                      </span>
                    </p>
                    <p className="mt-2">
                      User ID:{" "}
                      <span className="text-slate-400">
                        {auditLog.user_id || "System"}
                      </span>
                    </p>
                  </div>
                </div>

                {auditLog.details && (
                  <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                    {JSON.stringify(auditLog.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}