import React, { useState, useEffect } from "react";
import { useRouter } from "../lib/router";
import { SITE_CONFIG, PRICING_PLANS } from "../config/site";
import { FAQAccordion } from "../components/FAQAccordion";
import { Icon } from "../components/Icon";

export const Pricing: React.FC = () => {
  const { navigate } = useRouter();
  // State is pre-seeded with the central configuration value
  const [showExactPrices, setShowExactPrices] = useState(SITE_CONFIG.SHOW_EXACT_PRICES);

  useEffect(() => {
    document.title = "Online Quran Class Pricing | Tajweed Scholars";
  }, []);

  return (
    <div className="space-y-16 md:space-y-24 py-10 md:py-16" id="pricing-page">
      {/* 1. HERO HEADER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full font-sans">
          Tuition & Plans
        </span>
        
        <h1 className="font-sans text-3xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          Simple, Transparent Plans for Every Family
        </h1>

        <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Choose a schedule that fits your life, from once a week to daily intensive classes, with one dedicated teacher, live one-to-one on Zoom, and regular progress updates. Every plan starts with three free trial classes.
        </p>

        {/* COMPLIANT DEMO-MODE PRICE TOGGLER */}
        <div className="pt-4 flex flex-col items-center justify-center gap-3">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-stone-100 border border-stone-200/50 rounded-lg shadow-sm">
            <span className="text-xs text-stone-600 font-semibold font-sans">
              {showExactPrices ? "Exact prices enabled" : "Public view (approximate ranges)"}
            </span>
            <button
              onClick={() => setShowExactPrices(!showExactPrices)}
              id="pricing-exact-toggle"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 ${
                showExactPrices ? "bg-emerald-800" : "bg-stone-300"
              }`}
              role="switch"
              aria-checked={showExactPrices}
            >
              <span className="sr-only">Toggle exact prices</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-50 shadow ring-0 transition duration-200 ease-in-out ${
                  showExactPrices ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-stone-400 font-sans">
            Interactive switch linked to `SHOW_EXACT_PRICES` config (Currently default: {String(SITE_CONFIG.SHOW_EXACT_PRICES)})
          </p>
        </div>
      </section>

      {/* 2. PRICING GRID (7 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main plans wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-center">
          {PRICING_PLANS.map((plan) => {
            const isPopular = plan.isPopular;
            return (
              <div
                key={plan.id}
                className={`rounded-xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 border relative ${
                  isPopular
                    ? "bg-white border-emerald-800 shadow-md ring-2 ring-emerald-800/10 lg:scale-[1.03]"
                    : "bg-white border-stone-200/50 shadow-sm hover:border-stone-300"
                }`}
                id={`pricing-card-${plan.id}`}
              >
                {/* Popular Tag */}
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-800 text-stone-50 font-sans text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-700 shadow shadow-emerald-950/20">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  {/* Title & Frequency */}
                  <div>
                    <h3 className="font-sans font-bold text-xl text-stone-900">
                      {plan.title}
                    </h3>
                    <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider font-sans mt-1">
                      {plan.frequency}
                    </p>
                  </div>

                  {/* Price display depending on exact pricing mode */}
                  <div className="border-b border-stone-200/50 pb-5">
                    {showExactPrices ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-sans font-black text-stone-950">${plan.priceValue}</span>
                        <span className="text-stone-400 text-xs font-semibold">/ month</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-stone-700 text-sm font-semibold">Plans from</span>
                        <span className="text-2xl font-sans font-black text-stone-950">$40/month</span>
                      </div>
                    )}
                    <span className="text-[10px] text-stone-400 mt-1 block">Live 1-to-1 instruction</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3.5 text-xs text-stone-600 font-medium" aria-label={`Features of ${plan.title}`}>
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Icon name="Check" className="text-emerald-800 shrink-0 mt-0.5" size={14} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card action CTA */}
                <div className="pt-8 mt-6 border-t border-stone-200/50">
                  <button
                    onClick={() => navigate("/free-trial")}
                    className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isPopular
                        ? "bg-emerald-850 hover:bg-emerald-900 text-stone-50 shadow focus:ring-emerald-700"
                        : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/50 focus:ring-stone-500"
                    }`}
                  >
                    Book 3 Free Trial Classes
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transaction Disclaimer Info */}
        <div className="mt-12 bg-stone-100 border border-stone-200/50 rounded-xl p-5 max-w-3xl mx-auto flex items-start gap-3.5 text-stone-600 text-xs leading-relaxed shadow-inner">
          <Icon name="Lock" className="text-emerald-800 shrink-0 mt-0.5" size={16} />
          <div>
            <strong>Important Billing Notice:</strong> Automatic online checkout, card portals, and manual transfer credentials are not published on our platform to prevent payment interception. All registration, student setup, and invoice instructions are delivered directly to parent guardians via official admissions coordinators on WhatsApp only after completion of Trial 3.
          </div>
        </div>
      </section>

      {/* 3. FAQS BY PRICING CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-stone-100/35 border-y border-stone-200/50 py-16 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 font-sans">
            Subscription Terms
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-stone-900 mt-2">
            Pricing & Sibling Discounts FAQs
          </h2>
        </div>

        <FAQAccordion category="pricing" />
      </section>
    </div>
  );
};
