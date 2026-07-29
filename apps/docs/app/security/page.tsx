import React from "react";
import { MarketingNavbar, MarketingCtaBanner, MarketingFooter } from "@repo/ui/marketing";

export const metadata = {
  title: "Security & Privacy — Mona AI",
  description: "Enterprise-grade encryption, SOC 2 compliance, audit logs, and data safety in Mona.",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Enterprise Security & Privacy
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          Your spreadsheet data is encrypted end-to-end at rest and in transit. Your proprietary data is never used to train public AI models.
        </p>
      </div>
      <MarketingCtaBanner />
      <MarketingFooter />
    </main>
  );
}
