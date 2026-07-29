import React from "react";
import {
  MarketingNavbar,
  MarketingResourcesSection,
  MarketingCtaBanner,
  MarketingFooter,
} from "@repo/ui/marketing";

export const metadata = {
  title: "Resources & Documentation — Mona AI Spreadsheet",
  description:
    "Guides, tutorials, case studies, and documentation to help you master AI-native spreadsheet workflows.",
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <MarketingResourcesSection />
      <MarketingCtaBanner />
      <MarketingFooter />
    </main>
  );
}
