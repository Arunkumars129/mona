import React from "react";

export function MarketingTrustedCompanies() {
  const companies = [
    { name: "ACME", logo: "❖ ACME" },
    { name: "Spark", logo: "⚡ spark" },
    { name: "Quantum", logo: "Q Quantum" },
    { name: "Horizon", logo: "⬡ Horizon" },
    { name: "Matrix", logo: "ⵂ matrix" },
    { name: "Echo", logo: "∿ Echo" },
  ];

  return (
    <section className="py-12 border-y border-zinc-200/70 bg-zinc-50/50 dark:border-zinc-800/70 dark:bg-zinc-950/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-8">
          Trusted by teams building the future
        </p>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 items-center justify-items-center opacity-70 grayscale transition-all hover:grayscale-0">
          {companies.map((company, index) => (
            <span
              key={index}
              className="text-lg font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {company.logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
