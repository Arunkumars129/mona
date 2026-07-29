import React from "react";
import {
  MarketingNavbar,
  MarketingHero,
  MarketingTrustedCompanies,
  MarketingWhyMona,
  MarketingGitWorkflowSection,
  MarketingFeaturesSection,
  MarketingTemplatesSection,
  MarketingPricingSection,
  MarketingCtaBanner,
  MarketingFooter,
} from "@repo/ui/marketing";

export const metadata = {
  title: "Mona — The Spreadsheet Built for AI Agents and Humans",
  description:
    "Mona is the AI-native spreadsheet platform where humans and AI agents collaborate with Git-style version control, real-time collaboration, and automated workflows.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <MarketingHero />
      <MarketingTrustedCompanies />
      <MarketingWhyMona />
      <MarketingGitWorkflowSection />
      <MarketingFeaturesSection />
      <MarketingTemplatesSection />
      <MarketingPricingSection />
      <MarketingCtaBanner />
      <MarketingFooter />
    </main>
  );
}
