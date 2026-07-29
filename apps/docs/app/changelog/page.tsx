import React from "react";
import { MarketingNavbar, MarketingFooter } from "@repo/ui/marketing";

export const metadata = {
  title: "Product Updates & Changelog — Mona AI",
  description: "Recent product updates, improvements, and new feature releases for Mona AI.",
};

export default function ChangelogPage() {
  const updates = [
    {
      version: "v1.2.0",
      date: "July 2026",
      title: "Multi-Agent Orchestration & DAG Planner",
      changes: [
        "Introduced Planner Agent with multi-stage DAG task decomposition",
        "Added specialized Formula, Cleaning, Chart, and Insight Agents",
        "Added InMemory & Session Memory Store architecture",
      ],
    },
    {
      version: "v1.1.0",
      date: "June 2026",
      title: "Git-Style Version Control & Cell Diffs",
      changes: [
        "Cell-by-cell visual diff modal for reviewing AI edits",
        "1-click commit rollback and author tracking",
        "Preset Univer spreadsheet integration",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <div className="mx-auto max-w-4xl px-4 py-20">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">
          Product Updates & Changelog
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-12">
          Follow the latest features, enhancements, and fixes in Mona AI.
        </p>

        <div className="space-y-12">
          {updates.map((up) => (
            <div key={up.version} className="border-l-2 border-emerald-500 pl-6 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded dark:bg-emerald-950 dark:text-emerald-300">
                  {up.version}
                </span>
                <span className="text-xs text-zinc-400">{up.date}</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{up.title}</h2>
              <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1 pt-1">
                {up.changes.map((ch, i) => (
                  <li key={i}>{ch}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <MarketingFooter />
    </main>
  );
}
