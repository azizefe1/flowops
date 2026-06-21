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

type InventoryMovement = {
  id: string;
  organization_id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  created_by: string;
  created_at: string;
};

type InventoryMovementListResponse = {
  items: InventoryMovement[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

const movementTypes = ["all", "stock_in", "stock_out", "adjustment"];

function getMovementClass(movementType: string) {
  if (movementType === "stock_in") {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (movementType === "stock_out") {
    return "bg-red-400/10 text-red-200";
  }

  return "bg-cyan-400/10 text-cyan-300";
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleString();
}

export default function InventoryPage() {
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [totalMovements, setTotalMovements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedMovementType, setSelectedMovementType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadInventoryMovements() {
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

        if (selectedMovementType !== "all") {
          queryParams.set("movement_type", selectedMovementType);
        }

        const movementList = await apiRequest<InventoryMovementListResponse>(
          `/api/organizations/${selectedOrganization.id}/inventory-movements?${queryParams.toString()}`,
          {
            token,
          },
        );

        setMovements(movementList.items);
        setTotalMovements(movementList.total);
        setCurrentPage(movementList.page);
        setTotalPages(movementList.pages);
      } catch {
        setErrorMessage("Inventory movements could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadInventoryMovements();
  }, [router, organization, currentPage, selectedMovementType]);

  function handleMovementTypeChange(movementType: string) {
    setSelectedMovementType(movementType);
    setCurrentPage(1);
  }

  return (
    <AppShell
      title="Inventory"
      subtitle={organization ? organization.name : "FlowOps inventory history"}
    >
      <section className="py-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Live Backend Data
          </p>

          <h2 className="mt-4 text-4xl font-bold">Inventory Movements</h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            This page fetches paginated and filterable stock movement history
            directly from the FastAPI backend using the saved JWT token and the
            selected organization.
          </p>

          <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-300">
            Total Movements:{" "}
            <span className="ml-2 font-semibold text-cyan-300">
              {totalMovements}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-300">
              Movement Type Filter
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              {movementTypes.map((movementType) => (
                <button
                  key={movementType}
                  type="button"
                  onClick={() => handleMovementTypeChange(movementType)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    selectedMovementType === movementType
                      ? "border-cyan-300 bg-cyan-300 text-slate-950"
                      : "border-white/10 text-slate-200 hover:border-cyan-300/60"
                  }`}
                >
                  {movementType}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-slate-300">Loading inventory movements...</p>
          </div>
        </section>
      ) : errorMessage ? (
        <section>
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-red-200">
            {errorMessage}
          </div>
        </section>
      ) : movements.length === 0 ? (
        <section>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h3 className="text-xl font-semibold">
              No inventory movements found
            </h3>
            <p className="mt-3 text-slate-400">
              Try a different movement type filter or create stock movements
              from the backend API.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-5 lg:grid-cols-2">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm ${getMovementClass(
                        movement.movement_type,
                      )}`}
                    >
                      {movement.movement_type}
                    </span>

                    <h3 className="mt-4 text-xl font-semibold">
                      Quantity: {movement.quantity}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Created at: {formatDate(movement.created_at)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-right">
                    <p className="text-xs text-slate-500">Stock Change</p>
                    <p className="mt-1 font-medium text-cyan-300">
                      {movement.previous_stock} → {movement.new_stock}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-xs text-slate-500">Product ID</p>
                  <p className="mt-1 max-w-full truncate text-sm text-slate-200">
                    {movement.product_id}
                  </p>
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-xs text-slate-500">Reason</p>
                  <p className="mt-1 text-sm text-slate-200">
                    {movement.reason || "No reason provided"}
                  </p>
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
