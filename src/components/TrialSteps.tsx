import React from "react";
import { TRIAL_STEPS } from "../config/site";
import { Icon } from "./Icon";

export const TrialSteps: React.FC<{ showIntro?: boolean }> = ({ showIntro = true }) => {
  return (
    <div className="w-full" id="trial-steps-component">
      {showIntro && (
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full font-sans">
            How it works
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-bold text-stone-900 mt-3">
            Your Three-Class Trial Journey
          </h2>
          <p className="text-stone-600 text-sm md:text-base mt-3 font-medium">
            All three trial classes are free. No payment details or card inputs are required to book.
          </p>
        </div>
      )}

      {/* Steps layout - visual line connection */}
      <div className="relative max-w-5xl mx-auto">
        {/* Continuous timeline line on desktop */}
        <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-100 via-emerald-600 to-emerald-100 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {TRIAL_STEPS.map((step) => {
            const icons = ["Compass", "BookOpen", "BadgeCheck"];
            return (
              <div
                key={step.number}
                className="bg-white border border-stone-200/50 rounded-xl p-6 md:p-8 flex flex-col items-center text-center shadow-sm relative group hover:border-emerald-600 hover:shadow-md transition-all duration-300"
                id={`trial-step-card-${step.number}`}
              >
                {/* Step badge */}
                <div className="absolute -top-4 bg-emerald-800 text-stone-50 font-sans text-xs font-bold px-3 py-1 rounded-full border border-emerald-700 shadow-sm">
                  Step {step.number}
                </div>

                {/* Step icon */}
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon name={icons[step.number - 1] || "Check"} size={26} />
                </div>

                <h3 className="font-sans font-bold text-lg text-stone-900 leading-tight">
                  {step.subtitle}
                </h3>
                
                <p className="text-xs uppercase tracking-wider text-emerald-800 font-bold mt-1.5 font-sans">
                  {step.title}
                </p>

                <p className="text-stone-600 text-sm mt-4 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 bg-amber-50 border border-amber-200/40 rounded-lg p-4 max-w-2xl mx-auto flex items-start gap-3">
        <Icon name="AlertCircle" className="text-amber-800 shrink-0 mt-0.5" size={18} />
        <p className="text-stone-700 text-xs md:text-sm leading-relaxed">
          <strong>No separate assessment class:</strong> We respect your time. Placement and current Quran level analysis happen live inside the first half of <strong>Trial 1</strong>, immediately followed by an authentic mini-lesson.
        </p>
      </div>
    </div>
  );
};
