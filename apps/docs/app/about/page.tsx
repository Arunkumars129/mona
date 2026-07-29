import React from "react";
import { MarketingNavbar, MarketingCtaBanner, MarketingFooter } from "@repo/ui/marketing";

export const metadata = {
  title: "About Us — Mona AI",
  description: "Learn about Mona's mission to redefine spreadsheets for the era of artificial intelligence.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          About Mona
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          Spreadsheets are the software backbone of global business, yet they haven't fundamentally evolved in 30 years.
          Mona was built from the ground up as an AI-native workspace where humans and intelligent agents collaborate with complete version control safety.
        </p>
      </div>
      <MarketingCtaBanner />
      <MarketingFooter />
    </main>
  );
}
