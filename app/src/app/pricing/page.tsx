"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Lightning,
  Buildings,
  Truck,
  Users,
  Headset,
  ChartBar,
  Robot,
  TelegramLogo,
  ShieldCheck,
  Plug,
  Clock,
  CaretDown,
  GlobeSimple,
  EnvelopeSimple,
  Phone,
} from "@phosphor-icons/react";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const tiers = [
  {
    name: "Starter",
    price: "$199",
    period: "/mo",
    desc: "For small fleets getting started with structured support.",
    icon: Truck,
    features: [
      "Up to 200 drivers",
      "Telegram DM support",
      "Basic AI classification",
      "Email notifications",
      "5 operator seats",
      "Standard support",
      "Basic analytics",
    ],
    highlighted: false,
    cta: "Get Started",
    ctaLink: "#",
  },
  {
    name: "Professional",
    price: "$599",
    period: "/mo",
    desc: "For growing operations that need full visibility and integrations.",
    icon: Lightning,
    features: [
      "Up to 1,000 drivers",
      "DM + Group chat support",
      "Advanced AI with ELD data",
      "Real-time push notifications",
      "25 operator seats",
      "Priority support",
      "ZippyELD integration",
      "Full analytics dashboard",
      "SLA tracking",
      "Custom ticket categories",
    ],
    highlighted: true,
    cta: "Get Started",
    ctaLink: "#",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large fleet operations needing dedicated infrastructure.",
    icon: Buildings,
    features: [
      "Unlimited drivers",
      "Custom integrations",
      "Dedicated AI model",
      "24/7 phone support",
      "Unlimited operators",
      "SLA guarantees",
      "Dedicated account manager",
      "On-premise deployment option",
      "Custom reporting",
      "SSO / SAML",
    ],
    highlighted: false,
    cta: "Contact sales",
    ctaLink: "#",
  },
];

