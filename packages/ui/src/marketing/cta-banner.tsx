import React from "react";

export function MarketingCtaBanner() {
  return (
    <section className="py-16 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100/80 via-indigo-50/70 to-emerald-100/80 p-8 sm:p-12 text-center shadow-lg border border-purple-200/50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-emerald-950/40 dark:border-purple-900/40">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Ready to experience the future of spreadsheets?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600 dark:text-zinc-300">
            Join thousands of teams already using Mona to work smarter, build formulas instantly, and collaborate safely.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#16A34A] px-8 py-3 text-base font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-[#15803d] active:scale-95 transition-all"
            >
              Start for Free
            </a>
            <a
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/80 px-8 py-3 text-base font-semibold text-zinc-800 shadow-sm hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-900 transition-all"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
