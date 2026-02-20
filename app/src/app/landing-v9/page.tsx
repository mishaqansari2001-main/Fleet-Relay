"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  House,
  Ticket,
  Truck,
  ChartBar,
  Users,
  Trophy,
  Gear,
  MagnifyingGlass,
  MapPin,
  Clock,
  Timer,
  Warning,
  User,
  PaperPlaneTilt,
  Robot,
  Lightning,
  Brain,
  ArrowRight,
  Funnel,
  GlobeSimple,
  EnvelopeSimple,
  Phone,
  CaretDown,
  CheckCircle,
  TelegramLogo,
  Plug,
} from "@phosphor-icons/react";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Shared Data
   ═══════════════════════════════════════════ */

const sidebarItems = [
  { icon: House, label: "Dashboard", active: true },
  { icon: Ticket, label: "Tickets" },
  { icon: Users, label: "Drivers" },
  { icon: Trophy, label: "Leaderboard" },
  { icon: Gear, label: "Settings" },
];

const footerCols: Record<string, string[]> = {
  Product: ["Features", "Pricing", "Integrations", "Security", "Changelog"],
  Solutions: ["Trucking", "Logistics", "Last Mile", "Enterprise"],
  Resources: ["Documentation", "API Reference", "Status", "Blog"],
  Company: ["About", "Careers", "Contact", "Privacy", "Terms"],
};

const faqItems = [
  { q: "How long does setup take?", a: "Most teams are fully operational within 30 minutes. Connect your Telegram Business Account, invite your operators, and tickets start flowing automatically. No IT support or complex configuration required." },
  { q: "Do drivers need to install anything?", a: "No. Drivers use Telegram, which most already have. They simply message your fleet's bot or group chat. Zero training, zero app downloads, zero friction." },
  { q: "How does AI classification work?", a: "FleetRelay uses a two-layer system. First, deterministic rules instantly catch known patterns (engine codes, keywords). Then, a GPT-4o layer handles everything else, extracting priority, category, location, and routing to the right operator in under 2 seconds." },
  { q: "What ELD systems do you integrate with?", a: "We currently integrate with ZippyELD for real-time vehicle data enrichment. Each ticket is automatically enriched with engine diagnostics, GPS location, speed, and HOS data. Additional ELD integrations are on the roadmap." },
  { q: "Can I get a demo before committing?", a: "Absolutely. Our team is happy to walk you through the platform with a guided demo. Just reach out through our contact page and we will set up a time that works for you." },
  { q: "How does pricing work?", a: "Simple monthly pricing based on fleet size. No per-ticket charges, no hidden fees. See our pricing page for current plans and features included at each tier." },
];

/* ═══════════════════════════════════════════
   Product Mockup: Full Dashboard
   ═══════════════════════════════════════════ */

