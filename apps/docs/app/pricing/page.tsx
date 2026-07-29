import React from "react";
import {
  MarketingNavbar,
  MarketingPricingSection,
  MarketingCtaBanner,
  MarketingFooter,
} from "@repo/ui/marketing";

export const metadata = {
  title: "Pricing Plans — Mona AI Spreadsheet",
  description:
    "Simple, transparent pricing for individuals, professionals, and enterprise teams. Start for free today.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <MarketingPricingSection />
      <MarketingCtaBanner />
      <MarketingFooter />
    </main>
  );
}
