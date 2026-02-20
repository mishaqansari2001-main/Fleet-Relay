"use client";

import { motion } from "framer-motion";
import { Users, Timer, ChartLineUp, Headset } from "@phosphor-icons/react";

const metrics = [
  {
    icon: Users,
    value: "2,000+",
    label: "Active Drivers",
  },
  {
    icon: Timer,
    value: "3.2 min",
    label: "Avg Response Time",
  },
  {
    icon: ChartLineUp,
    value: "96%",
    label: "SLA Compliance",
  },
  {
    icon: Headset,
    value: "24/7",
    label: "Ticket Intake",
  },
];

export function Metrics() {
  return (
    <section className="relative bg-[#0A0B0D] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-[#222429] bg-[#111316] p-1">
          <div className="grid grid-cols-2 gap-px lg:grid-cols-4">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center gap-2 rounded-xl px-6 py-8"
              >
                <metric.icon size={24} weight="regular" className="text-[#2EAD5E] mb-1" />
                <span
                  className="text-3xl font-bold tracking-tight text-[#ECEDEE]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {metric.value}
                </span>
                <span className="text-sm text-[#55585F]">{metric.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
