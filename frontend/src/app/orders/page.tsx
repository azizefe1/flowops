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

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  line_total: string;
};

type Order = {
  id: string;
  organization_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  status: string;
  total_amount: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

type OrderListResponse = {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

const orderStatuses = [
  "all",
  "pending",
  "approved",
  "shipped",
  "completed",
  "cancelled",
];

function getStatusClass(status: string) {
  if (status === "completed") {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (status === "cancelled") {
    return "bg-red-400/10 text-red-200";
  }

  if (status === "approved" || status === "shipped") {
    return "bg-cyan-400/10 text-cyan-300";
  }

  return "bg-yellow-400/10 text-yellow-200";
}

export default function OrdersPage() {
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        let selectedOrganization = organization;

        if (!selectedOrganization) {
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

          selectedOrganization = organizations[0];
          setOrganization(selectedOrganization);
        }

        const queryParams = new URLSearchParams({
          page: String(currentPage),
          page_size: "6",
        });

        if (selectedStatus !== "all") {
          queryParams.set("status", selectedStatus);
        }

        const orderList = await apiRequest<OrderListResponse>(
          `/api/organizations/${selectedOrganization.id}/orders?${queryParams.toString()}`,
          {
            token,
          },
        );

        setOrders(orderList.items);
        setTotalOrders(orderList.total);
        setCurrentPage(orderList.page);
        setTotalPages(orderList.pages);
      } catch {
        setErrorMessage("Orders could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [router, organization, currentPage, selectedStatus]);

  const visibleOrderValue = orders.reduce((total, order) => {
    if (order.status === "cancelled") {
      return total;
    }

    return total + Number(order.total_amount);
  }, 0);

  function handleStatusChange(status: string) {
    setSelectedStatus(status);
    setCurrentPage(1);
  }

  return (
    <AppShell
      title="Orders"
      subtitle={organization ? organization.name : "FlowOps order management"}
    >
      <section className="py-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Live Backend Data
          </p>

          <h2 className="mt-4 text-4xl font-bold">Customer Orders</h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            This page fetches paginated and filterable customer orders directly
            from the FastAPI backend using the saved JWT token and the selected
            organization.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {totalOrders}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Visible Active Orders</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">
                {orders.filter((order) => order.status !== "cancelled").length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Visible Order Value</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">
                {visibleOrderValue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-300">Status Filter</p>

            <div className="mt-3 flex flex-wrap gap-3">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    selectedStatus === status
                      ? "border-cyan-300 bg-cyan-300 text-slate-950"
                      : "border-white/10 text-slate-200 hover:border-cyan-300/60"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-slate-300">Loading orders...</p>
          </div>
        </section>
      ) : errorMessage ? (
        <section>
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-red-200">
            {errorMessage}
          </div>
        </section>
      ) : orders.length === 0 ? (
        <section>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h3 className="text-xl font-semibold">No orders found</h3>
            <p className="mt-3 text-slate-400">
              Try a different status filter or create orders from Swagger or the
              backend API.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-5 lg:grid-cols-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {order.order_number}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Customer: {order.customer_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.customer_email || "No customer email"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p className="text-xs text-slate-500">Total Amount</p>
                    <p className="mt-1 font-medium text-emerald-300">
                      {order.total_amount}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <p className="text-xs text-slate-500">Items</p>
                    <p className="mt-1 font-medium">{order.items.length}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-300">
                    Order Items
                  </p>

                  <div className="mt-3 space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-400">
                              Product ID
                            </p>
                            <p className="mt-1 max-w-[220px] truncate text-sm text-slate-200">
                              {item.product_id}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-slate-400">
                              Qty: {item.quantity}
                            </p>
                            <p className="mt-1 font-medium text-cyan-300">
                              {item.line_total}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-300">
              Page{" "}
              <span className="font-semibold text-cyan-300">
                {totalPages === 0 ? 0 : currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-cyan-300">{totalPages}</span>
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={totalPages === 0 || currentPage >= totalPages}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
