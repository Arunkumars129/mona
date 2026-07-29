"use client";
import React, { useState } from "react";
import { LayoutTemplate, ArrowRight, Table, Check } from "lucide-react";

export function MarketingTemplatesSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Finance", "Marketing", "HR", "Operations", "Startups", "Personal"];

  const templates = [
    {
      id: "marketing-budget",
      category: "Marketing",
      title: "Marketing Budget",
      description: "Track campaigns, budgets, and ROI in real-time.",
      badge: "Popular",
    },
    {
      id: "sales-tracker",
      category: "Finance",
      title: "Sales Tracker",
      description: "Monitor sales performance and pipeline targets.",
      badge: "Essential",
    },
    {
      id: "personal-finance",
      category: "Personal",
      title: "Personal Finance",
      description: "Manage income, expenses, and savings goals.",
      badge: "Free",
    },
    {
      id: "okr-planner",
      category: "Startups",
      title: "OKR Planner",
      description: "Set company goals and track quarterly key results.",
      badge: "New",
    },
  ];

  const filtered = activeCategory === "All" ? templates : templates.filter((t) => t.category === activeCategory);

  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/70 px-3.5 py-1 text-xs font-semibold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300 mb-4">
          <span>Templates</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          Start with smart templates
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
          Professional templates for every use case. Customize and make them your own.
        </p>

        {/* Category Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeCategory === cat
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200"
            >
              <div>
                {/* Mock Thumbnail Visual */}
                <div className="relative mb-4 h-32 w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="h-2 w-16 bg-zinc-300 dark:bg-zinc-600 rounded"></div>
                    <div className="h-2 w-8 bg-emerald-400 rounded"></div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700/60 rounded"></div>
                    <div className="h-2 w-4/5 bg-zinc-200 dark:bg-zinc-700/60 rounded"></div>
                    <div className="h-2 w-3/5 bg-zinc-200 dark:bg-zinc-700/60 rounded"></div>
                  </div>
                  <span className="absolute top-2 right-2 rounded-full bg-zinc-900/80 text-white text-[10px] px-2 py-0.5 font-medium">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <a
                href={`/app?template=${item.id}`}
                className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A] hover:text-emerald-700 transition-colors"
              >
                <span>Use Template</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
