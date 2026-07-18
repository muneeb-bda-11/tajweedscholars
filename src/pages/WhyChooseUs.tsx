import React, { useEffect } from "react";
import { TRUST_STRIP, WHY_CHOOSE_US } from "../config/site";
import { Icon } from "../components/Icon";
import { Link } from "../lib/router";
import { SafeguardingSummary } from "../components/SafeguardingSummary";

export const WhyChooseUs: React.FC = () => {
  useEffect(() => { document.title = "Why Choose Tajweed Scholars"; }, []);
  return <div className="py-14 md:py-20" id="why-choose-us-page"><section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold text-emerald-800">Why Tajweed Scholars</p><h1 className="mt-3 font-display text-4xl font-bold text-stone-950 md:text-5xl">Quiet scholarly confidence, personal attention</h1><p className="mt-5 leading-7 text-stone-600">A private learning path supported by verified teaching credentials, clear placement, and regular feedback.</p></div>
    <div className="mt-12 grid gap-5 md:grid-cols-3">{WHY_CHOOSE_US.map((feature) => <article key={feature.id} className="rounded-2xl border border-stone-200 bg-white p-6"><Icon name={feature.icon} size={23} className="text-emerald-800" /><h2 className="mt-5 text-xl font-bold text-stone-950">{feature.title}</h2><p className="mt-3 font-semibold leading-6 text-stone-800">{feature.boldText}</p><p className="mt-3 text-sm leading-6 text-stone-600">{feature.description}</p></article>)}</div>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{TRUST_STRIP.map((point) => <div key={point.title} className="border-l-2 border-amber-400 pl-4"><h2 className="font-bold text-stone-950">{point.title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{point.description}</p></div>)}</div>
    <SafeguardingSummary />
    <div className="mt-12 text-center"><Link to="/free-trial" className="inline-flex min-h-12 items-center rounded-lg bg-emerald-800 px-6 text-sm font-bold text-stone-50">Book 3 Free Trial Classes</Link></div>
  </section></div>;
};
