"use client";

import { motion } from "framer-motion";
import {
  Ticket,
  Brain,
  ChartBar,
  PlugsConnected,
} from "@phosphor-icons/react";

const features = [
  {
    icon: Ticket,
    title: "Auto-Ticketing",
    description:
      "Drivers send a Telegram message. FleetRelay captures it, creates a structured ticket, and routes it to your dashboard — no phone calls, no manual entry.",
  },
  {
    icon: Brain,
    title: "Smart Classification",
    description:
      "Two-layer AI pipeline: deterministic rules catch the obvious, GPT-4o-mini handles the rest. Every ticket gets tagged with urgency, category, and priority automatically.",
  },
  {
    icon: ChartBar,
    title: "Real-Time Dashboard",
    description:
      "See every open ticket, response time, and SLA metric in one place. Operators resolve issues from the web — no Telegram back-and-forth required.",
  },
  {
    icon: PlugsConnected,
    title: "ELD Integration",
    description:
      "Pull live data from ZippyELD — GPS location, engine status, Hours of Service — directly into each ticket for faster, more informed resolution.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative bg-[#0A0B0D] py-24">
      {/* Section Header */}
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 max-w-md"
        >
          <p className="mb-3 text-sm font-medium text-[#2EAD5E]">Features</p>
          <h2
            className="text-3xl font-bold tracking-tight text-[#ECEDEE] sm:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Everything your fleet ops team needs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#8B8F96]">
            From the moment a driver sends a message to the moment the ticket is
            resolved — every step is automated, tracked, and measurable.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-xl border border-[#222429] bg-[#111316] p-6 transition-colors duration-300 hover:border-[#32353C]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#222429] bg-[#18191E]">
                <feature.icon
                  size={20}
                  weight="regular"
                  className="text-[#8B8F96] transition-colors duration-300 group-hover:text-[#2EAD5E]"
                />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#ECEDEE]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#55585F]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
