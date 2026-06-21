"use client";

import { FormEvent, useEffect, useState } from "react";
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

type Product = {
  id: string;
  organization_id: string;
  name: string;
  sku: string;
  category: string | null;
  description: string | null;
  unit_price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ProductListResponse = {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export default function ProductsPage() {
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProducts() {
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

        if (searchTerm.trim()) {
          queryParams.set("search", searchTerm.trim());
        }

        const productList = await apiRequest<ProductListResponse>(
          `/api/organizations/${selectedOrganization.id}/products?${queryParams.toString()}`,
          {
            token,
          },
        );

        setProducts(productList.items);
        setTotalProducts(productList.total);
        setCurrentPage(productList.page);
        setTotalPages(productList.pages);
      } catch {
        setErrorMessage("Products could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [router, organization, currentPage, searchTerm]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchInput);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  }

  return (
    <AppShell
      title="Products"
      subtitle={organization ? organization.name : "FlowOps product management"}
    >
      <section className="py-10">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Live Backend Data
          </p>

          <h2 className="mt-4 text-4xl font-bold">Product Catalog</h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            This page fetches paginated and searchable product data directly
            from the FastAPI backend using the saved JWT token and the selected
            organization.
          </p>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-300">
              Total Products:{" "}
              <span className="ml-2 font-semibold text-cyan-300">
                {totalProducts}
              </span>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, SKU, or category"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 sm:w-80"
              />

              <button
                type="submit"
                className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/60"
              >
                Clear
              </button>
            </form>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-slate-300">Loading products...</p>
          </div>
        </section>
      ) : errorMessage ? (
        <section>
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-red-200">
            {errorMessage}
          </div>
        </section>
      ) : products.length === 0 ? (
        <section>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h3 className="text-xl font-semibold">No products found</h3>
            <p className="mt-3 text-slate-400">
              Try a different search term or create products from Swagger or the
              backend API.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const isLowStock =
                product.stock_quantity <= product.low_stock_threshold;

              return (
                <div
                  key={product.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        product.is_active
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-red-400/10 text-red-200"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-300">
                    {product.description || "No description provided."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-500">Category</p>
                      <p className="mt-1 font-medium">
                        {product.category || "Uncategorized"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-500">Unit Price</p>
                      <p className="mt-1 font-medium">{product.unit_price}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-500">Stock</p>
                      <p
                        className={`mt-1 font-medium ${
                          isLowStock ? "text-red-300" : "text-cyan-300"
                        }`}
                      >
                        {product.stock_quantity}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-500">Low Threshold</p>
                      <p className="mt-1 font-medium">
                        {product.low_stock_threshold}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
