const features = [
  {
    title: "Multi-Tenant Organizations",
    description:
      "Manage multiple organizations with isolated products, orders, inventory movements, dashboards, and audit logs.",
  },
  {
    title: "Inventory & Order Workflows",
    description:
      "Track stock-in, stock-out, adjustments, customer orders, automatic stock deduction, and order cancellation flows.",
  },
  {
    title: "Audit Logs & Reporting",
    description:
      "Monitor important business actions with audit logs and dashboard summary metrics for operational visibility.",
  },
];

const stats = [
  {
    label: "Backend Modules",
    value: "7+",
  },
  {
    label: "API Tests",
    value: "5",
  },
  {
    label: "CI Pipeline",
    value: "Active",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-[350px] w-[350px] rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
          <nav className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FlowOps</h1>
              <p className="text-sm text-slate-400">
                B2B Operations Platform
              </p>
            </div>

            <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              <a href="#features" className="hover:text-white">
                Features
              </a>
              <a href="#stack" className="hover:text-white">
                Tech Stack
              </a>
              <a
                href="https://github.com/azizefe1/flowops"
                target="_blank"
                className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10"
              >
                GitHub
              </a>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                FastAPI · PostgreSQL · Docker · Pytest · GitHub Actions
              </div>

              <h2 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl">
                Modern backend system for B2B operations.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                FlowOps is a multi-tenant operations platform designed to manage
                organizations, products, inventory movements, customer orders,
                dashboard metrics, and audit logs with a production-oriented
                backend architecture.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="https://github.com/azizefe1/flowops"
                  target="_blank"
                  className="rounded-xl bg-cyan-400 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  View Repository
                </a>
                <a
                  href="#features"
                  className="rounded-xl border border-white/10 px-6 py-3 text-center font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <p className="text-3xl font-bold text-cyan-300">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Dashboard Preview</p>
                  <h3 className="text-xl font-semibold">Operations Summary</h3>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                  CI Passing
                </span>
              </div>

              <div className="grid gap-4">
                {[
                  ["Total Products", "128"],
                  ["Open Orders", "34"],
                  ["Low Stock Items", "7"],
                  ["Audit Events", "1,240"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-5"
                  >
                    <span className="text-slate-300">{label}</span>
                    <span className="text-2xl font-bold text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-sm font-medium text-cyan-200">
                  Backend Ready
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  JWT authentication, PostgreSQL migrations, Dockerfile,
                  automated API tests, and GitHub Actions CI are already
                  configured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/10 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Features
            </p>
            <h2 className="mt-4 text-4xl font-bold">
              Built like a real backend portfolio project.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-4 leading-7 text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Tech Stack
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "FastAPI",
              "PostgreSQL",
              "SQLAlchemy",
              "Alembic",
              "JWT",
              "Docker",
              "Redis",
              "Pytest",
              "GitHub Actions",
              "Next.js",
              "Tailwind CSS",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}