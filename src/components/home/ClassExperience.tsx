import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

const stages = [
  { label: "Teacher Listens", description: "The learner recites while the teacher listens carefully.", icon: "AudioLines" },
  { label: "Correction Explained", description: "The correction is identified and explained clearly.", icon: "MessageSquare" },
  { label: "Guided Practice", description: "The learner repeats the corrected reading with teacher guidance.", icon: "RefreshCw" },
  { label: "Next Goal Recorded", description: "Homework and a clear next goal are recorded and shared.", icon: "ClipboardList" }
];

export const ClassExperience: React.FC = () => {
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setEntered(true); observer.disconnect(); } }, { threshold: 0.25 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!entered || paused || manual || active === stages.length - 1) return;
    const timer = window.setTimeout(() => setActive((value) => value + 1), 5500);
    return () => window.clearTimeout(timer);
  }, [active, entered, manual, paused]);
  const select = (index: number, focus = false) => { const next = (index + stages.length) % stages.length; setActive(next); setManual(true); if (focus) refs.current[next]?.focus(); };
  const stage = stages[active];
  return <section ref={sectionRef} className="border-y border-stone-200 bg-stone-100/55 py-9 sm:py-12" aria-labelledby="experience-title"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false); }}>
    <div className="max-w-3xl"><p className="text-xs font-bold text-emerald-800">Inside a live private class</p><h2 id="experience-title" className="mt-2 text-[1.8rem] font-bold tracking-tight text-stone-800 sm:text-4xl">See how a private class works.</h2><p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">The teacher listens, explains the correction, guides practice, and records the next goal.</p></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10"><div><p className="mb-2 text-xs font-bold text-emerald-800">Step {active + 1} of 4</p><div className="mb-4 h-1 overflow-hidden rounded-full bg-emerald-100"><span className="block h-full rounded-full bg-emerald-700 transition-[width]" style={{ width: `${((active + 1) / 4) * 100}%` }} /></div><div role="tablist" aria-label="Class experience stages" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">{stages.map((item, index) => <button key={item.label} ref={(node) => { refs.current[index] = node; }} type="button" role="tab" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); select(index + 1, true); } if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); select(index - 1, true); } }} className={`flex min-h-[68px] items-center gap-2 rounded-lg border p-2 text-left text-xs font-bold ${active === index ? "border-emerald-700 bg-emerald-800 text-white shadow-sm" : "border-stone-200 bg-white text-stone-700"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active === index ? "bg-white/15" : "bg-emerald-50 text-emerald-800"}`}><Icon name={item.icon} size={16} /></span><span><span className="block text-[10px] opacity-75">{index + 1}</span>{item.label}</span></button>)}</div><div className="mt-4 border-l-2 border-amber-300 pl-3"><h3 className="text-lg font-bold text-stone-800">{stage.label}</h3><p className="mt-1 text-sm leading-6 text-stone-600">{stage.description}</p></div></div>
      <div className="relative h-[230px] overflow-hidden rounded-[1.6rem_.8rem_1.6rem_.8rem] border border-stone-200 bg-emerald-50 shadow-sm sm:h-[290px]" role="img" aria-label={`${stage.label}: ${stage.description}`}><img src="/brand/hero-online-quran-class.webp" alt="" className="h-full w-full object-cover object-[50%_28%]" /><div className="absolute inset-0 bg-gradient-to-t from-stone-950/35 via-transparent to-transparent" />{active === 0 && <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-stone-700"><Icon name="AudioLines" size={14} className="mr-1 inline text-emerald-700" />Listening carefully</span>}{active === 1 && <span className="absolute bottom-[24%] left-[42%] h-2 w-20 rounded-full bg-amber-300/80" aria-hidden="true" />}{active === 2 && <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-stone-700"><Icon name="RefreshCw" size={14} className="mr-1 inline text-emerald-700" />Guided repeat</span>}{active === 3 && <span className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-stone-700"><Icon name="ClipboardList" size={14} className="mr-1 inline text-emerald-700" />Next goal</span>}</div>
    </div></div></section>;
};
