import React from "react";
import { Sparkles, GitBranch, Users2, ShieldCheck, ArrowRight } from "lucide-react";

export function MarketingWhyMona() {
  const features = [
    {
      icon: Sparkles,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
      title: "AI Agent in Every Cell",
      description: "Let Mona understand your data, generate formulas, build charts, and automate complex tasks.",
      link: "/features#ai-agent",
    },
    {
      icon: GitBranch,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
      title: "Git-Style History",
      description: "Every change is tracked like a commit. Review diffs, roll back anytime, and stay in control.",
      link: "/features#git-history",
    },
    {
      icon: Users2,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time with permissions, mentions, and comments.",
      link: "/features#collaboration",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
      title: "Secure & Private",
      description: "Your data is encrypted and never used to train models. Enterprise-grade security.",
      link: "/security",
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>Why Mona</span>
        </div>

        {/* Section Header */}
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          Built for the next generation of work
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-300">
          Mona combines the familiarity of spreadsheets with the power of AI agents and the safety of version control.
        </p>

        {/* 4 Feature Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} mb-5 shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.link}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300 transition-colors"
                >
                  <span>Learn more</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
