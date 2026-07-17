import React from "react";
import { SITE_CONFIG } from "../config/site";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.04 2a9.84 9.84 0 0 0-8.47 14.84L2 22l5.29-1.51A9.93 9.93 0 1 0 12.04 2Zm0 17.98a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.14.9.92-3.06-.2-.31A8.03 8.03 0 1 1 12.04 20Zm4.43-6.05c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-1.42-.71-2.35-1.27-3.29-2.88-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" /></svg>;
}

export function WhatsAppCta() {
  return <aside id="free-trial-whatsapp-cta" className="mx-auto mt-5 flex w-full max-w-[760px] flex-col items-start justify-between gap-3 rounded-xl border border-stone-200 bg-emerald-50 p-4 sm:flex-row sm:items-center" aria-labelledby="whatsapp-cta-title"><div><h3 id="whatsapp-cta-title" className="font-bold text-stone-800">Prefer WhatsApp?</h3><p className="mt-1 text-xs leading-5 text-stone-600">For quick questions only. Submit the form to request your three trial classes.</p></div><a href={SITE_CONFIG.WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Message Tajweed Scholars on WhatsApp for a quick question" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-emerald-800 bg-emerald-800 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-900 active:bg-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:w-auto"><WhatsAppIcon className="h-[21px] w-[21px]" />Message Tajweed Scholars</a></aside>;
}
