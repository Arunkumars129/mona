import React from "react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/50 py-16 dark:border-zinc-800/80 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#16A34A] text-white font-bold text-sm shadow-sm">
                M
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Mona
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xs">
              The agentic spreadsheet for modern teams and businesses. Build, calculate, analyze, and automate together.
            </p>
            <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-500 pt-2">
              <a href="https://twitter.com" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://github.com/Arunkumars129/mona" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
              <a href="https://linkedin.com" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="/features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a></li>
              <li><a href="/templates" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Templates</a></li>
              <li><a href="/pricing" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/changelog" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Updates</a></li>
            </ul>
          </div>

          {/* Col 2: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="/resources" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/resources" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/resources" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</a></li>
              <li><a href="/resources" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About Us</a></li>
              <li><a href="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Careers</a></li>
              <li><a href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</a></li>
              <li><a href="/security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="/security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Security</a></li>
              <li><a href="/security" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200/60 pt-8 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <p>© 2026 Mona. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built with Next.js & Turborepo.</p>
        </div>
      </div>
    </footer>
  );
}
