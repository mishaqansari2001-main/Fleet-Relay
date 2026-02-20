"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

export function CTA() {
  return (
    <section className="relative bg-[#0A0B0D] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-[#222429] bg-[#111316] px-6 py-16 text-center sm:px-16"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2EAD5E]/8 blur-[100px]" />
          </div>

          <div className="relative">
            <h2
              className="text-3xl font-bold tracking-tight text-[#ECEDEE] sm:text-4xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              Ready to streamline fleet support?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-[#8B8F96]">
              Get your fleet on FleetRelay in under 30 minutes. No app install
              for drivers — just connect Telegram and go.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/signup"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2EAD5E] px-6 text-sm font-medium text-[#0A0B0D] transition-all duration-200 hover:bg-[#38C06B] active:scale-[0.97]"
              >
                Start free trial
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#222429] bg-transparent px-6 text-sm font-medium text-[#ECEDEE] transition-all duration-200 hover:border-[#32353C] hover:bg-[#18191E]"
              >
                Schedule a demo
              </a>
            </div>

            <p className="mt-6 text-xs text-[#55585F]">
              Free 14-day trial. No credit card required.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
