import React from "react";
import { Calculator, BarChart3, Wand2, Workflow, ArrowRight } from "lucide-react";

export function MarketingFeaturesSection() {
  return (
    <section className="py-20 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 mb-4">
          <span>Features</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          Everything you need, powered by AI
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
          Mona is more than a spreadsheet. It's an intelligent workspace for data, analysis, and automation.
        </p>

        {/* 2x2 Feature Showcase Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Card 1: AI Formula Builder */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
                <Calculator className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                AI Formula Builder
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Generate, explain, and fix formulas instantly with Mona.
              </p>

              {/* Preview Code Snippet */}
              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-950/30 font-mono text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>=SUMIF(B2:B100, "Sales", C2:C100)</span>
                <span className="text-[10px] bg-blue-200/80 dark:bg-blue-800/80 px-2 py-0.5 rounded font-sans text-blue-900 dark:text-blue-100">AI Generated</span>
              </div>
            </div>

            <a href="/features#formula" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <span>Learn more</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 2: Smart Charts */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Smart Charts
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Create beautiful charts and insights with a simple prompt.
              </p>

              {/* Chart Preview Graphic */}
              <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 flex items-end justify-between h-24 gap-2">
                <div className="w-full bg-emerald-400 rounded-t h-40%"></div>
                <div className="w-full bg-emerald-500 rounded-t h-65%"></div>
                <div className="w-full bg-emerald-600 rounded-t h-85%"></div>
                <div className="w-full bg-emerald-500 rounded-t h-50%"></div>
                <div className="w-full bg-emerald-700 rounded-t h-95%"></div>
              </div>
            </div>

            <a href="/features#charts" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <span>Learn more</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 3: Data Cleaning */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-4">
                <Wand2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Data Cleaning
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Detect and clean messy data automatically.
              </p>

              {/* Table Cleaning Preview */}
              <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs">
                <div className="flex items-center justify-between text-zinc-500 pb-1 border-b border-zinc-200 dark:border-zinc-700 font-mono text-[11px]">
                  <span>Cleaned 48 duplicates</span>
                  <span className="text-emerald-600 font-bold">100% Valid</span>
                </div>
              </div>
            </div>

            <a href="/features#cleaning" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <span>Learn more</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Card 4: Automation & Agents */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 mb-4">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Automation & Agents
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Build custom AI agents to automate workflows and tasks.
              </p>

              {/* Agent Workflow Preview */}
              <div className="mt-5 flex items-center justify-center gap-3 rounded-lg border border-purple-100 bg-purple-50/40 p-3 dark:border-purple-900/30 dark:bg-purple-950/30 text-xs font-medium text-purple-800 dark:text-purple-300">
                <span className="bg-white dark:bg-purple-900 px-2 py-1 rounded shadow-xs border border-purple-200 dark:border-purple-800">Planner Agent</span>
                <span>→</span>
                <span className="bg-white dark:bg-purple-900 px-2 py-1 rounded shadow-xs border border-purple-200 dark:border-purple-800">Formula Agent</span>
              </div>
            </div>

            <a href="/features#automation" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <span>Learn more</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
