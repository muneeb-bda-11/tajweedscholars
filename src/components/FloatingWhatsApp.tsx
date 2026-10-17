import React from "react";
import { SITE_CONFIG } from "../config/site";
import { WhatsAppIcon } from "./WhatsAppCta";

/**
 * FloatingWhatsApp — global sticky WhatsApp chat button.
 * Mobile: sits above the MobileTrialBar (which is ~5.5rem tall).
 * Desktop: bottom-right corner.
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={SITE_CONFIG.WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Tajweed Scholars on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-[6.75rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
