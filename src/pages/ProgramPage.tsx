import React, { useEffect } from "react";
import { PROGRAMS } from "../config/site";
import { Icon } from "../components/Icon";
import { Link, useRouter } from "../lib/router";
import { PROGRAM_FAQS, PROGRAM_VISUALS } from "../config/pageContent";
import { TrialFaqAccordion } from "../components/TrialFaqAccordion";

const audiences: Record<string, string> = {
  "kids-classes": "Children ages 4–15, from complete beginners to developing reciters.",
  "adult-classes": "Adult learners at any starting level who want private, respectful instruction.",
  "tajweed-course": "Learners who can read Quran and want systematic correction and stronger Tajweed.",
  "hifz-program": "Children, teenagers, and adults beginning or continuing Quran memorization.",
  "arabic-language": "Learners seeking Quranic Arabic or Modern Standard Arabic after an individual consultation.",
  "islamic-studies": "Children or adults enrolled in an eligible Quran program who would benefit from an Islamic Studies add-on."
};

const availability: Record<string, string> = {
  "arabic-language": "Phase 1 enrollment is consultation-based. Admissions will confirm whether a suitable class and teacher are available.",
  "islamic-studies": "Available in Phase 1 only as an add-on with eligible Quran programs, not as a standalone program. Admissions will confirm eligibility.",
};

export const ProgramPage: React.FC = () => {
  const { path } = useRouter();
  const program = PROGRAMS.find((item) => item.path === path);
  useEffect(() => { document.title = `${program?.title || "Program"} | Tajweed Scholars`; }, [program?.title]);
  if (!program) return null;
  const visual = PROGRAM_VISUALS[program.id];

  return (
    <div className="py-14 md:py-20" id={`program-page-${program.id}`}>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon name={program.icon} size={24} /></span>
            <h1 className="mt-6 font-display text-4xl font-bold text-stone-950 md:text-5xl">{program.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">{program.shortDescription}</p>
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="text-xl font-bold text-stone-950">What the student learns</h2>
              <p className="mt-3 leading-7 text-stone-600">{program.fullDescription}</p>
            </div>
          </div>

          <aside className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7 text-stone-800">
            <h2 className="font-display text-2xl font-bold">Who this is for</h2>
            <p className="mt-3 leading-7 text-stone-600">{audiences[program.id]}</p>
            <h2 className="mt-7 font-display text-2xl font-bold">How classes work</h2>
            <p className="mt-3 leading-7 text-stone-600">Live, private one-to-one classes take place through Zoom. Every regular class is 30 minutes, with placement and scheduling confirmed through the three-class free trial process.</p>
            <p className="mt-5 border-t border-emerald-200 pt-5 text-sm leading-6 text-stone-600">{availability[program.id] || "This is an active Phase 1 program. Teacher assignment and schedule remain subject to suitable placement and availability."}</p>
          </aside>
        </div>

        <section className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6" aria-label={`${program.title} signature learning pathway`}><h2 className="text-2xl font-bold">{visual.title}</h2><ol className={`mt-5 grid gap-3 ${visual.items.length > 4 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>{visual.items.map((item,index)=><li key={item} className="flex min-h-20 items-center gap-3 rounded-xl border border-emerald-200 bg-white p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white">{index+1}</span><span className="font-bold">{item}</span></li>)}</ol></section><div className="mt-12">
          <h2 className="font-display text-3xl font-bold text-stone-950">Program highlights</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {program.highlights.map((highlight) => <li key={highlight} className="flex gap-3 rounded-xl border border-stone-200 bg-white p-5 text-stone-700"><Icon name="Check" size={18} className="mt-0.5 shrink-0 text-emerald-800" /><span>{highlight}</span></li>)}
          </ul>
        </div>

        <section className="mx-auto mt-12 max-w-3xl"><h2 className="text-center text-2xl font-bold">Frequently asked questions</h2><TrialFaqAccordion faqs={PROGRAM_FAQS[program.id]} /></section><div className="mt-12 border-t border-stone-200 pt-10 text-center">
          <h2 className="font-display text-3xl font-bold text-stone-950">Find the right starting level</h2>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">Trial 1 includes placement and a real mini-lesson, followed by two further trial classes before an enrollment recommendation.</p>
          <Link to="/free-trial" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-800 px-6 text-sm font-bold text-stone-50 hover:bg-emerald-900">Book 3 Free Trial Classes</Link>
        </div>
      </section>
    </div>
  );
};
