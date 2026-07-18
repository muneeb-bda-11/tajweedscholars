import React, { useEffect, useState } from "react";
import { PRICING_PLANS, PRICING } from "../config/site";
import { Icon } from "../components/Icon";
import { Link } from "../lib/router";
import { PRICING_FAQS } from "../config/pageContent";
import { TrialFaqAccordion } from "../components/TrialFaqAccordion";

export const Pricing: React.FC = () => {
  const [currency, setCurrency] = useState<keyof typeof PRICING.currencies>("USD");
  const [selected, setSelected] = useState(1);
  const money = PRICING.currencies[currency];
  useEffect(() => { document.title = "Online Quran Class Pricing | Tajweed Scholars"; try { const region = new Intl.Locale(navigator.language).region as keyof typeof PRICING.localeCurrencies | undefined; if (region && PRICING.localeCurrencies[region]) setCurrency(PRICING.localeCurrencies[region]); } catch { /* USD remains the safe default; users can always change it. */ } }, []);

  return (
    <div className="py-14 md:py-20" id="pricing-page">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-emerald-800">Tuition and schedules</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-stone-950 md:text-5xl">Plans from $40/month</h1>
          <p className="mt-5 leading-7 text-stone-600">Every regular class is a live, private 30-minute lesson on Zoom. Choose one to five days per week or a weekend schedule after your three free trial classes.</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <label className="text-sm font-bold">View prices in <select value={currency} onChange={(e) => setCurrency(e.target.value as keyof typeof PRICING.currencies)} className="ml-3 min-h-11 rounded-lg border border-stone-300 bg-white px-3">{Object.keys(PRICING.currencies).map((code) => <option key={code}>{code}</option>)}</select></label>
          <fieldset className="mt-6"><legend className="text-sm font-bold">Weekly frequency</legend><div className="mt-3 grid gap-2 sm:grid-cols-5">{PRICING_PLANS.slice(0,5).map((plan, index) => <button type="button" key={plan.id} onClick={() => setSelected(index)} aria-pressed={selected === index} className={`min-h-12 rounded-lg border px-2 text-sm font-bold ${selected === index ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-stone-200"}`}>{index + 1} day{index ? "s" : ""}</button>)}</div></fieldset>
          <div className="mt-6 rounded-xl bg-emerald-50 p-5"><p className="text-sm font-bold text-emerald-800">{PRICING_PLANS[selected].title}</p><p className="mt-1 text-3xl font-bold">{money.symbol}{money.rates[selected]} <span className="text-sm font-normal text-stone-600">{currency}/month</span></p><p className="mt-2 text-sm text-stone-600">{PRICING_PLANS[selected].frequency} · private 30-minute Zoom classes</p></div>
        </div>
        <section className="mx-auto mt-10 max-w-4xl"><h2 className="text-center text-2xl font-bold">What every plan includes</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{PRICING_PLANS[0].features.map((feature) => <li key={feature} className="flex gap-2 rounded-lg border border-stone-200 bg-white p-4 text-sm"><Icon name="Check" size={16} className="shrink-0 text-emerald-800"/>{feature}</li>)}</ul></section>
        <section className="mx-auto mt-10 max-w-4xl"><h2 className="text-2xl font-bold">Weekend options</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{PRICING_PLANS.slice(5).map((plan, i) => <article key={plan.id} className="rounded-xl border border-stone-200 bg-white p-5"><h3 className="font-bold">{plan.title}</h3><p className="mt-1 text-sm text-stone-600">{plan.frequency}</p><p className="mt-4 text-2xl font-bold">{money.symbol}{money.rates[i+5]} <span className="text-sm font-normal">{currency}/month</span></p></article>)}</div></section>

        <section className="mx-auto mt-12 max-w-3xl"><h2 className="text-center text-2xl font-bold">Pricing FAQ</h2><TrialFaqAccordion faqs={PRICING_FAQS}/></section><div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center md:px-10">
          <h2 className="font-display text-2xl font-bold">Begin with three free trial classes</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">Admissions will confirm placement, scheduling, and the suitable monthly plan after the trial experience.</p>
          <Link to="/free-trial" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-800 px-6 text-sm font-bold text-white">Book 3 Free Trial Classes</Link>
        </div>
      </section>
    </div>
  );
};
