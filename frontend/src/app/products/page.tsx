"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

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
  category: string;
  description: string | null;
  unit_price: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function ProductsPage() {
  const router = useRouter();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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

        const productList = await apiRequest<Product[]>(
          `/api/organizations/${selectedOrganization.id}/products`,
          {
            token,
          },
        );

        setProducts(productList);
      } catch {
        setErrorMessage("Products could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
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
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-slate-400">
              {organization ? organization.name : "FlowOps product management"}
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
  href="/orders"
  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
>
  Orders
</a>
<a
  href="/audit-logs"
  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
>
  Audit Logs
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

            <h2 className="mt-4 text-4xl font-bold">Product Catalog</h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              This page fetches products directly from the FastAPI backend using
              the saved JWT token and the selected organization.
            </p>

            <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-300">
              Total Products:{" "}
              <span className="ml-2 font-semibold text-cyan-300">
                {products.length}
              </span>
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
                Create products from Swagger or backend API to see them here.
              </p>
            </div>
          </section>
        ) : (
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
                      <p className="mt-1 font-medium">{product.category}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-xs text-slate-500">Unit Price</p>
                      <p className="mt-1 font-medium">
                        {product.unit_price}
                      </p>
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
        )}
      </div>
    </main>
  );
}