import React from "react";
import {
  MarketingNavbar,
  MarketingFeaturesSection,
  MarketingWhyMona,
  MarketingGitWorkflowSection,
  MarketingCtaBanner,
  MarketingFooter,
} from "@repo/ui/marketing";

export const metadata = {
  title: "Features — Mona AI Spreadsheet",
  description:
    "Explore Mona AI features: Formula Agent, Smart Charts, Data Cleaning, Agent Workflows, and Git-Style Version Control.",
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <MarketingFeaturesSection />
      <MarketingWhyMona />
      <MarketingGitWorkflowSection />
      <MarketingCtaBanner />
      <MarketingFooter />
    </main>
  );
}