function DashboardOverviewMockup() {
  return (
    <div className="rounded-xl border border-[#DFE2E6] bg-white shadow-2xl shadow-black/[0.08] overflow-hidden">
      <div className="flex items-center gap-4 px-4 h-10 border-b border-[#DFE2E6] bg-[#FAFAFA]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-md border border-[#DFE2E6] px-3 py-0.5 text-[11px] text-[#7C8490] font-mono">
            app.fleetrelay.com/dashboard
          </div>
        </div>
        <div className="w-16" />
      </div>
      <div className="flex h-[360px] md:h-[440px]">
        <div className="w-[160px] border-r border-[#DFE2E6] bg-white flex-col hidden md:flex">
          <div className="px-4 py-3 border-b border-[#DFE2E6]">
            <div className="flex items-center gap-1.5">
              <Truck size={16} weight="fill" className="text-[#111318]" />
              <span className="font-bold text-sm tracking-tight">
                <span className="text-[#111318]">Fleet</span>
                <span className="text-[#0B8841]">Relay</span>
              </span>
            </div>
          </div>
          <nav className="flex-1 px-2 py-2 space-y-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] ${item.active ? "bg-[#EEF0F2] font-medium text-[#111318]" : "text-[#7C8490]"}`}>
                  <Icon size={14} weight={item.active ? "fill" : "regular"} />
                  {item.label}
                </div>
              );
            })}
          </nav>
          <div className="px-3 py-2.5 border-t border-[#DFE2E6]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#0B8841]/10 flex items-center justify-center">
                <span className="text-[8px] font-medium text-[#0B8841]">JD</span>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#111318]">John Doe</p>
                <p className="text-[9px] text-[#7C8490]">Admin</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[#F6F7F8]">
          <div className="px-5 py-4 space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-[#111318]">Dashboard</h3>
              <p className="text-[10px] text-[#7C8490]">Overview of your fleet support operations.</p>
            </div>

            {/* KPI Cards - matches actual app */}
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { icon: Ticket, value: "142", label: "Total Tickets", desc: "This month" },
                { icon: Warning, value: "23", label: "Unresolved", desc: "Open + In Progress" },
                { icon: Clock, value: "8m", label: "Avg. Pickup Time", desc: "Time to first claim" },
                { icon: Timer, value: "2h 14m", label: "Avg. Handling Time", desc: "Claim to resolution" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-lg border border-[#DFE2E6] p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-medium text-[#111318]">{stat.label}</span>
                      <Icon size={12} weight="fill" className="text-[#111318]" />
                    </div>
                    <p className="font-mono text-base font-semibold text-[#111318]">{stat.value}</p>
                    <p className="text-[8px] text-[#7C8490] mt-0.5">{stat.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Open Tickets */}
            <div className="bg-white rounded-lg border border-[#DFE2E6]">
              <div className="px-3 py-2 border-b border-[#DFE2E6] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-[#111318]">Open Tickets</p>
                  <p className="text-[8px] text-[#7C8490]">5 unresolved tickets</p>
                </div>
                <span className="text-[8px] font-medium text-[#0B8841]">View all</span>
              </div>
              {[
                { id: "TKT-0042", subj: "Engine overheating on I-40", driver: "M. Johnson", sla: "18m", slaC: "#CD2B31", urgent: true },
                { id: "TKT-0041", subj: "ELD device not syncing", driver: "S. Chen", sla: "2h 12m", slaC: "#0B8841", urgent: false },
                { id: "TKT-0040", subj: "Flat tire, need roadside assist", driver: "A. Hassan", sla: "45m", slaC: "#C07D10", urgent: false },
              ].map((t) => (
                <div key={t.id} className="flex items-center gap-2 px-3 py-1.5 border-b border-[#DFE2E6] last:border-b-0">
                  {t.urgent ? (
                    <Warning size={10} weight="fill" className="text-[#CD2B31] shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#E5954B] shrink-0" />
                  )}
                  <span className="text-[9px] font-mono font-medium text-[#111318]">{t.id}</span>
                  <span className="text-[10px] text-[#111318] flex-1 truncate">{t.subj}</span>
                  <span className="text-[9px] text-[#454B55] hidden sm:block">{t.driver}</span>
                  <span className="text-[8px] font-mono font-medium" style={{ color: t.slaC }}>{t.sla}</span>
                </div>
              ))}
            </div>

            {/* Ticket Volume (area) + Status Breakdown (donut) */}
            <div className="grid grid-cols-5 gap-2.5">
              <div className="col-span-3 bg-white rounded-lg border border-[#DFE2E6] p-2.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-medium text-[#111318]">Ticket Volume</p>
                  <div className="flex gap-1">
                    <span className="text-[7px] text-[#7C8490] px-1.5 py-0.5 rounded bg-[#EEF0F2]">7 days</span>
                    <span className="text-[7px] text-[#111318] font-medium px-1.5 py-0.5 rounded border border-[#DFE2E6] bg-white">15 days</span>
                    <span className="text-[7px] text-[#7C8490] px-1.5 py-0.5 rounded bg-[#EEF0F2]">1 month</span>
                  </div>
                </div>
                <svg viewBox="0 0 240 80" className="w-full h-16">
                  <line x1="0" y1="20" x2="240" y2="20" stroke="#EEF0F2" strokeWidth="0.5" />
                  <line x1="0" y1="40" x2="240" y2="40" stroke="#EEF0F2" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="240" y2="60" stroke="#EEF0F2" strokeWidth="0.5" />
                  <path d="M0,52 C16,50 24,56 40,46 C56,36 60,42 80,38 C100,34 108,28 128,24 C148,20 152,30 168,26 C184,22 200,18 216,16 C228,14 236,15 240,16" fill="none" stroke="#4A90D9" strokeWidth="1.5" />
                  <path d="M0,52 C16,50 24,56 40,46 C56,36 60,42 80,38 C100,34 108,28 128,24 C148,20 152,30 168,26 C184,22 200,18 216,16 C228,14 236,15 240,16 L240,80 L0,80 Z" fill="url(#mockGradBlue)" />
                  <path d="M0,60 C16,58 24,64 40,56 C56,48 60,54 80,50 C100,46 108,40 128,36 C148,32 152,40 168,36 C184,32 200,30 216,28 C228,26 236,27 240,28" fill="none" stroke="#4DAB9A" strokeWidth="1.5" />
                  <path d="M0,60 C16,58 24,64 40,56 C56,48 60,54 80,50 C100,46 108,40 128,36 C148,32 152,40 168,36 C184,32 200,30 216,28 C228,26 236,27 240,28 L240,80 L0,80 Z" fill="url(#mockGradTeal)" />
                  <defs>
                    <linearGradient id="mockGradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="mockGradTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4DAB9A" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#4DAB9A" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-0.5 rounded bg-[#4A90D9]" />
                    <span className="text-[7px] text-[#7C8490]">Created</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-0.5 rounded bg-[#4DAB9A]" />
                    <span className="text-[7px] text-[#7C8490]">Resolved</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-white rounded-lg border border-[#DFE2E6] p-2.5">
                <p className="text-[9px] font-medium text-[#111318] mb-2">Status Breakdown</p>
                <div className="flex justify-center">
                  <svg viewBox="0 0 80 80" className="w-14 h-14">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#2EAD5E" strokeWidth="8" strokeDasharray="75 113" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#E5954B" strokeWidth="8" strokeDasharray="45 143" strokeDashoffset="-75" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#5B9EF0" strokeWidth="8" strokeDasharray="38 150" strokeDashoffset="-120" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#71767F" strokeWidth="8" strokeDasharray="20 168" strokeDashoffset="-158" strokeLinecap="round" />
                    <text x="40" y="38" textAnchor="middle" fontSize="10" fontWeight="600" fill="#111318" fontFamily="monospace">142</text>
                    <text x="40" y="47" textAnchor="middle" fontSize="6" fill="#7C8490">Total</text>
                  </svg>
                </div>
                <div className="mt-2 space-y-0.5">
                  {[
                    { label: "Resolved", color: "#2EAD5E", count: "96" },
                    { label: "Open", color: "#E5954B", count: "28" },
                    { label: "In Progress", color: "#5B9EF0", count: "14" },
                    { label: "Dismissed", color: "#71767F", count: "4" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[7px] text-[#7C8490] flex-1">{s.label}</span>
                      <span className="text-[7px] font-mono font-medium text-[#111318]">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Product Mockup: Ticket Table
   ═══════════════════════════════════════════ */

function TicketTableMockup() {
  return (
    <div className="rounded-xl border border-[#DFE2E6] bg-white shadow-lg shadow-black/[0.05] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#DFE2E6] flex items-center justify-between bg-[#FAFAFA]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-[#DFE2E6] rounded-lg px-2.5 py-1.5">
            <MagnifyingGlass size={12} className="text-[#7C8490]" />
            <span className="text-[10px] text-[#7C8490]">Search tickets...</span>
          </div>
          <div className="flex items-center gap-1 bg-white border border-[#DFE2E6] rounded-lg px-2.5 py-1.5">
            <Funnel size={12} className="text-[#7C8490]" />
            <span className="text-[10px] text-[#454B55]">Priority</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {["All", "Active", "Urgent"].map((tab, idx) => (
            <button key={tab} className={`text-[10px] font-medium px-2.5 py-1 rounded-md ${idx === 1 ? "bg-[#0B8841]/10 text-[#0B8841]" : "text-[#7C8490]"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#DFE2E6] bg-[#F6F7F8]">
            {["", "ID", "Subject", "Driver", "Status", "SLA"].map((h) => (
              <th key={h} className="px-3 py-2 text-[10px] text-[#7C8490] uppercase tracking-wider font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { id: "TK-1042", subj: "Engine overheating on I-40", driver: "Marcus Johnson", pri: "#CD2B31", stat: "Urgent", statC: "#CD2B31", sla: "18m" },
            { id: "TK-1041", subj: "ELD device not syncing", driver: "Sarah Chen", pri: "#C07D10", stat: "Open", statC: "#C07D10", sla: "32m" },
            { id: "TK-1040", subj: "Flat tire, roadside assist needed", driver: "Ahmed Hassan", pri: "#C07D10", stat: "In Progress", statC: "#0B8841", sla: "45m" },
            { id: "TK-1039", subj: "Fuel card declined", driver: "David Kim", pri: "#3B7DD8", stat: "Open", statC: "#C07D10", sla: "60m" },
            { id: "TK-1038", subj: "Brake warning light on", driver: "Carlos Rivera", pri: "#CD2B31", stat: "In Progress", statC: "#0B8841", sla: "90m" },
          ].map((row) => (
            <tr key={row.id} className="border-b border-[#DFE2E6] last:border-b-0">
              <td className="px-3 py-2.5"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: row.pri }} /></td>
              <td className="px-3 py-2.5 text-[11px] font-mono text-[#7C8490]">{row.id}</td>
              <td className="px-3 py-2.5 text-xs text-[#111318]">{row.subj}</td>
              <td className="px-3 py-2.5 text-xs text-[#454B55]">{row.driver}</td>
              <td className="px-3 py-2.5">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: row.statC }} />
                  <span className="text-[10px] text-[#454B55]">{row.stat}</span>
                </span>
              </td>
              <td className="px-3 py-2.5 text-[10px] font-mono text-[#7C8490]">{row.sla}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-[#DFE2E6] bg-[#FAFAFA] flex items-center justify-between">
        <span className="text-[10px] text-[#7C8490]">Showing 5 of 147 tickets</span>
        <span className="text-[10px] text-[#7C8490] font-mono">Page 1 of 30</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Product Mockup: Telegram Phone
   ═══════════════════════════════════════════ */

function TelegramPhoneMockup() {
  return (
    <div className="flex justify-center">
      <div className="w-[280px] rounded-[2rem] border-[6px] border-[#1a1a1a] bg-white overflow-hidden shadow-2xl shadow-black/10">
        <div className="flex items-center justify-between px-5 py-1.5 bg-[#F6F7F8]">
          <span className="text-[10px] font-mono text-[#454B55]">9:41</span>
          <div className="w-20 h-5 rounded-full bg-[#1a1a1a]" />
          <div className="flex gap-0.5 items-center">
            <div className="w-4 h-2.5 rounded-sm border border-[#454B55]">
              <div className="w-2.5 h-full bg-[#0B8841] rounded-sm" />
            </div>
          </div>
        </div>
        <div className="px-4 py-2.5 border-b border-[#DFE2E6] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0B8841] flex items-center justify-center">
            <Robot size={16} className="text-white" weight="bold" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#111318]">FleetRelay Bot</p>
            <p className="text-[10px] text-[#0B8841]">online</p>
          </div>
        </div>
        <div className="p-3 space-y-2.5 bg-[#ECE5DD]/30 min-h-[280px]">
          <div className="flex justify-end">
            <div className="bg-[#DCF8C6] rounded-xl rounded-tr-sm px-3 py-2 max-w-[200px]">
              <p className="text-[11px] text-[#111318] leading-relaxed">
                Reefer alarm going off. Temp rising fast. At Petro in Effingham.
              </p>
              <p className="text-[9px] text-[#7C8490] text-right mt-1 font-mono">3:12 PM</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[210px] shadow-sm">
              <p className="text-[11px] text-[#111318] leading-relaxed">
                <span className="font-semibold">Ticket TK-1029</span> created.
              </p>
              <div className="mt-1.5 space-y-0.5">
                <p className="text-[10px] text-[#CD2B31] font-mono font-medium">Priority: Critical</p>
                <p className="text-[10px] text-[#454B55] font-mono">Category: Refrigeration</p>
                <p className="text-[10px] text-[#454B55] font-mono">Operator: Alex Kumar</p>
              </div>
              <p className="text-[9px] text-[#7C8490] mt-1.5 font-mono">3:12 PM</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 max-w-[210px] shadow-sm">
              <p className="text-[11px] text-[#111318] leading-relaxed">
                Alex is dispatching reefer technician. Current temp: 42&deg;F (limit: 34&deg;F). ETA: 18 min.
              </p>
              <p className="text-[9px] text-[#7C8490] mt-1 font-mono">3:13 PM</p>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 border-t border-[#DFE2E6] bg-white flex items-center gap-2">
          <div className="flex-1 bg-[#F6F7F8] rounded-full px-3 py-1.5">
            <span className="text-[10px] text-[#7C8490]">Message...</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#0B8841] flex items-center justify-center">
            <PaperPlaneTilt size={13} className="text-white" weight="fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Product Mockup: Analytics Dashboard
   (Represents actual /dashboard analytics)
   ═══════════════════════════════════════════ */

function AnalyticsDashboardMockup() {
  return (
    <div className="rounded-xl border border-[#DFE2E6] bg-white shadow-lg shadow-black/[0.05] overflow-hidden">
      <div className="flex items-center gap-4 px-3 h-8 border-b border-[#DFE2E6] bg-[#FAFAFA]">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
          <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
          <div className="w-2 h-2 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded border border-[#DFE2E6] px-2 py-0.5 text-[9px] text-[#7C8490] font-mono">
            app.fleetrelay.com/dashboard
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#F6F7F8] space-y-3">
        {/* KPI cards - matches actual app */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Ticket, value: "142", label: "Total Tickets", desc: "This month" },
            { icon: Warning, value: "23", label: "Unresolved", desc: "Open + In Progress" },
            { icon: Clock, value: "8m", label: "Avg. Pickup Time", desc: "Time to first claim" },
            { icon: Timer, value: "2h 14m", label: "Avg. Handling Time", desc: "Claim to resolution" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg border border-[#DFE2E6] p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-medium text-[#111318]">{stat.label}</span>
                  <Icon size={10} weight="fill" className="text-[#111318]" />
                </div>
                <p className="font-mono text-sm font-semibold text-[#111318]">{stat.value}</p>
                <p className="text-[7px] text-[#7C8490]">{stat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Ticket Volume area chart + Status donut */}
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-3 bg-white rounded-lg border border-[#DFE2E6] p-2.5">
            <p className="text-[9px] font-medium text-[#111318] mb-2">Ticket Volume</p>
            <svg viewBox="0 0 200 60" className="w-full h-12">
              <line x1="0" y1="15" x2="200" y2="15" stroke="#EEF0F2" strokeWidth="0.5" />
              <line x1="0" y1="30" x2="200" y2="30" stroke="#EEF0F2" strokeWidth="0.5" />
              <line x1="0" y1="45" x2="200" y2="45" stroke="#EEF0F2" strokeWidth="0.5" />
              <path d="M0,42 C14,40 20,46 34,38 C48,30 52,36 68,32 C84,28 90,22 108,18 C126,14 130,24 142,20 C154,16 168,14 182,12 C192,10 196,11 200,12" fill="none" stroke="#4A90D9" strokeWidth="1.5" />
              <path d="M0,42 C14,40 20,46 34,38 C48,30 52,36 68,32 C84,28 90,22 108,18 C126,14 130,24 142,20 C154,16 168,14 182,12 C192,10 196,11 200,12 L200,60 L0,60 Z" fill="url(#analyticGradBlue)" />
              <path d="M0,50 C14,48 20,52 34,46 C48,40 52,44 68,40 C84,36 90,32 108,28 C126,24 130,32 142,28 C154,24 168,22 182,20 C192,18 196,19 200,20" fill="none" stroke="#4DAB9A" strokeWidth="1.5" />
              <path d="M0,50 C14,48 20,52 34,46 C48,40 52,44 68,40 C84,36 90,32 108,28 C126,24 130,32 142,28 C154,24 168,22 182,20 C192,18 196,19 200,20 L200,60 L0,60 Z" fill="url(#analyticGradTeal)" />
              <defs>
                <linearGradient id="analyticGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="analyticGradTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4DAB9A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4DAB9A" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex gap-3 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-0.5 rounded bg-[#4A90D9]" />
                <span className="text-[7px] text-[#7C8490]">Created</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-0.5 rounded bg-[#4DAB9A]" />
                <span className="text-[7px] text-[#7C8490]">Resolved</span>
              </div>
            </div>
          </div>
          <div className="col-span-2 bg-white rounded-lg border border-[#DFE2E6] p-2.5">
            <p className="text-[9px] font-medium text-[#111318] mb-1">Status Breakdown</p>
            <div className="flex justify-center">
              <svg viewBox="0 0 80 80" className="w-12 h-12">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#2EAD5E" strokeWidth="8" strokeDasharray="75 113" strokeLinecap="round" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="#E5954B" strokeWidth="8" strokeDasharray="45 143" strokeDashoffset="-75" strokeLinecap="round" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="#5B9EF0" strokeWidth="8" strokeDasharray="38 150" strokeDashoffset="-120" strokeLinecap="round" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="#71767F" strokeWidth="8" strokeDasharray="20 168" strokeDashoffset="-158" strokeLinecap="round" />
                <text x="40" y="42" textAnchor="middle" fontSize="10" fontWeight="600" fill="#111318" fontFamily="monospace">142</text>
              </svg>
            </div>
            <div className="mt-1 space-y-0.5">
              {[
                { label: "Resolved", color: "#2EAD5E" },
                { label: "Open", color: "#E5954B" },
                { label: "In Progress", color: "#5B9EF0" },
                { label: "Dismissed", color: "#71767F" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[7px] text-[#7C8490]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category + Source + Top Operators (3-col) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg border border-[#DFE2E6] p-2">
            <p className="text-[8px] font-medium text-[#111318] mb-1.5">Issues by Category</p>
            <div className="space-y-1">
              {[
                { label: "Breakdown", w: "85%", color: "#EF6461" },
                { label: "Scheduling", w: "65%", color: "#5B9EF0" },
                { label: "Documents", w: "50%", color: "#8B7FD7" },
                { label: "Payment", w: "40%", color: "#2EAD5E" },
                { label: "Complaint", w: "30%", color: "#E5954B" },
              ].map((c) => (
                <div key={c.label}>
                  <span className="text-[7px] text-[#7C8490]">{c.label}</span>
                  <div className="h-1.5 bg-[#EEF0F2] rounded-full mt-0.5">
                    <div className="h-full rounded-full" style={{ width: c.w, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#DFE2E6] p-2">
            <p className="text-[8px] font-medium text-[#111318] mb-1.5">Ticket Sources</p>
            <div className="flex justify-center">
              <svg viewBox="0 0 60 60" className="w-10 h-10">
                <circle cx="30" cy="30" r="22" fill="none" stroke="#5B9EF0" strokeWidth="7" strokeDasharray="90 48" strokeLinecap="round" />
                <circle cx="30" cy="30" r="22" fill="none" stroke="#E5954B" strokeWidth="7" strokeDasharray="48 90" strokeDashoffset="-90" strokeLinecap="round" />
                <text x="30" y="32" textAnchor="middle" fontSize="8" fontWeight="600" fill="#111318" fontFamily="monospace">65</text>
              </svg>
            </div>
            <div className="mt-1.5 space-y-1">
              {[
                { label: "Direct Messages", color: "#5B9EF0" },
                { label: "Group Chats", color: "#E5954B" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[7px] text-[#7C8490]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#DFE2E6] p-2">
            <p className="text-[8px] font-medium text-[#111318] mb-1.5">Top Operators</p>
            {[
              { name: "Maria Santos", score: 142, rank: 1 },
              { name: "Alex Kumar", score: 128, rank: 2 },
              { name: "Chris O'Brien", score: 119, rank: 3 },
            ].map((op) => (
              <div key={op.name} className="flex items-center gap-1.5 py-1 border-b border-[#DFE2E6] last:border-b-0">
                <span className={`text-[8px] font-mono w-2.5 ${op.rank === 1 ? "text-[#C07D10] font-bold" : op.rank === 2 ? "text-[#8B8F96] font-bold" : "text-[#B87333] font-bold"}`}>{op.rank}</span>
                <span className="text-[8px] text-[#111318] font-medium flex-1 truncate">{op.name}</span>
                <span className="text-[7px] font-mono text-[#7C8490]">{op.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Product Mockup: Dashboard Content Only
   (No sidebar — used in analytics section)
   ═══════════════════════════════════════════ */

function DashboardContentMockup() {
  return (
    <div className="rounded-xl border border-[#DFE2E6] bg-white shadow-lg shadow-black/[0.05] overflow-hidden">
      <div className="flex items-center gap-4 px-4 h-9 border-b border-[#DFE2E6] bg-[#FAFAFA]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-md border border-[#DFE2E6] px-3 py-0.5 text-[10px] text-[#7C8490] font-mono">
            app.fleetrelay.com/dashboard
          </div>
        </div>
        <div className="w-12" />
      </div>

      <div className="p-5 bg-[#F6F7F8] space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-[#111318]">Dashboard</h3>
          <p className="text-[10px] text-[#7C8490]">Overview of your fleet support operations.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Ticket, value: "142", label: "Total Tickets", desc: "This month" },
            { icon: Warning, value: "23", label: "Unresolved", desc: "Open + In Progress" },
            { icon: Clock, value: "8m", label: "Avg. Pickup Time", desc: "Time to first claim" },
            { icon: Timer, value: "2h 14m", label: "Avg. Handling Time", desc: "Claim to resolution" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg border border-[#DFE2E6] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-medium text-[#111318]">{stat.label}</span>
                  <Icon size={13} weight="fill" className="text-[#111318]" />
                </div>
                <p className="font-mono text-lg font-semibold text-[#111318]">{stat.value}</p>
                <p className="text-[8px] text-[#7C8490] mt-0.5">{stat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Ticket Volume + Status Breakdown */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 bg-white rounded-lg border border-[#DFE2E6] p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-medium text-[#111318]">Ticket Volume</p>
              <div className="flex gap-1">
                <span className="text-[7px] text-[#7C8490] px-1.5 py-0.5 rounded bg-[#EEF0F2]">7 days</span>
                <span className="text-[7px] text-[#111318] font-medium px-1.5 py-0.5 rounded border border-[#DFE2E6] bg-white">15 days</span>
                <span className="text-[7px] text-[#7C8490] px-1.5 py-0.5 rounded bg-[#EEF0F2]">1 month</span>
              </div>
            </div>
            <svg viewBox="0 0 280 80" className="w-full h-20">
              <line x1="0" y1="20" x2="280" y2="20" stroke="#EEF0F2" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="280" y2="40" stroke="#EEF0F2" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="280" y2="60" stroke="#EEF0F2" strokeWidth="0.5" />
              <path d="M0,58 C18,56 28,62 46,52 C64,42 70,48 92,44 C114,40 122,32 148,26 C174,20 178,34 196,28 C214,22 234,18 254,16 C268,14 276,15 280,16" fill="none" stroke="#4A90D9" strokeWidth="1.5" />
              <path d="M0,58 C18,56 28,62 46,52 C64,42 70,48 92,44 C114,40 122,32 148,26 C174,20 178,34 196,28 C214,22 234,18 254,16 C268,14 276,15 280,16 L280,80 L0,80 Z" fill="url(#contentGradBlue)" />
              <path d="M0,65 C18,63 28,68 46,60 C64,52 70,56 92,52 C114,48 122,42 148,38 C174,34 178,42 196,38 C214,34 234,30 254,28 C268,26 276,27 280,28" fill="none" stroke="#4DAB9A" strokeWidth="1.5" />
              <path d="M0,65 C18,63 28,68 46,60 C64,52 70,56 92,52 C114,48 122,42 148,38 C174,34 178,42 196,38 C214,34 234,30 254,28 C268,26 276,27 280,28 L280,80 L0,80 Z" fill="url(#contentGradTeal)" />
              <defs>
                <linearGradient id="contentGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A90D9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4A90D9" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="contentGradTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4DAB9A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4DAB9A" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-0.5 rounded bg-[#4A90D9]" />
                <span className="text-[8px] text-[#7C8490]">Created</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-0.5 rounded bg-[#4DAB9A]" />
                <span className="text-[8px] text-[#7C8490]">Resolved</span>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-lg border border-[#DFE2E6] p-3">
            <p className="text-[10px] font-medium text-[#111318] mb-2">Status Breakdown</p>
            <div className="flex justify-center">
              <svg viewBox="0 0 100 100" className="w-20 h-20">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#2EAD5E" strokeWidth="9" strokeDasharray="95 143" strokeLinecap="round" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#E5954B" strokeWidth="9" strokeDasharray="57 181" strokeDashoffset="-95" strokeLinecap="round" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#5B9EF0" strokeWidth="9" strokeDasharray="47 191" strokeDashoffset="-152" strokeLinecap="round" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#71767F" strokeWidth="9" strokeDasharray="25 213" strokeDashoffset="-199" strokeLinecap="round" />
                <text x="50" y="48" textAnchor="middle" fontSize="13" fontWeight="600" fill="#111318" fontFamily="monospace">142</text>
                <text x="50" y="59" textAnchor="middle" fontSize="8" fill="#7C8490">Total</text>
              </svg>
            </div>
            <div className="mt-2 space-y-1">
              {[
                { label: "Resolved", color: "#2EAD5E", count: "96" },
                { label: "Open", color: "#E5954B", count: "28" },
                { label: "In Progress", color: "#5B9EF0", count: "14" },
                { label: "Dismissed", color: "#71767F", count: "4" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[8px] text-[#7C8490] flex-1">{s.label}</span>
                  <span className="text-[8px] font-mono font-medium text-[#111318]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category + Source + Top Operators */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-[#DFE2E6] p-3">
            <p className="text-[9px] font-medium text-[#111318] mb-2">Issues by Category</p>
            <div className="space-y-1.5">
              {[
                { label: "Breakdown", w: "85%", color: "#EF6461" },
                { label: "Scheduling", w: "65%", color: "#5B9EF0" },
                { label: "Documents", w: "50%", color: "#8B7FD7" },
                { label: "Payment", w: "40%", color: "#2EAD5E" },
                { label: "Complaint", w: "30%", color: "#E5954B" },
              ].map((c) => (
                <div key={c.label}>
                  <span className="text-[8px] text-[#7C8490]">{c.label}</span>
                  <div className="h-2 bg-[#EEF0F2] rounded-full mt-0.5">
                    <div className="h-full rounded-full" style={{ width: c.w, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#DFE2E6] p-3">
            <p className="text-[9px] font-medium text-[#111318] mb-2">Ticket Sources</p>
            <div className="flex justify-center">
              <svg viewBox="0 0 80 80" className="w-14 h-14">
                <circle cx="40" cy="40" r="28" fill="none" stroke="#5B9EF0" strokeWidth="8" strokeDasharray="115 61" strokeLinecap="round" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="#E5954B" strokeWidth="8" strokeDasharray="61 115" strokeDashoffset="-115" strokeLinecap="round" />
                <text x="40" y="42" textAnchor="middle" fontSize="10" fontWeight="600" fill="#111318" fontFamily="monospace">65</text>
              </svg>
            </div>
            <div className="mt-2 space-y-1">
              {[
                { label: "Direct Messages", color: "#5B9EF0" },
                { label: "Group Chats", color: "#E5954B" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[8px] text-[#7C8490]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#DFE2E6] p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-medium text-[#111318]">Top Operators</p>
              <span className="text-[7px] font-medium text-[#0B8841]">Full leaderboard</span>
            </div>
            {[
              { name: "Maria Santos", score: 142, rank: 1 },
              { name: "Alex Kumar", score: 128, rank: 2 },
              { name: "Chris O'Brien", score: 119, rank: 3 },
            ].map((op) => (
              <div key={op.name} className="flex items-center gap-2 py-1.5 border-b border-[#DFE2E6] last:border-b-0">
                <span className={`text-[9px] font-mono w-3 font-bold ${op.rank === 1 ? "text-[#C07D10]" : op.rank === 2 ? "text-[#8B8F96]" : "text-[#B87333]"}`}>{op.rank}</span>
                <span className="text-[9px] text-[#111318] font-medium flex-1 truncate">{op.name}</span>
                <span className="text-[8px] font-mono text-[#7C8490]">{op.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Feature Explorer (adapted from V8)
   ═══════════════════════════════════════════ */

const featureTabs = [
  {
    id: "telegram",
    label: "Telegram Integration",
    icon: TelegramLogo,
    headline: "Every message becomes a ticket",
    desc: "Drivers don't install anything. They message on Telegram. FleetRelay turns every message into a structured, classified ticket automatically.",
    points: ["DM and Group chat support", "Photo and voice messages", "Multi-language handling", "Zero driver training"],
  },
  {
    id: "tickets",
    label: "Ticket Management",
    icon: Ticket,
    headline: "Everything your team needs, nothing they don't",
    desc: "Filter by priority, status, or category. Assign operators. Track SLA. All from one clean interface built for speed.",
    points: ["Smart search and filters", "Bulk actions and assignments", "SLA compliance tracking", "Full ticket detail with timeline"],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: ChartBar,
    headline: "See what matters, when it matters",
    desc: "Real-time KPIs, ticket pipeline, category breakdowns, and operator leaderboards. Your complete fleet support performance at a glance.",
    points: ["Live ticket volume and pipeline", "Response time trend analysis", "Category distribution breakdowns", "Operator performance leaderboards"],
  },
  {
    id: "eld",
    label: "ELD Integration",
    icon: Plug,
    headline: "Vehicle data at your fingertips",
    desc: "Every ticket enriched with real-time ELD data from ZippyELD. Engine diagnostics, GPS, speed, and HOS data pulled automatically.",
    points: ["Real-time engine diagnostics", "GPS location enrichment", "Hours of Service tracking", "Fault code detection"],
  },
];

function FeatureExplorer() {
  const [activeTab, setActiveTab] = useState("telegram");
  const active = featureTabs.find((t) => t.id === activeTab)!;

  return (
    <div>
      {/* Centered tab bar */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-1 bg-[#F6F7F8] rounded-xl p-1 overflow-x-auto">
          {featureTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white text-[#111318] shadow-sm"
                    : "text-[#7C8490] hover:text-[#454B55]"
                }`}
              >
                <Icon size={16} weight={activeTab === tab.id ? "bold" : "regular"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Text side */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#111318] tracking-tight">{active.headline}</h3>
            <p className="mt-4 text-[#454B55] leading-relaxed">{active.desc}</p>
            <div className="mt-6 space-y-3">
              {active.points.map((p) => (
                <div key={p} className="flex items-center gap-2.5">
                  <CheckCircle size={18} className="text-[#0B8841]" weight="fill" />
                  <span className="text-sm text-[#454B55]">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div>
            {activeTab === "telegram" && <TelegramPhoneMockup />}

            {activeTab === "tickets" && <TicketTableMockup />}

            {activeTab === "analytics" && <AnalyticsDashboardMockup />}

            {activeTab === "eld" && (
              <div className="rounded-xl border border-[#DFE2E6] bg-white shadow-lg shadow-black/[0.05] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm font-semibold text-[#111318]">TK-1042</span>
                  <span className="text-[10px] font-mono bg-[#CD2B31]/10 text-[#CD2B31] px-2 py-0.5 rounded-full">Critical</span>
                </div>
                <h4 className="font-semibold text-sm text-[#111318] mb-3">Engine overheating on I-40</h4>
                <div className="space-y-2.5 mb-4">
                  {[
                    { icon: User, label: "Driver", value: "Marcus Johnson" },
                    { icon: Truck, label: "Vehicle", value: "Peterbilt 579 #2847" },
                    { icon: MapPin, label: "Location", value: "I-40, MM 234, Amarillo TX" },
                  ].map((row) => {
                    const Icon = row.icon;
                    return (
                      <div key={row.label} className="flex items-center gap-3">
                        <Icon size={14} className="text-[#7C8490]" />
                        <span className="text-xs text-[#7C8490] w-14">{row.label}</span>
                        <span className="text-xs text-[#111318] font-medium">{row.value}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-4 border-t border-[#DFE2E6]">
                  <div className="flex items-center gap-2 mb-3">
                    <Plug size={14} className="text-[#0B8841]" weight="bold" />
                    <span className="text-[10px] text-[#0B8841] uppercase tracking-wider font-medium">ZippyELD Data</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Engine Temp", value: "284\u00B0F", alert: true },
                      { label: "Speed", value: "0 mph" },
                      { label: "HOS Left", value: "6h 42m" },
                      { label: "Fault Code", value: "P0217", alert: true },
                    ].map((d) => (
                      <div key={d.label} className="bg-[#F6F7F8] rounded-lg p-2.5 text-center">
                        <p className={`font-mono text-sm font-bold ${d.alert ? "text-[#CD2B31]" : "text-[#111318]"}`}>{d.value}</p>
                        <p className="text-[9px] text-[#7C8490] mt-0.5">{d.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   FAQ Accordion
   ═══════════════════════════════════════════ */

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqItems.map((item, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#DFE2E6] overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="text-sm font-medium text-[#111318] pr-4">{item.q}</span>
            <motion.div
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <CaretDown size={16} className="text-[#7C8490]" />
            </motion.div>
          </button>
          <motion.div
            initial={false}
            animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              <p className="text-sm text-[#454B55] leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */

export default function LandingV9() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ─── Navbar ─── */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#DFE2E6]/60">
        <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={22} weight="fill" className="text-[#111318]" />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-[#111318]">Fleet</span>
              <span className="text-[#0B8841]">Relay</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#454B55]">
            <button onClick={() => scrollTo("explore")} className="hover:text-[#111318] transition-colors">Features</button>
            <button onClick={() => scrollTo("how-it-works")} className="hover:text-[#111318] transition-colors">How it works</button>
            <Link href="/pricing" className="hover:text-[#111318] transition-colors">Pricing</Link>
            <button onClick={() => scrollTo("faq")} className="hover:text-[#111318] transition-colors">FAQ</button>
          </div>
          <Link href="/signup" className="bg-[#0B8841] hover:bg-[#097435] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Get Started
          </Link>
        </nav>
      </header>

      {/* ─── Hero (V6) ─── */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#111318] tracking-tight leading-[1.08]">
              One dashboard for <span className="text-[#0B8841]">every</span>
              <br />
              driver, <span className="text-[#0B8841]">every</span> ticket, <span className="text-[#0B8841]">every</span> mile
            </h1>
            <p className="mt-5 text-lg text-[#454B55] max-w-xl mx-auto leading-relaxed">
              FleetRelay turns Telegram messages into structured tickets, classifies them with AI, and gives your operators a single pane of glass to manage everything.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link href="/signup" className="bg-[#0B8841] hover:bg-[#097435] text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors">
                Get Started
              </Link>
              <button
                onClick={() => scrollTo("how-it-works")}
                className="text-[#454B55] hover:text-[#111318] font-medium text-sm flex items-center gap-2 transition-colors"
              >
                See how it works <ArrowRight size={16} />
              </button>
            </div>
          </FadeIn>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-16 bg-[#0B8841]/[0.04] blur-3xl rounded-full pointer-events-none" />
            <div className="relative" style={{ perspective: "1200px" }}>
              <div style={{ transform: "rotateX(2deg)", transformStyle: "preserve-3d" }}>
                <DashboardOverviewMockup />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Explore the Platform (V8, adapted) ─── */}
      <section id="explore" className="py-20 md:py-24 bg-[#F6F7F8]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111318] tracking-tight">
              Explore the <span className="text-[#0B8841]">platform</span>
            </h2>
            <p className="mt-4 text-lg text-[#454B55]">Click a tab to see each feature in action</p>
          </FadeIn>
          <FadeIn>
            <FeatureExplorer />
          </FadeIn>
        </div>
      </section>

      {/* ─── How It Works (V6) ─── */}
      <section id="how-it-works" className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111318] tracking-tight">
              Four steps. <span className="text-[#0B8841]">Zero friction.</span>
            </h2>
            <p className="mt-4 text-[#454B55] max-w-lg mx-auto">
              No app downloads for drivers. No complex integrations. Connect your Telegram Business Account and go.
            </p>
          </FadeIn>

          <div className="relative grid gap-8 md:grid-cols-4 md:gap-4">
            <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-[2px] bg-gradient-to-r from-transparent via-[#111318] to-transparent md:block" />

            {[
              { num: "01", icon: TelegramLogo, title: "Connect Telegram", desc: "Link your Telegram Business Account in one click. FleetRelay starts listening to DMs and group chats instantly." },
              { num: "02", icon: Brain, title: "AI classifies everything", desc: "Every message is analyzed by our two-layer AI. Priority, category, location, and vehicle data are extracted automatically." },
              { num: "03", icon: Lightning, title: "Operators get notified", desc: "The right operator receives the ticket on their dashboard with full context, ELD data, and a suggested response." },
              { num: "04", icon: CheckCircle, title: "Resolve and track", desc: "Operators respond, escalate, or close tickets. Every action is logged with timestamps and SLA tracking." },
            ].map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1} className="relative flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-[104px] w-[104px] items-center justify-center rounded-2xl border border-[#DFE2E6] bg-[#F6F7F8]">
                    <step.icon size={36} weight="regular" className="text-[#454B55]" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0B8841] text-xs font-bold text-white font-mono">
                    {step.num}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-[#111318]">{step.title}</h3>
                <p className="max-w-[220px] text-sm leading-relaxed text-[#7C8490]">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature: Ticket Management (V6) ─── */}
      <section className="py-20 md:py-24 bg-[#F6F7F8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111318] tracking-tight">
                Everything your team <span className="text-[#0B8841]">needs</span>, nothing they don&apos;t
              </h2>
              <p className="mt-4 text-[#454B55] leading-relaxed">
                Filter by priority, status, or category. Assign operators with one click. Track SLA compliance in real time. A focused interface designed for speed, not clutter.
              </p>
              <div className="mt-6 space-y-3">
                {["Smart filters and bulk actions", "One-click operator assignment", "SLA tracking with time-critical alerts", "Full ticket detail with driver and ELD data"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={18} className="text-[#0B8841]" weight="fill" />
                    <span className="text-sm text-[#454B55]">{f}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <TicketTableMockup />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Feature: Analytics (V6, FLIPPED: image left, text right) ─── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeIn>
              <DashboardContentMockup />
            </FadeIn>
            <FadeIn delay={0.15}>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111318] tracking-tight">
                See <span className="text-[#0B8841]">what matters</span>, act on <span className="text-[#0B8841]">what counts</span>
              </h2>
              <p className="mt-4 text-[#454B55] leading-relaxed">
                Real-time KPIs, category breakdowns, response time trends, and operator performance. Know exactly how your fleet support is performing at every moment.
              </p>
              <div className="mt-6 space-y-3">
                {["Live ticket volume and resolution rates", "Response time trend analysis", "Category distribution breakdowns", "Operator performance leaderboards"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={18} className="text-[#0B8841]" weight="fill" />
                    <span className="text-sm text-[#454B55]">{f}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── FAQ (V6) ─── */}
      <section id="faq" className="py-20 md:py-24 bg-[#F6F7F8]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111318] tracking-tight">Frequently asked <span className="text-[#0B8841]">questions</span></h2>
            <p className="mt-4 text-lg text-[#454B55]">Everything you need to know about FleetRelay</p>
          </FadeIn>
          <FadeIn>
            <FAQAccordion />
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer (V6) ─── */}
      <footer className="bg-white border-t border-[#DFE2E6]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <Truck size={20} weight="fill" className="text-[#111318]" />
                <span className="font-bold text-lg tracking-tight">
                  <span className="text-[#111318]">Fleet</span>
                  <span className="text-[#0B8841]">Relay</span>
                </span>
              </div>
              <p className="mt-2 text-xs text-[#7C8490] leading-relaxed">
                Fleet support ticketing that runs itself.
              </p>
            </div>
            {Object.entries(footerCols).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-xs text-[#454B55] font-semibold uppercase tracking-wider mb-3">{heading}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-[#7C8490] hover:text-[#111318] transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-[#DFE2E6] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#7C8490]">2026 FleetRelay. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#7C8490] hover:text-[#111318] transition-colors"><GlobeSimple size={16} /></a>
              <a href="#" className="text-[#7C8490] hover:text-[#111318] transition-colors"><EnvelopeSimple size={16} /></a>
              <a href="#" className="text-[#7C8490] hover:text-[#111318] transition-colors"><Phone size={16} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
