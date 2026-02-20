"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0A0B0D]">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#ECEDEE 1px, transparent 1px), linear-gradient(90deg, #ECEDEE 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial glow behind the orb area */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 opacity-20">
        <div className="absolute left-[-10%] top-[15%] h-[600px] w-[600px] rounded-full bg-[#2EAD5E]/20 blur-[128px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen flex-col items-center justify-center lg:flex-row lg:items-center">
        {/* Left — Spline Orb (absolute positioned to bleed to viewport edge) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block"
          style={{ width: '45vw', height: '80vh' }}
        >
          <iframe
            src="https://my.spline.design/reactiveorb-cN00uqZJSgWXfWhVnMIpTInW/"
            frameBorder="0"
            width="100%"
            height="100%"
            className="pointer-events-auto"
            title="3D Orb"
            style={{ border: 'none' }}
          />
        </motion.div>

        {/* Right — Text Content (pushed to right half) */}
        <div className="flex max-w-xl flex-col items-center pt-32 text-center lg:items-start lg:pt-0 lg:text-left lg:ml-auto lg:mr-[8vw]">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#222429] bg-[#111316] px-3.5 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#2EAD5E]" />
            <span className="text-xs font-medium text-[#8B8F96]">
              Built for fleet operations
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold leading-[1.1] tracking-tight text-[#ECEDEE] sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Fleet support,{" "}
            <span className="text-[#2EAD5E]">resolved faster.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-5 max-w-lg text-base leading-relaxed text-[#8B8F96] sm:text-lg"
          >
            Drivers message on Telegram. FleetRelay auto-creates tickets,
            classifies urgency with AI, and routes to the right operator —
            in seconds, not hours.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
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
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#222429] bg-transparent px-6 text-sm font-medium text-[#ECEDEE] transition-all duration-200 hover:border-[#32353C] hover:bg-[#111316]"
            >
              See how it works
            </a>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex items-center gap-8"
          >
            {[
              { value: "< 3 min", label: "Avg response time" },
              { value: "96%", label: "SLA rate" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="text-lg font-semibold text-[#ECEDEE] font-mono"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs text-[#55585F]">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile Spline orb fallback */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative mt-12 h-[350px] w-full lg:hidden"
        >
          <iframe
            src="https://my.spline.design/reactiveorb-cN00uqZJSgWXfWhVnMIpTInW/"
            frameBorder="0"
            width="100%"
            height="100%"
            className="pointer-events-auto"
            title="3D Orb"
          />
        </motion.div>
      </div>

      {/* Bottom fade for transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0B0D] to-transparent" />
    </section>
  );
}
