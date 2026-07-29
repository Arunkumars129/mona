import React from "react";
import { Sparkles, ChevronDown, ArrowRight } from "lucide-react";

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16A34A] text-white font-bold shadow-sm shadow-emerald-500/20">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Mona
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <div className="group relative flex items-center gap-1 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
            <span>Product</span>
            <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform group-hover:rotate-180 duration-200" />
          </div>
          <a href="/features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Features
          </a>
          <a href="/pricing" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Pricing
          </a>
          <a href="/templates" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Templates
          </a>
          <div className="group relative flex items-center gap-1 cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
            <span>Resources</span>
            <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform group-hover:rotate-180 duration-200" />
          </div>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors px-2 py-1"
          >
            Sign in
          </a>
          <a
            href="/app"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] px-5 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/20 hover:bg-[#15803d] active:scale-95 transition-all duration-150"
          >
            <span>Get Started</span>
          </a>
        </div>
      </div>
    </header>
  );
}
