import React from "react";
import { Link, useRouter } from "../lib/router";
import { POLICIES, POLICY_LAST_UPDATED, POLICY_NOTICE } from "../config/policies";

export const PolicyPage: React.FC = () => {
  const { path } = useRouter();
  const policy = POLICIES[path];
  if (!policy) return null;
  return <article id="policy-page" className="policy-print py-12 md:py-20">
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <header className="border-b border-stone-200 pb-8">
        <p className="text-sm font-semibold text-emerald-800">Tajweed Scholars policy</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-stone-950 md:text-5xl">{policy.title}</h1>
        <p className="mt-4 text-sm text-stone-500">Last updated: {POLICY_LAST_UPDATED}</p>
        <p className="mt-6 text-lg leading-8 text-stone-700">{policy.summary}</p>
      </header>
      <aside aria-labelledby="phase-1-policy-notice" className="my-8 border-l-4 border-amber-400 bg-amber-50 px-5 py-4">
        <h2 id="phase-1-policy-notice" className="font-bold text-stone-950">Phase 1 policy notice</h2>
        <p className="mt-1 text-sm leading-6 text-stone-700">{POLICY_NOTICE}</p>
      </aside>
      <div className="space-y-9">
        {policy.sections.map((section) => <section key={section.heading}>
          <h2 className="font-display text-2xl font-bold text-stone-950">{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-3 leading-7 text-stone-700">{paragraph}</p>)}
          {section.bullets && <ul className="mt-4 list-disc space-y-3 pl-6 text-stone-700">{section.bullets.map((item) => <li key={item} className="pl-1 leading-7">{item}</li>)}</ul>}
          {section.closingParagraphs?.map((paragraph) => <p key={paragraph} className="mt-3 leading-7 text-stone-700">{paragraph}</p>)}
          {section.steps && <ol className="mt-4 list-decimal space-y-3 pl-6 text-stone-700">{section.steps.map((item) => <li key={item} className="pl-1 leading-7">{item}</li>)}</ol>}
          {section.table && <div className="mt-5 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr>{section.table.headers.map((header) => <th key={header} scope="col" className="border border-stone-300 bg-stone-100 p-3 font-bold">{header}</th>)}</tr></thead><tbody>{section.table.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell} className="border border-stone-300 p-3 align-top leading-6">{index === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>)}</tbody></table></div>}
        </section>)}
      </div>
      <nav aria-label="Policy support links" className="mt-12 border-t border-stone-200 pt-7 text-sm">
        <p className="font-bold text-stone-950">Official contact and related policies</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3"><Link to="/contact" className="font-semibold text-emerald-800 underline underline-offset-4">Contact Tajweed Scholars</Link><Link to="/complaints" className="font-semibold text-emerald-800 underline underline-offset-4">Complaints Process</Link><Link to="/privacy-policy" className="font-semibold text-emerald-800 underline underline-offset-4">Privacy Policy</Link></div>
      </nav>
    </div>
  </article>;
};
