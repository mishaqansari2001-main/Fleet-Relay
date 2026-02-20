"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "@phosphor-icons/react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0B0D]/80 backdrop-blur-xl border-b border-[#222429]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-0">
          <span className="text-lg font-semibold tracking-tight text-[#ECEDEE]">
            Fleet
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#2EAD5E]">
            Relay
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#8B8F96] transition-colors duration-200 hover:text-[#ECEDEE]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="text-sm text-[#8B8F96] transition-colors duration-200 hover:text-[#ECEDEE]"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="inline-flex h-9 items-center rounded-lg bg-[#2EAD5E] px-4 text-sm font-medium text-[#0A0B0D] transition-all duration-200 hover:bg-[#38C06B] active:scale-[0.97]"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8B8F96] transition-colors hover:text-[#ECEDEE] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-[#222429] bg-[#0A0B0D]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-[#8B8F96] transition-colors hover:bg-[#111316] hover:text-[#ECEDEE]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-[#222429] pt-3">
                <a
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-full items-center justify-center rounded-lg border border-[#222429] text-sm font-medium text-[#ECEDEE] transition-all hover:bg-[#111316]"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-[#2EAD5E] text-sm font-medium text-[#0A0B0D] transition-all hover:bg-[#38C06B]"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
