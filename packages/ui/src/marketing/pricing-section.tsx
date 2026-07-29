"use client";
import React, { useState } from "react";
import { Check } from "lucide-react";

export function MarketingPricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "For individuals getting started",
      features: [
        "Up to 5 spreadsheets",
        "AI assistant (limited)",
        "Git-style history (7 days)",
        "1GB storage",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? "$12" : "$10",
      period: "/user/month",
      description: "For professionals and small teams",
      features: [
        "Unlimited spreadsheets",
        "AI assistant (unlimited)",
        "Git-style history (90 days)",
        "20GB storage",
        "Custom templates",
      ],
      cta: "Get Started",
      popular: true,
      badge: "Popular",
    },
    {
      name: "Team",
      price: billingCycle === "monthly" ? "$24" : "$20",
      period: "/user/month",
      description: "For growing teams",
      features: [
        "Everything in Pro",
        "Real-time collaboration",
        "Advanced permissions",
        "100GB storage",
        "Priority support",
      ],
      cta: "Get Started",
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 mb-4">
          <span>Pricing</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600 dark:text-zinc-300">
          Choose the plan that's right for your team.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${billingCycle === "monthly"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${billingCycle === "yearly"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
          >
            Yearly <span className="text-emerald-600 font-bold">(Save 20%)</span>
          </button>
        </div>

        {/* 3 Pricing Cards matching image */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 text-left items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-2xl p-8 bg-white dark:bg-zinc-900 transition-all ${plan.popular
                  ? "border-2 border-[#16A34A] shadow-xl dark:border-emerald-500"
                  : "border border-zinc-200 dark:border-zinc-800 shadow-sm"
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 right-8 rounded-full bg-[#16A34A] text-white text-[11px] font-bold px-3 py-0.5 shadow-sm">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-[#16A34A] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="/app"
                  className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${plan.popular
                      ? "bg-[#16A34A] text-white hover:bg-[#15803d] shadow-sm"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
          Need a custom plan?{" "}
          <a href="/contact" className="font-semibold text-[#16A34A] hover:underline">
            Contact Sales →
          </a>
        </p>
      </div>
    </section>
  );
}
