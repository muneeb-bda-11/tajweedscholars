import React from "react";
import { Link } from "../lib/router";
import { Icon } from "./Icon";

export const SafeguardingSummary: React.FC = () => <section id="safeguarding-summary" className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 md:p-8" aria-labelledby="safeguarding-summary-title">
  <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white"><Icon name="ShieldCheck" size={21}/></span><div>
    <h2 id="safeguarding-summary-title" className="font-display text-2xl font-bold text-stone-950">Safeguarding children in private online classes</h2>
    <p className="mt-3 leading-7 text-stone-700">A parent or guardian is the official contact for every student under 18, and communication stays within official Tajweed Scholars WhatsApp, email, and Zoom channels.</p>
  </div></div>
  <ul className="mt-5 grid gap-3 pl-5 text-sm leading-6 text-stone-700 md:grid-cols-2">
    <li className="list-disc">Teacher checks include identity and verified Sanad/Ijazah credentials, with a signed safeguarding agreement.</li>
    <li className="list-disc">Parents report concerns through an official contact. During Phase 1, the interim safeguarding lead is the Founder / Operations Lead.</li>
  </ul>
  <Link to="/child-safeguarding" className="mt-5 inline-flex min-h-11 items-center font-bold text-emerald-800 underline underline-offset-4">Read the full Child Safeguarding Policy</Link>
</section>;
