import React from "react";
import {
  MarketingNavbar,
  MarketingTemplatesSection,
  MarketingCtaBanner,
  MarketingFooter,
} from "@repo/ui/marketing";

export const metadata = {
  title: "Smart Spreadsheet Templates — Mona AI",
  description:
    "Free professional spreadsheet templates for Finance, Sales, Marketing, HR, Operations, and Startups powered by Mona AI.",
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <MarketingTemplatesSection />
      <MarketingCtaBanner />
      <MarketingFooter />
    </main>
  );
}
