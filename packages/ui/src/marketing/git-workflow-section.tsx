import React from "react";
import { GitCommit, GitBranch, CheckCircle2, RotateCcw, Eye, ShieldAlert } from "lucide-react";

export function MarketingGitWorkflowSection() {
  const steps = [
    {
      number: "01",
      title: "AI Edits Workbook",
      description: "Agents make changes to formulas, ranges, or formatting based on your prompt.",
      icon: GitCommit,
    },
    {
      number: "02",
      title: "Commit Created",
      description: "Every AI modification creates an isolated, traceable commit in version history.",
      icon: GitBranch,
    },
    {
      number: "03",
      title: "Human Reviews Diff",
      description: "Inspect precise cell-by-cell visual diffs and formulas before committing.",
      icon: Eye,
    },
    {
      number: "04",
      title: "Approve & Update",
      description: "Accept or roll back with a single click, keeping your spreadsheet 100% safe.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-20 bg-zinc-900 text-white rounded-3xl mx-4 sm:mx-8 lg:mx-12 my-12 overflow-hidden shadow-2xl relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-800/60 bg-purple-950/40 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-4">
          <GitBranch className="h-3.5 w-3.5" />
          <span>Git-Style Safety</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Never lose control of your data
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400">
          Unlike ordinary spreadsheets, every AI edit in Mona is trackable, reviewable, and reversible using Git-style commits.
        </p>

        {/* 4 Step Workflow */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col justify-between hover:border-purple-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-purple-400">{step.number}</span>
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-400">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diff Commit Popup Demo */}
        <div className="mt-10 mx-auto max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <GitCommit className="h-4 w-4" /> commit 4e93f70 (Formula Agent)
            </span>
            <span className="text-[10px] text-zinc-500">Just now</span>
          </div>
          <p className="text-zinc-300 mb-2 font-sans text-xs">Applied SUMIFS formula to Total Revenue column (B2:B6)</p>
          <div className="space-y-1 bg-zinc-900 p-2.5 rounded border border-zinc-800">
            <div className="text-red-400 font-mono">- Cell B7: $0 (Empty)</div>
            <div className="text-emerald-400 font-mono">+ Cell B7: =SUM(B2:B6) → $27,200</div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 font-sans">
            <button className="px-3 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Rollback
            </button>
            <button className="px-3 py-1 text-xs rounded bg-[#16A34A] text-white font-semibold hover:bg-[#15803d] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Approve Diff
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
