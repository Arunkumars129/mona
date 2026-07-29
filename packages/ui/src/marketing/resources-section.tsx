"use client";
import React, { useState } from "react";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

export function MarketingResourcesSection() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Guides", "Tutorials", "Updates", "Case Studies"];

  const articles = [
    {
      id: "getting-started",
      category: "Guides",
      title: "Getting Started with Mona",
      description: "Learn the basics and build your first AI-assisted spreadsheet.",
      readTime: "8 min read",
      gradient: "from-blue-500/20 to-purple-500/20",
    },
    {
      id: "version-history",
      category: "Tutorials",
      title: "How Version History Works",
      description: "Understand Git-style history, diffs, and commits in Mona.",
      readTime: "7 min read",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      id: "ai-prompts",
      category: "Guides",
      title: "10 Powerful AI Prompts for Spreadsheets",
      description: "Supercharge your daily financial and sales workflows with these prompts.",
      readTime: "6 min read",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      id: "acme-case-study",
      category: "Case Studies",
      title: "Case Study: How ACME Scaled with Mona",
      description: "See how ACME reduced reporting and data cleanup time by 80%.",
      readTime: "5 min read",
      gradient: "from-amber-500/20 to-orange-500/20",
    },
  ];

  const filtered = activeTab === "All" ? articles : articles.filter((a) => a.category === activeTab);

  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 mb-4">
          <span>Resources</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          Learn, explore, and get inspired
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
          Guides, tutorials, and best practices to help you get the most out of Mona.
        </p>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === tab
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Resource Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200"
            >
              <div>
                {/* Thumbnail Graphic */}
                <div className={`mb-4 h-32 w-full rounded-xl bg-gradient-to-br ${item.gradient} border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center`}>
                  <BookOpen className="h-8 w-8 text-zinc-600 dark:text-zinc-300 opacity-60" />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.readTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <a
                href={`/resources/${item.id}`}
                className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-[#16A34A] transition-colors"
              >
                <span>Read article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
