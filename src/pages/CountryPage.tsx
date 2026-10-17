import React from "react";
import { countryPageForPath } from "../content/countryPages";
import { Icon } from "../components/Icon";
import { Link, useRouter } from "../lib/router";
import { TrialFaqAccordion } from "../components/TrialFaqAccordion";

export const CountryPage: React.FC = () => {
  const { path } = useRouter();
  const country = countryPageForPath(path);
  if (!country) return null;

  return (
    <div className="py-14 md:py-20" id={`country-page-${country.path.replace(/\//g, "")}`}>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-emerald-800">Live 1-to-1 Quran classes · {country.countryName}</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-stone-950 md:text-5xl">{country.title}</h1>
          {country.intro.map((paragraph) => <p key={paragraph.slice(0, 32)} className="mt-5 leading-7 text-stone-600">{paragraph}</p>)}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <h2 className="text-xl font-bold text-stone-950">Class timings</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600"><Icon name="Clock" size={14} className="mr-1 inline-block text-emerald-800" />{country.timezoneLine}</p>
          <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
            <thead><tr><th scope="col" className="border border-stone-300 bg-stone-100 p-3 font-bold">Slot</th><th scope="col" className="border border-stone-300 bg-stone-100 p-3 font-bold">Detail</th></tr></thead>
            <tbody>{country.timingRows.map((row) => <tr key={row.slot}><td className="border border-stone-300 p-3 align-top font-bold">{row.slot}</td><td className="border border-stone-300 p-3 align-top leading-6 text-stone-600">{row.detail}</td></tr>)}</tbody>
          </table></div>
          <p className="mt-3 text-sm leading-6 text-stone-600">{country.timingNote}</p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-stone-950">Areas served</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-stone-600">Families across {country.countryName} learn with Tajweed Scholars, including:</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">{country.cities.map((city) => <li key={city} className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm font-semibold text-stone-700">{city}</li>)}</ul>
        </div>

        <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center md:px-10">
          <h2 className="font-display text-2xl font-bold text-stone-950">{country.pricingTeaser}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">{country.pricingCurrencyNote} Every regular class is a live, private 30-minute lesson on Zoom.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/pricing" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-emerald-800 px-6 text-sm font-bold text-emerald-900">View all plans</Link>
            <Link to="/free-trial" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-800 px-6 text-sm font-bold text-white">Book 3 Free Trial Classes</Link>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-stone-950">Frequently asked questions</h2>
          <TrialFaqAccordion faqs={country.faqs} />
        </section>

        <div className="mx-auto mt-12 max-w-3xl text-center">
          <p className="text-sm leading-6 text-stone-600">Also explore our <Link to="/kids-quran-classes" className="font-bold text-emerald-800 underline underline-offset-4">Kids Quran Classes</Link>, <Link to="/adult-quran-classes" className="font-bold text-emerald-800 underline underline-offset-4">Adult Quran Classes</Link>, <Link to="/hifz-program" className="font-bold text-emerald-800 underline underline-offset-4">Hifz Program</Link>, and <Link to="/tajweed-course" className="font-bold text-emerald-800 underline underline-offset-4">Tajweed Course</Link>.</p>
        </div>
      </section>
    </div>
  );
};
