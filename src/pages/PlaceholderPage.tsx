import React, { useEffect } from "react";
import { useRouter } from "../lib/router";
import { PROGRAMS, NAVIGATION_LINKS, SITE_CONFIG } from "../config/site";
import { Icon } from "../components/Icon";

export const PlaceholderPage: React.FC = () => {
  const { path, navigate } = useRouter();

  // Find if this matches one of our actual programs
  const program = PROGRAMS.find((p) => p.path === path);

  // If not, find if it's one of company links or policies
  let pageTitle = "Page Under Construction";
  let pageSubtitle = "Our curriculum scholars and designers are finalizing this section.";
  
  const mainNavMatch = NAVIGATION_LINKS.main.find((link) => link.path === path);
  const otherMatch = NAVIGATION_LINKS.otherPlaceholders.find((link) => link.path === path);
  const policyMatch = NAVIGATION_LINKS.policies.find((link) => link.path === path);

  if (program) {
    pageTitle = program.title;
    pageSubtitle = "Program overview & syllabus details are being curated for Phase 1.";
  } else if (mainNavMatch) {
    pageTitle = mainNavMatch.label;
  } else if (otherMatch) {
    pageTitle = otherMatch.label;
  } else if (policyMatch) {
    pageTitle = policyMatch.label;
    pageSubtitle = "Official legal wording and terms are being compiled by legal counsel.";
  }

  useEffect(() => {
    document.title = `${pageTitle} | Tajweed Scholars`;
  }, [pageTitle]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24" id="placeholder-page-wrapper">
      <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-8 md:p-14 text-center space-y-8 shadow-sm">
        
        {/* Status Graphic */}
        <div className="relative flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-inner relative z-10 animate-pulse">
            <Icon name={program ? program.icon : "Compass"} size={36} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-emerald-150/10 rounded-full blur" />
        </div>

        {/* Content Details */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider font-mono">
            ✨ Academic Development Phase 1
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
            {pageTitle}
          </h1>
          
          <p className="text-stone-500 text-sm md:text-base leading-relaxed">
            {pageSubtitle}
          </p>

          {/* Show program specifics if applicable */}
          {program && (
            <div className="mt-8 p-6 bg-stone-100 rounded-2xl border border-stone-200/50 text-left space-y-4">
              <h3 className="font-display font-bold text-sm text-stone-900 uppercase tracking-wider">
                About this Program
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {program.fullDescription}
              </p>
              
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-emerald-850 uppercase tracking-wider font-mono">
                  Program Highlights:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Program highlights">
                  {program.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-stone-600">
                      <Icon name="Check" className="text-emerald-800 shrink-0 mt-0.5" size={14} />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Quick Help CTA */}
        <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/free-trial")}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-stone-50 bg-emerald-800 hover:bg-emerald-900 shadow transition-colors focus:outline-none"
          >
            Book 3 Free Trial Classes
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200/60 transition-colors focus:outline-none"
          >
            Return to Homepage
          </button>
        </div>

        {/* Contact direct notice */}
        <p className="text-stone-400 text-xs font-mono">
          Need immediate syllabus answers? Reach us at{" "}
          <a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="text-emerald-800 font-semibold underline">
            {SITE_CONFIG.CONTACT_EMAIL}
          </a>
        </p>

      </div>
    </div>
  );
};
