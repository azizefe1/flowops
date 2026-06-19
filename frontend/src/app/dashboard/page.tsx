"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total_amount: string;
  created_at: string;
};

type LowStockItem = {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
};

type DashboardSummary = {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_order_value: string;
  total_inventory_movements: number;
  recent_orders: RecentOrder[];
  low_stock_items: LowStockItem[];
};

const emptyDashboard: DashboardSummary = {
  total_products: 0,
  active_products: 0,
  low_stock_products: 0,
  total_orders: 0,
  pending_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  total_order_value: "0.00",
  total_inventory_movements: 0,
  recent_orders: [],
  low_stock_items: [],
};

export default function DashboardPage() {
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [dashboard, setDashboard] =
    useState<DashboardSummary>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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

        const dashboardSummary = await apiRequest<DashboardSummary>(
          `/api/organizations/${selectedOrganization.id}/dashboard`,
          {
            token,
          },
        );

        setDashboard(dashboardSummary);
      } catch {
        setErrorMessage("Dashboard data could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const cards = [
    {
      label: "Total Products",
      value: dashboard.total_products,
    },
    {
      label: "Active Products",
      value: dashboard.active_products,
    },
    {
      label: "Low Stock Products",
      value: dashboard.low_stock_products,
    },
    {
      label: "Total Orders",
      value: dashboard.total_orders,
    },
    {
      label: "Pending Orders",
      value: dashboard.pending_orders,
    },
    {
      label: "Completed Orders",
      value: dashboard.completed_orders,
    },
    {
      label: "Cancelled Orders",
      value: dashboard.cancelled_orders,
    },
    {
      label: "Inventory Movements",
      value: dashboard.total_inventory_movements,
    },
  ];

  return (
    <AppShell
      title="FlowOps Dashboard"
      subtitle={organization ? organization.name : "Backend connected dashboard"}
    >
      {isLoading ? (
        <section className="py-12">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-slate-300">Loading dashboard data...</p>
          </div>
        </section>
      ) : errorMessage ? (
        <section className="py-12">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-red-200">
            {errorMessage}
          </div>
        </section>
      ) : (
        <>
          <section className="py-10">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Live Backend Data
              </p>

              <h2 className="mt-4 text-4xl font-bold">Operations Summary</h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                This dashboard fetches organization and summary data directly
                from the FastAPI backend using the saved JWT access token.
              </p>

              <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-300">
                Total Order Value:{" "}
                <span className="ml-2 font-semibold text-cyan-300">
                  {dashboard.total_order_value}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {card.value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 py-10 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-xl font-semibold">Recent Orders</h3>

              <div className="mt-6 space-y-4">
                {dashboard.recent_orders.length > 0 ? (
                  dashboard.recent_orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-slate-400">
                            {order.customer_name}
                          </p>
                        </div>

                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No recent orders found.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-xl font-semibold">Low Stock Items</h3>

              <div className="mt-6 space-y-4">
                {dashboard.low_stock_items.length > 0 ? (
                  dashboard.low_stock_items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-slate-400">
                            SKU: {item.sku}
                          </p>
                        </div>

                        <span className="rounded-full bg-red-400/10 px-3 py-1 text-sm text-red-200">
                          {item.stock_quantity} left
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No low stock items found.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}