const comparisonFeatures = [
  {
    category: "Channels",
    features: [
      { name: "Telegram DMs", starter: true, pro: true, enterprise: true },
      { name: "Telegram Groups", starter: false, pro: true, enterprise: true },
      {
        name: "Custom integrations",
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "AI & Automation",
    features: [
      {
        name: "AI ticket classification",
        starter: "Basic",
        pro: "Advanced",
        enterprise: "Custom model",
      },
      {
        name: "Priority detection",
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: "ELD data enrichment",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Auto-routing",
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Management",
    features: [
      {
        name: "Operator seats",
        starter: "5",
        pro: "25",
        enterprise: "Unlimited",
      },
      {
        name: "Driver capacity",
        starter: "200",
        pro: "1,000",
        enterprise: "Unlimited",
      },
      { name: "SLA tracking", starter: false, pro: true, enterprise: true },
      {
        name: "Custom categories",
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Analytics & Reporting",
    features: [
      {
        name: "Dashboard analytics",
        starter: "Basic",
        pro: "Full",
        enterprise: "Custom",
      },
      {
        name: "Operator performance",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Trend analysis",
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: "Custom reports",
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    features: [
      {
        name: "Support level",
        starter: "Email",
        pro: "Priority",
        enterprise: "24/7 Phone",
      },
      {
        name: "Onboarding",
        starter: "Self-serve",
        pro: "Guided",
        enterprise: "White-glove",
      },
      {
        name: "SLA guarantees",
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: "Dedicated account manager",
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];

const faqs = [
  {
    q: "Can I get a demo before committing?",
    a: "Absolutely. Our team is happy to walk you through the platform with a guided demo. Just reach out through our contact page and we will set up a time that works for you.",
  },
  {
    q: "Can I change plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time. When upgrading, you get immediate access to new features and we prorate the billing. Downgrades take effect at the next billing cycle.",
  },
  {
    q: "How does driver counting work?",
    a: "We count unique drivers who have sent at least one message through Telegram in the current billing period. Inactive drivers do not count toward your limit.",
  },
  {
    q: "What happens if I exceed my driver limit?",
    a: "We will notify you when you reach 80% and 100% of your limit. You can continue operating normally for a grace period while you upgrade. We never cut off support to your drivers.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes. Annual billing gives you two months free (pay for 10, get 12). Contact us for annual pricing on Enterprise plans.",
  },
  {
    q: "What ELD systems do you integrate with?",
    a: "We currently integrate with ZippyELD for real-time driver and vehicle data enrichment. Enterprise plans support custom ELD integrations through our API.",
  },
];

function CellValue({
  value,
}: {
  value: boolean | string;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={16} className="text-[#0B8841]" weight="bold" />
    ) : (
      <span className="text-[#C0C6CE]">&mdash;</span>
    );
  }
  return (
    <span className="text-sm text-[#454B55] font-medium">{value}</span>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#DFE2E6] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-medium text-[#111318] pr-4 group-hover:text-[#0B8841] transition-colors">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <CaretDown
            size={16}
            className="text-[#7C8490]"
            weight="bold"
          />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="text-sm text-[#454B55] leading-relaxed pb-5">
          {a}
        </p>
      </motion.div>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const getPrice = (price: string) => {
    if (price === "Custom") return "Custom";
    const monthly = parseInt(price.replace("$", ""));
    if (annual) {
      const annualMonthly = Math.round(monthly * 10 / 12);
      return `$${annualMonthly}`;
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#DFE2E6]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Truck size={22} weight="fill" className="text-[#111318]" />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-[#111318]">Fleet</span>
              <span className="text-[#0B8841]">Relay</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-[#454B55] hover:text-[#111318] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              Back to home
            </Link>
            <Link href="/signup" className="bg-[#0B8841] hover:bg-[#097435] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-16 pb-4 md:pt-20 md:pb-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-bold text-[#111318] tracking-tight leading-[1.1]">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-[#454B55] max-w-xl mx-auto">
              No hidden fees. No per-ticket charges. Predictable monthly
              pricing that scales with your fleet.
            </p>
          </FadeIn>

          {/* Billing toggle */}
          <FadeIn delay={0.1}>
            <div className="mt-8 inline-flex items-center gap-3 bg-white rounded-full border border-[#DFE2E6] p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all ${
                  !annual
                    ? "bg-[#111318] text-white"
                    : "text-[#7C8490] hover:text-[#454B55]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  annual
                    ? "bg-[#111318] text-white"
                    : "text-[#7C8490] hover:text-[#454B55]"
                }`}
              >
                Annual
                <span className="text-[10px] font-mono bg-[#0B8841]/10 text-[#0B8841] px-1.5 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Pricing Cards ─── */}
      <section className="py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-5">
            {tiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <FadeIn key={tier.name} delay={i * 0.08}>
                  <div
                    className={`rounded-xl border p-6 h-full flex flex-col bg-white transition-shadow ${
                      tier.highlighted
                        ? "border-[#0B8841] shadow-lg shadow-[#0B8841]/[0.06] relative"
                        : "border-[#DFE2E6] hover:shadow-md hover:shadow-black/[0.04]"
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B8841] text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide uppercase">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            tier.highlighted
                              ? "bg-[#0B8841]/10"
                              : "bg-[#F6F7F8]"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={
                              tier.highlighted
                                ? "text-[#0B8841]"
                                : "text-[#7C8490]"
                            }
                            weight="bold"
                          />
                        </div>
                        <h3 className="font-semibold text-[#111318]">
                          {tier.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#7C8490] leading-relaxed">
                        {tier.desc}
                      </p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-mono text-4xl font-bold text-[#111318] tracking-tight">
                          {getPrice(tier.price)}
                        </span>
                        {tier.period && (
                          <span className="text-sm text-[#7C8490]">
                            {tier.period}
                          </span>
                        )}
                      </div>
                      {annual && tier.price !== "Custom" && (
                        <p className="text-xs text-[#0B8841] mt-1 font-medium">
                          Billed annually (2 months free)
                        </p>
                      )}
                    </div>

                    <div className="flex-1 space-y-2.5 mb-6">
                      {tier.features.map((f) => (
                        <div key={f} className="flex items-start gap-2.5">
                          <Check
                            size={15}
                            className={`flex-shrink-0 mt-0.5 ${
                              tier.highlighted
                                ? "text-[#0B8841]"
                                : "text-[#C0C6CE]"
                            }`}
                            weight="bold"
                          />
                          <span className="text-sm text-[#454B55]">{f}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={tier.ctaLink}
                      className={`block w-full py-2.5 rounded-lg text-sm font-medium text-center transition-colors ${
                        tier.highlighted
                          ? "bg-[#0B8841] hover:bg-[#097435] text-white"
                          : "border border-[#DFE2E6] text-[#454B55] hover:bg-[#F6F7F8] hover:text-[#111318]"
                      }`}
                    >
                      {tier.cta}
                    </a>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.2}>
            <p className="text-center text-xs text-[#7C8490] mt-6">
              No per-ticket charges. Predictable monthly pricing.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── What's Included (icon row) ─── */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111318] tracking-tight">
              Every plan includes
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {
                icon: TelegramLogo,
                title: "Telegram Integration",
                desc: "Auto-create tickets from driver messages",
              },
              {
                icon: Robot,
                title: "AI Classification",
                desc: "Automatic priority and category assignment",
              },
              {
                icon: ChartBar,
                title: "Analytics Dashboard",
                desc: "Real-time metrics and performance data",
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Security",
                desc: "SOC 2 compliance and encrypted data",
              },
              {
                icon: Headset,
                title: "Operator Dashboard",
                desc: "Full-featured web dashboard for your team",
              },
              {
                icon: Clock,
                title: "SLA Monitoring",
                desc: "Track response times and resolution rates",
              },
              {
                icon: Plug,
                title: "Webhooks & API",
                desc: "Connect with your existing tools",
              },
              {
                icon: Users,
                title: "Team Management",
                desc: "Roles, permissions, and assignment rules",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.title} delay={i * 0.05}>
                  <div className="bg-white rounded-xl border border-[#DFE2E6] p-5 h-full">
                    <Icon
                      size={20}
                      className="text-[#0B8841] mb-3"
                      weight="regular"
                    />
                    <h3 className="text-sm font-semibold text-[#111318] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#7C8490] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Feature Comparison Table ─── */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111318] tracking-tight">
              Compare plans
            </h2>
            <p className="mt-3 text-sm text-[#454B55]">
              See exactly what you get with each tier
            </p>
          </FadeIn>

          <FadeIn>
            <div className="bg-white rounded-xl border border-[#DFE2E6] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_100px_100px] md:grid-cols-[1fr_140px_140px_140px] border-b border-[#DFE2E6] bg-[#FAFAFA]">
                <div className="p-4">
                  <span className="text-xs font-semibold text-[#7C8490] uppercase tracking-wider">
                    Feature
                  </span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-xs font-semibold text-[#7C8490] uppercase tracking-wider">
                    Starter
                  </span>
                </div>
                <div className="p-4 text-center border-x border-[#0B8841]/10 bg-[#0B8841]/[0.02]">
                  <span className="text-xs font-semibold text-[#0B8841] uppercase tracking-wider">
                    Pro
                  </span>
                </div>
                <div className="p-4 text-center">
                  <span className="text-xs font-semibold text-[#7C8490] uppercase tracking-wider">
                    Enterprise
                  </span>
                </div>
              </div>

              {/* Table body */}
              {comparisonFeatures.map((group) => (
                <div key={group.category}>
                  <div className="px-4 py-3 bg-[#F6F7F8] border-b border-[#DFE2E6]">
                    <span className="text-xs font-semibold text-[#454B55] uppercase tracking-wider">
                      {group.category}
                    </span>
                  </div>
                  {group.features.map((f, j) => (
                    <div
                      key={f.name}
                      className={`grid grid-cols-[1fr_100px_100px_100px] md:grid-cols-[1fr_140px_140px_140px] ${
                        j < group.features.length - 1
                          ? "border-b border-[#DFE2E6]"
                          : ""
                      }`}
                    >
                      <div className="p-4">
                        <span className="text-sm text-[#454B55]">
                          {f.name}
                        </span>
                      </div>
                      <div className="p-4 flex items-center justify-center">
                        <CellValue value={f.starter} />
                      </div>
                      <div className="p-4 flex items-center justify-center border-x border-[#0B8841]/10 bg-[#0B8841]/[0.01]">
                        <CellValue value={f.pro} />
                      </div>
                      <div className="p-4 flex items-center justify-center">
                        <CellValue value={f.enterprise} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <FadeIn className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111318] tracking-tight">
              Frequently asked questions
            </h2>
          </FadeIn>

          <FadeIn>
            <div className="bg-white rounded-xl border border-[#DFE2E6] px-6">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-center text-sm text-[#7C8490] mt-6">
              Have more questions?{" "}
              <a
                href="#"
                className="text-[#0B8841] font-medium hover:underline"
              >
                Talk to our team
              </a>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="bg-[#111318] rounded-2xl px-8 py-12 md:px-12 md:py-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                <div className="absolute top-8 left-8 right-8 bottom-8 rounded-xl border border-white/20">
                  <div className="w-full h-10 border-b border-white/20" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 border-b border-white/10" />
                  ))}
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Start resolving tickets faster
                </h2>
                <p className="mt-3 text-[#8B8F96] max-w-md mx-auto">
                  Get started in under 30 minutes. Simple setup, immediate results.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/signup" className="bg-[#0B8841] hover:bg-[#097435] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                    Get Started
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                  <button className="border border-[#32353C] text-[#8B8F96] hover:text-white hover:border-[#55585F] px-6 py-3 rounded-lg font-medium text-sm transition-colors">
                    Talk to sales
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#DFE2E6] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Truck size={20} weight="fill" className="text-[#111318]" />
              <span className="font-bold text-lg tracking-tight">
                <span className="text-[#111318]">Fleet</span>
                <span className="text-[#0B8841]">Relay</span>
              </span>
            </div>
            <span className="text-xs text-[#7C8490]">
              Fleet support ticketing that runs itself.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-[#7C8490] hover:text-[#111318] transition-colors"
            >
              <GlobeSimple size={16} />
            </a>
            <a
              href="#"
              className="text-[#7C8490] hover:text-[#111318] transition-colors"
            >
              <EnvelopeSimple size={16} />
            </a>
            <a
              href="#"
              className="text-[#7C8490] hover:text-[#111318] transition-colors"
            >
              <Phone size={16} />
            </a>
            <span className="text-xs text-[#7C8490]">
              2026 FleetRelay. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
