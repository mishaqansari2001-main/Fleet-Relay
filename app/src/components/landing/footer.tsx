"use client";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Documentation", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#222429] bg-[#0A0B0D] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center gap-0">
              <span className="text-lg font-semibold tracking-tight text-[#ECEDEE]">
                Fleet
              </span>
              <span className="text-lg font-semibold tracking-tight text-[#2EAD5E]">
                Relay
              </span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#55585F]">
              Fleet support ticketing for trucking and logistics. Telegram to
              dashboard in seconds.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-[#8B8F96]">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#55585F] transition-colors duration-200 hover:text-[#ECEDEE]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#222429] pt-8 sm:flex-row">
          <p className="text-xs text-[#55585F]">
            &copy; {new Date().getFullYear()} FleetRelay. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs text-[#55585F] transition-colors duration-200 hover:text-[#8B8F96]"
            >
              Status
            </a>
            <span className="text-[#222429]">|</span>
            <a
              href="#"
              className="text-xs text-[#55585F] transition-colors duration-200 hover:text-[#8B8F96]"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
