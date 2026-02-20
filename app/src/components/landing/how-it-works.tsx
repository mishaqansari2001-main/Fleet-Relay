"use client";

import { motion } from "framer-motion";
import {
  TelegramLogo,
  Robot,
  UserCircleCheck,
} from "@phosphor-icons/react";

const steps = [
  {
    number: "01",
    icon: TelegramLogo,
    title: "Driver messages in",
    description:
      "A driver sends a Telegram message — text, photo, or voice. FleetRelay captures it instantly from DMs or group chats.",
  },
  {
    number: "02",
    icon: Robot,
    title: "AI classifies the ticket",
    description:
      "The two-layer pipeline tags urgency, category, and priority. ELD data enriches the ticket with live truck location and status.",
  },
  {
    number: "03",
    icon: UserCircleCheck,
    title: "Operator resolves it",
    description:
      "The right operator gets the ticket on their dashboard. They respond, track progress, and close it — all from the web.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#0A0B0D] py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-[#2EAD5E]">
            How It Works
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-[#ECEDEE] sm:text-4xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Three steps. Zero friction.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-[#8B8F96]">
            No app downloads for drivers. No complex integrations. Just connect
            your Telegram Business Account and go.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3 md:gap-4">
          {/* Connecting line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-[#222429] to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number + Icon */}
              <div className="relative mb-6">
                <div className="flex h-[104px] w-[104px] items-center justify-center rounded-2xl border border-[#222429] bg-[#111316]">
                  <step.icon size={36} weight="regular" className="text-[#8B8F96]" />
                </div>
                <span
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2EAD5E] text-xs font-bold text-[#0A0B0D]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {step.number}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-[#ECEDEE]">
                {step.title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-[#55585F]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
