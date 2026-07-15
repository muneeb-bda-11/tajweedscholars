import React from "react";
import { Icon } from "../Icon";

const milestones = [
  { title: "First Arabic Letters", description: "Recognize and pronounce letters clearly.", icon: "Languages" },
  { title: "Qaida Reading", description: "Join letters and read with correct vowels.", icon: "BookOpen" },
  { title: "Quran Fluency", description: "Build smoother and more confident recitation.", icon: "AudioLines" },
  { title: "Tajweed Accuracy", description: "Apply Makharij and Tajweed rules correctly.", icon: "CheckCircle2" },
  { title: "Hifz or Advanced Study", description: "Memorize, revise, or continue advanced learning.", icon: "Bookmark" }
];

export const LearningJourney: React.FC = () => (
  <section className="py-9 sm:py-12" aria-labelledby="journey-title"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="text-center"><p className="text-xs font-bold text-emerald-800">Your Quran learning journey</p><h2 id="journey-title" className="mx-auto mt-2 max-w-3xl text-[1.75rem] font-bold leading-tight tracking-tight text-stone-800 sm:text-4xl">Start at your level. Move forward step by step.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">Trial 1 confirms the right starting point. Learners may begin at any stage.</p></div>
    <div className="relative mx-auto mt-7 max-w-6xl"><div className="absolute bottom-9 left-[19px] top-9 w-0.5 bg-emerald-200 lg:bottom-auto lg:left-[10%] lg:right-[10%] lg:top-7 lg:h-0.5 lg:w-auto" aria-hidden="true" />
      <ol className="relative grid gap-3 lg:grid-cols-5 lg:gap-4">{milestones.map((milestone, index) => <li key={milestone.title} className="relative flex gap-3 rounded-xl border border-stone-200 bg-white p-3 lg:min-h-44 lg:flex-col lg:items-center lg:px-3 lg:pt-3 lg:text-center"><span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white ring-4 ring-stone-50"><Icon name={milestone.icon} size={17} /></span>{index < milestones.length - 1 && <Icon name="ChevronDown" size={18} className="absolute -bottom-[18px] left-[11px] z-20 text-emerald-700 lg:-right-[18px] lg:left-auto lg:top-5 lg:-rotate-90" />}<div><p className="text-[10px] font-bold text-emerald-800">Step {index + 1}</p><h3 className="mt-1 text-sm font-bold text-stone-800">{milestone.title}</h3><p className="mt-1 text-xs leading-5 text-stone-600">{milestone.description}</p></div>{index === 0 && <span className="mt-auto hidden text-[10px] font-bold text-emerald-800 lg:block">START</span>}{index === milestones.length - 1 && <span className="mt-auto hidden text-[10px] font-bold text-amber-800 lg:block">DESTINATION</span>}</li>)}</ol>
    </div><p className="mx-auto mt-5 max-w-2xl rounded-lg bg-emerald-50 px-4 py-3 text-center text-xs font-semibold leading-5 text-stone-700">You do not need to begin at Step 1. Placement depends on your current level.</p>
  </div></section>
);
