import React from "react";
import { Icon } from "../Icon";

const progressItems = [
  { label: "Attendance", value: "Present", icon: "CheckCircle2" },
  { label: "Current stage", value: "Quran reading", icon: "BookOpen" },
  { label: "Today’s focus", value: "Smooth reading and clear pronunciation", icon: "AudioLines" },
  { label: "What improved", value: "Fewer pauses and clearer sounds", icon: "LineChart" },
  { label: "Home practice", value: "Read the assigned lines twice", icon: "Bookmark" },
  { label: "Next goal", value: "Continue with the next short passage", icon: "ArrowRight" }
];
const trustPoints = [
  { title: "Qualified Guidance", text: "Sanad/Ijazah-qualified teacher guidance.", icon: "BookOpen" },
  { title: "Private Attention", text: "Private one-to-one attention.", icon: "HeartHandshake" },
  { title: "Visible Progress", text: "Clear homework and next goals.", icon: "LineChart" }
];

export const SampleProgressUpdate: React.FC = () => <section className="border-y border-stone-200 bg-emerald-50 py-10 sm:py-12" aria-labelledby="progress-title"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid items-center gap-7 lg:grid-cols-[.72fr_1.28fr] lg:gap-12"><div><p className="text-xs font-bold text-emerald-800">Clear next steps</p><h2 id="progress-title" className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">See what progress looks like.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-stone-600 sm:text-base">The same clear update format works for beginners, Quran readers, Tajweed learners and Hifz students.</p></div>
  <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm" aria-label="Example family progress update"><div className="flex items-center justify-between border-b border-stone-200 bg-emerald-800 px-4 py-3 text-white sm:px-5"><div><p className="text-[10px] font-bold">EXAMPLE FAMILY UPDATE</p><h3 className="mt-0.5 text-lg font-bold">Clear progress after each class</h3></div><Icon name="LineChart" size={20} className="text-amber-200" /></div><dl className="grid grid-cols-1 min-[400px]:grid-cols-2">{progressItems.map((item, index) => <div key={item.label} className={`flex gap-2 border-b border-stone-200 p-3 sm:p-4 ${index % 2 === 0 ? "min-[400px]:border-r" : ""}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><Icon name={item.icon} size={15} /></span><div><dt className="text-[10px] font-bold text-stone-500">{item.label}</dt><dd className="mt-0.5 text-xs font-semibold leading-5 text-stone-700 sm:text-sm">{item.value}</dd></div></div>)}</dl><p className="bg-stone-50 px-4 py-2 text-[10px] text-stone-500">Example format. Actual updates are based on the learner’s program and level.</p></div></div>
  <div className="mt-6 grid overflow-hidden rounded-xl border border-stone-200 bg-white sm:grid-cols-3">{trustPoints.map((point) => <div key={point.title} className="flex items-start gap-2.5 border-b border-stone-200 px-3 py-2.5 last:border-b-0 sm:border-b-0 sm:border-r sm:p-4 sm:last:border-r-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><Icon name={point.icon} size={14} /></span><div><h3 className="text-sm font-bold text-stone-800">{point.title}</h3><p className="mt-1 text-xs leading-5 text-stone-600">{point.text}</p></div></div>)}</div>
</div></section>;
