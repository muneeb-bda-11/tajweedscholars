import React, { useState } from "react";
import { Icon } from "./Icon";

export type TrialFaq = readonly [question: string, answer: string];
export const nextOpenFaq = (current: number | null, selected: number) => current === selected ? null : selected;

export function TrialFaqAccordion({ faqs }: { faqs: readonly TrialFaq[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return <div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">{faqs.map(([question, answer], index) => {
    const isOpen = openFaq === index, answerId = `trial-faq-answer-${index}`;
    return <div key={question}><h3><button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenFaq((current) => nextOpenFaq(current, index))} className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 p-4 text-left text-sm font-bold text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700">{question}<Icon name="ChevronDown" size={17} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} /></button></h3>{isOpen && <div id={answerId} role="region" className="px-4 pb-4 pr-12 text-sm leading-6 text-stone-600">{answer}</div>}</div>;
  })}</div>;
}
