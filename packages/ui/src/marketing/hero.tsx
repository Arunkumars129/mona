import React, { useState } from "react";
import { Sparkles, ArrowRight, Play, CheckCircle2, History, Bot, Users, Shield, Share2, Plus, Send } from "lucide-react";

export function MarketingHero() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState("");

  const quickActions = [
    { icon: "📊", label: "Create a chart" },
    { icon: "📈", label: "Analyze this data" },
    { icon: "✍️", label: "Write a formula" },
    { icon: "🧹", label: "Clean this data" },
    { icon: "💬", label: "Summarize insights" },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-white dark:bg-zinc-950">
      {/* Background Soft Glow Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-100/60 via-purple-100/40 to-blue-100/40 blur-3xl dark:from-emerald-950/30 dark:via-purple-950/20 dark:to-blue-950/20" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/60 px-4 py-1.5 text-xs font-medium text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300 shadow-sm backdrop-blur-sm mb-6">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>AI-Powered Spreadsheet</span>
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl md:text-7xl dark:text-white leading-[1.1]">
          The spreadsheet for{" "}
          <span className="text-[#16A34A] underline decoration-emerald-200/60 underline-offset-8">
            AI agents
          </span>{" "}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            and humans
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 sm:text-xl leading-relaxed">
          Mona is the first agentic spreadsheet with Git-style history, real-time collaboration, and AI that works with you, not instead of you.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-[#15803d] active:scale-95 transition-all duration-150"
          >
            <span>Start for Free</span>
          </a>
          <a
            href="#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300/80 bg-white px-8 py-3.5 text-base font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all"
          >
            <Play className="h-4 w-4 fill-zinc-800 dark:fill-zinc-200" />
            <span>See How It Works</span>
          </a>
        </div>
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">No credit card required</p>

        {/* Feature Pills Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-3.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
            <History className="h-3.5 w-3.5 text-purple-600" />
            <span>Git-style Version History</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-3.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
            <Bot className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Agent Assistance</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-3.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
            <Users className="h-3.5 w-3.5 text-blue-600" />
            <span>Real-time Collaboration</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-3.5 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/80">
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            <span>Secure & Private</span>
          </div>
        </div>

        {/* Hero Interactive UI Mockup (Matching Attached Image Exactly) */}
        <div className="relative mt-14 mx-auto max-w-5xl rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900/90 text-left">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 relative overflow-hidden">
            
            {/* Sheet Titlebar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-600 text-white font-bold text-xs">
                  H
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    Marketing Budget Plan
                  </h3>
                  <p className="text-[11px] text-zinc-400">File · Edit · View · Insert · Format · Data · Help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="inline-block h-6 w-6 rounded-full bg-blue-500 ring-2 ring-white text-[10px] font-bold text-white flex items-center justify-center">AK</div>
                  <div className="inline-block h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-white text-[10px] font-bold text-white flex items-center justify-center">M</div>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-md bg-[#16A34A] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[#15803d]">
                  <Share2 className="h-3 w-3" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Layout Grid: Spreadsheet Left + Mona AI Panel Right */}
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Spreadsheet Grid */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 overflow-x-auto shadow-sm">
                {/* Formatting Ribbon */}
                <div className="flex items-center gap-3 text-xs text-zinc-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">100% ▾</span>
                  <span>Inter ▾</span>
                  <span>10 ▾</span>
                  <span className="font-bold cursor-pointer">B</span>
                  <span className="italic cursor-pointer">I</span>
                  <span>A ▾</span>
                </div>

                {/* Table Data matching user image */}
                <table className="w-full text-xs text-left border-collapse mt-2">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                      <th className="p-1.5 w-8 text-center border-r border-zinc-200 dark:border-zinc-700"></th>
                      <th className="p-1.5 border-r border-zinc-200 dark:border-zinc-700">Category</th>
                      <th className="p-1.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Budget</th>
                      <th className="p-1.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Actual</th>
                      <th className="p-1.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Variance</th>
                      <th className="p-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <td className="p-1.5 text-center bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400">1</td>
                      <td className="p-1.5 font-medium">Ad Campaigns</td>
                      <td className="p-1.5 text-right">$12,000</td>
                      <td className="p-1.5 text-right">$10,450</td>
                      <td className="p-1.5 text-right font-medium text-emerald-600">$1,550</td>
                      <td className="p-1.5 text-[11px]"><span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">🟢 On Track</span></td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-center bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400">2</td>
                      <td className="p-1.5 font-medium">Content Marketing</td>
                      <td className="p-1.5 text-right">$8,000</td>
                      <td className="p-1.5 text-right">$7,600</td>
                      <td className="p-1.5 text-right font-medium text-emerald-600">$400</td>
                      <td className="p-1.5 text-[11px]"><span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">🟢 On Track</span></td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-center bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400">3</td>
                      <td className="p-1.5 font-medium">SEO & Tools</td>
                      <td className="p-1.5 text-right">$3,500</td>
                      <td className="p-1.5 text-right">$2,900</td>
                      <td className="p-1.5 text-right font-medium text-emerald-600">$600</td>
                      <td className="p-1.5 text-[11px]"><span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">🔴 At Risk</span></td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-center bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400">4</td>
                      <td className="p-1.5 font-medium">Events & Webinars</td>
                      <td className="p-1.5 text-right">$4,000</td>
                      <td className="p-1.5 text-right">$4,200</td>
                      <td className="p-1.5 text-right font-medium text-red-600">-$200</td>
                      <td className="p-1.5 text-[11px]"><span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded">🔴 Over</span></td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-center bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400">5</td>
                      <td className="p-1.5 font-medium">Design & Creative</td>
                      <td className="p-1.5 text-right">$2,500</td>
                      <td className="p-1.5 text-right">$2,050</td>
                      <td className="p-1.5 text-right font-medium text-emerald-600">$450</td>
                      <td className="p-1.5 text-[11px]"><span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">🟢 On Track</span></td>
                    </tr>
                    <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 font-bold border-t-2 border-emerald-500/30">
                      <td className="p-1.5 text-center bg-emerald-100/50 text-emerald-700">6</td>
                      <td className="p-1.5">Total</td>
                      <td className="p-1.5 text-right">$30,000</td>
                      <td className="p-1.5 text-right relative ring-2 ring-blue-500 rounded bg-blue-50/80 dark:bg-blue-950/40">
                        $27,200
                        <span className="absolute -bottom-4 right-0 bg-blue-600 text-white font-mono text-[9px] px-1 py-0.5 rounded shadow">
                          =SUM(B2:B6)
                        </span>
                      </td>
                      <td className="p-1.5 text-right text-emerald-600">$2,800</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Column: Floating Mona AI Sidebar Panel */}
              <div className="lg:col-span-5 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-[#16A34A] text-white flex items-center justify-center text-xs font-bold">
                        M
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">Mona AI</span>
                    </div>
                    <span className="text-xs text-zinc-400 cursor-pointer">×</span>
                  </div>

                  <div className="mt-3 space-y-3">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      Hi Arun! 👋 <br />
                      <span className="font-semibold text-zinc-900 dark:text-white">How can I help with your data today?</span>
                    </p>

                    {/* Quick Action Buttons */}
                    <div className="space-y-1.5">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedAction(action.label)}
                          className={`w-full text-left flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                            selectedAction === action.label
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300"
                          }`}
                        >
                          <span className="text-sm">{action.icon}</span>
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input Prompt Box */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Ask Mona..."
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 pr-8 text-xs text-zinc-800 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                    />
                    <button className="absolute right-2 text-emerald-600 hover:text-emerald-700">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
