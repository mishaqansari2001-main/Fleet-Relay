"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "@phosphor-icons/react";

const tiers = [
  {
    name: "Starter",
    description: "For small fleets getting started with automated support.",
    price: "$199",
    period: "/mo",
    features: [
      "Up to 200 drivers",
      "1 Telegram Business Account",
      "Auto-ticketing from DMs",
      "Basic classification (Layer 1)",
      "Email support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing fleets that need AI-powered classification.",
    price: "$599",
    period: "/mo",
    features: [
      "Up to 1,000 drivers",
      "2 Telegram Business Accounts",
      "DM + Group chat ticketing",
      "AI classification (Layer 1 + 2)",
      "ELD integration (ZippyELD)",
      "Real-time dashboard & analytics",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale operations with custom requirements.",
    price: "Custom",
    period: "",
    features: [
      "Unlimited drivers",
      "Multiple business accounts",
      "Custom AI training",
      "Multiple ELD integrations",
      "Dedicated account manager",
      "Custom SLA agreements",
      "API access",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-[#0A0B0D] py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-[#2EAD5E]">Pricing</p>
          <h2
            className="text-3xl font-bold tracking-tight text-[#ECEDEE] sm:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[#8B8F96]">
            No hidden fees. No per-ticket charges. Just one plan that scales
            with your fleet.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-xl border p-6 transition-colors duration-300 ${
                tier.highlighted
                  ? "border-[#2EAD5E]/30 bg-[#111316]"
                  : "border-[#222429] bg-[#111316] hover:border-[#32353C]"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-6">
                  <span className="rounded-full bg-[#2EAD5E] px-3 py-1 text-xs font-semibold text-[#0A0B0D]">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#ECEDEE]">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-[#55585F]">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold tracking-tight text-[#ECEDEE]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-[#55585F]">{tier.period}</span>
                )}
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-[#2EAD5E]"
                    />
                    <span className="text-sm text-[#8B8F96]">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.cta === "Contact sales" ? "#" : "/signup"}
                className={`group inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  tier.highlighted
                    ? "bg-[#2EAD5E] text-[#0A0B0D] hover:bg-[#38C06B]"
                    : "border border-[#222429] bg-transparent text-[#ECEDEE] hover:border-[#32353C] hover:bg-[#18191E]"
                }`}
              >
                {tier.cta}
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
