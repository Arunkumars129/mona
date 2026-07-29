import React from "react";
import { MarketingNavbar, MarketingFooter } from "@repo/ui/marketing";

export const metadata = {
  title: "Contact Sales & Support — Mona AI",
  description: "Get in touch with the Mona team to request a demo or explore enterprise solutions.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white font-sans antialiased dark:bg-zinc-950">
      <MarketingNavbar />
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="text-3xl font-extrabold text-center text-zinc-900 dark:text-white">
          Contact Sales & Support
        </h1>
        <p className="mt-2 text-sm text-center text-zinc-600 dark:text-zinc-400">
          We'd love to hear from you. Send us a message and we'll reply within 24 hours.
        </p>

        <form className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
            <input type="text" placeholder="Arun Kumar" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Work Email</label>
            <input type="email" placeholder="arun@company.com" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Message</label>
            <textarea rows={4} placeholder="How can we help your team?" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"></textarea>
          </div>
          <button type="button" className="w-full rounded-lg bg-[#16A34A] py-2.5 text-sm font-semibold text-white hover:bg-[#15803d]">
            Send Message
          </button>
        </form>
      </div>
      <MarketingFooter />
    </main>
  );
}
