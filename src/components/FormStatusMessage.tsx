import React from "react";
import { Icon } from "./Icon";
import { SITE_CONFIG } from "../config/site";

interface FormStatusProps {
  status: "idle" | "loading" | "success" | "error";
  isDemo?: boolean;
  errorMessage?: string;
  formType: "trial" | "contact";
}

export const FormStatusMessage: React.FC<FormStatusProps> = ({
  status,
  isDemo = true,
  errorMessage,
  formType
}) => {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="bg-stone-100 border border-stone-200 rounded-xl p-5 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-700 text-sm font-semibold">Submitting request securely...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
        <Icon name="AlertCircle" className="text-red-700 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-display font-semibold text-red-950 text-sm">Submission Failed</h4>
          <p className="text-red-700 text-xs md:text-sm mt-1">
            {errorMessage || "We encountered an issue submitting your request. Please try again or reach out to us directly."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    const isTrial = formType === "trial";
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-sm max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Icon name="CheckCircle2" size={32} />
        </div>
        
        <div className="space-y-3">
          <h3 className="font-display font-bold text-2xl text-emerald-950">
            JazakAllahu Khairan
          </h3>
          <p className="text-stone-800 text-sm md:text-base leading-relaxed">
            {isTrial
              ? "Your complimentary placement request has been received. Our team will contact you through WhatsApp to confirm a suitable time for Trial 1."
              : "Your message has been received. A real member of our team will respond as quickly as possible, usually within one business day."}
          </p>
        </div>

        {/* WhatsApp Integration button */}
        {isTrial && (
          <div className="pt-2">
            <a
              href={SITE_CONFIG.WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-stone-50 bg-emerald-850 hover:bg-emerald-900 transition-colors shadow-md hover:scale-102 duration-200"
            >
              <Icon name="MessageSquare" size={18} />
              Connect Instantly on WhatsApp
            </a>
            <p className="text-[10px] text-stone-400 mt-2 font-mono">
              Speed up booking by messaging our admissions desk directly
            </p>
          </div>
        )}

        {isDemo && (
          <div className="mt-4 bg-amber-50 border border-amber-200/50 rounded-lg p-3 text-left">
            <p className="text-amber-800 text-[11px] leading-relaxed font-medium">
              ⚠️ <strong>Demo submission only.</strong> No personal information was saved or transmitted. If this was a production app, this would route to your configured CRM or secure webhook.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};
