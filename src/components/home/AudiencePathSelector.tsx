import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../Icon";
import { Link, useRouter } from "../../lib/router";

type AudienceId = "child" | "adult" | "advanced";
const pathways = [
  { id: "child" as const, title: "My Child", description: "Ages 4–15 · Qaida, Quran and Islamic foundations", image: "/brand/path-child.webp", position: "50% 35%", path: "/kids-quran-classes" },
  { id: "adult" as const, title: "Myself", description: "Private, beginner-friendly learning for adults", image: "/brand/path-adult.webp", position: "50% 30%", path: "/adult-quran-classes" },
  { id: "advanced" as const, title: "Tajweed or Hifz", description: "Recitation correction and structured memorization", image: "/brand/path-tajweed-hifz.webp", position: "50% 32%", path: "/tajweed-course" }
];
const questionOptions = {
  child: { label: "What is the child’s age group?", values: ["4–5", "6–8", "9–12", "13–15"] },
  adult: { label: "What is your main goal?", values: ["Learn from the beginning", "Improve Quran reading", "Improve Tajweed", "Memorize Quran"] },
  advanced: { label: "What would you like to focus on?", values: ["Tajweed correction", "Hifz", "Both"] }
};

export const AudiencePathSelector: React.FC = () => {
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [audience, setAudience] = useState<AudienceId | "">("");
  const [answer, setAnswer] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const recommendation = useMemo(() => {
    if (!audience || !answer) return null;
    if (audience === "child") return { program: "Kids Quran Classes", path: "Foundation placement during Trial 1" };
    if (audience === "adult") {
      if (answer === "Improve Tajweed") return { program: "Tajweed Course", path: "Recitation review during Trial 1" };
      if (answer === "Memorize Quran") return { program: "Hifz Program", path: "Memorization readiness review during Trial 1" };
      return { program: "Adult Quran Classes", path: "Level placement during Trial 1" };
    }
    if (answer === "Hifz") return { program: "Hifz Program", path: "Memorization placement during Trial 1" };
    return { program: "Tajweed Course", path: answer === "Both" ? "Tajweed review with a Hifz recommendation during Trial 1" : "Recitation review during Trial 1" };
  }, [answer, audience]);

  const close = () => { setOpen(false); setStep(1); setAudience(""); setAnswer(""); };
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("program-finder-visibility", { detail: { open } }));
    if (!open) { if (wasOpen.current) triggerRef.current?.focus(); wasOpen.current = false; return; }
    wasOpen.current = true;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { close(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]');
      if (!items.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [open]);

  const book = () => {
    if (!audience || !recommendation) return;
    const params = new URLSearchParams({ learnerType: audience === "child" ? "My Child" : audience === "adult" ? "Myself" : "Tajweed or Hifz", recommendedProgram: recommendation.program });
    if (audience === "child") params.set("ageGroup", answer); else params.set("goal", answer);
    navigate(`/free-trial?${params.toString()}`);
  };

  return <section id="audience-selector" className="scroll-mt-20 py-9 sm:py-12" aria-labelledby="audience-title"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-xs font-bold text-emerald-800">Choose a learning path</p><h2 id="audience-title" className="mt-2 text-[1.8rem] font-bold tracking-tight text-stone-800 sm:text-4xl">Who is learning?</h2>
    <div className="mt-5 grid gap-2.5 md:grid-cols-3 md:gap-4">{pathways.map((pathway) => <article key={pathway.id} className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-sm focus-within:border-emerald-700 focus-within:shadow-sm"><Link to={pathway.path} className="flex min-h-[104px] items-center gap-3 p-2 md:block md:p-0"><img src={pathway.image} alt="" width="800" height="450" className="h-[88px] w-[104px] shrink-0 rounded-lg object-cover transition-transform group-hover:scale-[1.01] md:h-[190px] md:w-full md:rounded-b-none md:rounded-t-xl" style={{ objectPosition: pathway.position }} /><span className="min-w-0 md:block md:p-4"><span className="block text-lg font-bold text-stone-800">{pathway.title}</span><span className="mt-1 block text-xs leading-5 text-stone-600 sm:text-sm">{pathway.description}</span><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-800">Explore program <Icon name="ArrowRight" size={14} /></span></span></Link></article>)}</div><p className="mt-2 text-right text-xs text-stone-600">Looking for Hifz only? <Link to="/hifz-program" className="inline-flex min-h-11 items-center font-bold text-emerald-800">Explore the Hifz Program <Icon name="ArrowRight" size={13} className="ml-1" /></Link></p>
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-stone-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-bold text-stone-800">Not sure where to start?</h3><p className="mt-1 text-sm text-stone-600">Answer two quick questions and we’ll suggest the most suitable program.</p></div><button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="min-h-11 shrink-0 rounded-lg bg-emerald-800 px-5 text-sm font-bold text-white hover:bg-emerald-900">Find My Program</button></div>
    {open && <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"><button type="button" aria-label="Close program finder" onClick={close} className="absolute inset-0 h-full w-full bg-stone-950/50" /><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="finder-title" className="relative z-10 max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-emerald-800">{step < 3 ? `Question ${step} of 2` : "Your recommendation"}</p><h2 id="finder-title" className="mt-1 text-2xl font-bold text-stone-800">Find My Program</h2></div><button ref={closeRef} type="button" onClick={close} aria-label="Close program finder" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100"><Icon name="X" size={20} /></button></div><div className="mt-4 flex gap-1" aria-hidden="true"><span className="h-1 flex-1 rounded bg-emerald-700" /><span className={`h-1 flex-1 rounded ${step >= 2 ? "bg-emerald-700" : "bg-emerald-100"}`} /></div>
      {step === 1 && <div className="mt-5"><h3 className="text-lg font-bold text-stone-800">Who is learning?</h3><div className="mt-3 grid gap-2">{pathways.map((pathway) => <button key={pathway.id} type="button" onClick={() => { setAudience(pathway.id); setAnswer(""); setStep(2); }} className="min-h-12 rounded-lg border border-stone-200 px-4 text-left text-sm font-bold text-stone-700 hover:border-emerald-700 hover:bg-emerald-50">{pathway.title}</button>)}</div></div>}
      {step === 2 && audience && <div className="mt-5"><h3 className="text-lg font-bold text-stone-800">{questionOptions[audience].label}</h3><div className="mt-3 grid gap-2">{questionOptions[audience].values.map((value) => <button key={value} type="button" onClick={() => { setAnswer(value); setStep(3); }} className="min-h-12 rounded-lg border border-stone-200 px-4 text-left text-sm font-semibold text-stone-700 hover:border-emerald-700 hover:bg-emerald-50">{value}</button>)}</div><button type="button" onClick={() => setStep(1)} className="mt-3 min-h-11 text-sm font-bold text-emerald-800">Back</button></div>}
      {step === 3 && recommendation && <div className="mt-5"><p className="text-xs font-bold text-emerald-800">Recommended Program</p><h3 className="mt-1 text-xl font-bold text-stone-800">{recommendation.program}</h3><p className="mt-3 text-xs font-bold text-stone-500">Suggested Starting Path</p><p className="mt-1 text-sm text-stone-700">{recommendation.path}</p><button type="button" onClick={book} className="mt-5 min-h-12 w-full rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white">Book 3 Free Trial Classes</button><button type="button" onClick={() => setStep(1)} className="mt-2 min-h-11 w-full text-sm font-bold text-emerald-800">Start again</button></div>}
    </div></div>}
  </div></section>;
};
