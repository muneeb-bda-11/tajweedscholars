import React from "react";
import { TRUST_STRIP } from "../config/site";
import { Icon } from "./Icon";

export const TrustStrip: React.FC = () => {
  return (
    <section className="bg-emerald-50/65 border-y border-emerald-800/10 py-6 md:py-8 relative overflow-hidden" id="trust-strip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 justify-between">
          {TRUST_STRIP.map((point, index) => {
            // Pick corresponding icon
            const icons = ["BadgeCheck", "Users", "Compass", "LineChart"];
            return (
              <div 
                key={index} 
                className="flex items-center gap-3.5"
                id={`trust-point-${index}`}
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-emerald-800/10 text-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name={icons[index] || "Check"} size={18} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-xs text-emerald-900 uppercase tracking-wider">
                    {point.title}
                  </h3>
                  <p className="text-stone-500 text-[11px] font-normal leading-normal mt-0.5">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
