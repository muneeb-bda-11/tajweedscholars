import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import { useRouter } from "../../lib/router";

const steps = [
  { number: 1, short: "Meet", title: "Meet and Assess", description: "Meet the teacher, confirm the starting level, and complete a real mini-lesson.", icon: "UserCheck", visual: "Starting level confirmed" },
  { number: 2, short: "Learn", title: "Learn and Improve", description: "Experience a full lesson with correction, guided practice, and encouragement.", icon: "BookOpen", visual: "Real lesson completed" },
  { number: 3, short: "Review", title: "Review and Plan", description: "Receive a progress recap and the recommended learning plan.", icon: "ClipboardList", visual: "Learning plan ready" }
];

type Trial = (typeof steps)[number];

const TrialIllustration: React.FC<{ trial: Trial }> = ({ trial }) => (
    <div className="relative flex h-[92px] items-center justify-center rounded-[1.25rem_.65rem_1.25rem_.65rem] bg-emerald-50 sm:h-36" role="img" aria-label={trial.visual}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 text-white sm:h-14 sm:w-14"><Icon name={trial.icon} size={22} /></span>
      <span className="ml-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-sm">{trial.visual}</span>
    </div>
);

export const VisualTrialJourney: React.FC = () => {
  const { navigate } = useRouter();
  const [active, setActive] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeTrial = steps[active];
  const select = (index: number) => { setActive((index + steps.length) % steps.length); setCycleKey((key) => key + 1); };
  const paused = interactionPaused || userPaused || reducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % steps.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, cycleKey]);

  return (
    <section className="py-9 sm:py-12" aria-labelledby="trials-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold text-emerald-800">Your three-class trial</p><h2 id="trials-title" className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">Experience real teaching before you enroll.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-stone-500">All three trial classes are free. No payment information is required.</p>
        </div>
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6" onMouseEnter={() => setInteractionPaused(true)} onMouseLeave={() => setInteractionPaused(false)} onFocusCapture={() => setInteractionPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setInteractionPaused(false); }} onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchStart.current === null) return; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) select(active + (distance < 0 ? 1 : -1)); touchStart.current = null; }}>
          <div className="relative">
            <div className="absolute left-[16.5%] right-[16.5%] top-[21px] h-1 rounded-full bg-emerald-100" aria-hidden="true"><span className="block h-full rounded-full bg-emerald-700 transition-[width] duration-500" style={{ width: `${(active / 2) * 100}%` }} /></div>
            <div role="tablist" aria-label="Three free trial classes" className="relative grid grid-cols-3 gap-2">{steps.map((step, index) => <button key={step.number} ref={(node) => { refs.current[index] = node; }} type="button" role="tab" id={`trial-step-${step.number}`} aria-selected={active === index} aria-controls="trial-detail" tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); select(index + 1); refs.current[(index + 1) % 3]?.focus(); } if (event.key === "ArrowLeft") { event.preventDefault(); select(index - 1); refs.current[(index + 2) % 3]?.focus(); } }} className="flex min-h-16 flex-col items-center text-xs font-bold text-stone-700"><span className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white transition-transform ${active === index ? "scale-110 bg-emerald-800 text-white shadow" : "bg-emerald-100 text-emerald-800"}`}><Icon name={step.icon} size={16} /></span><span className="mt-2">{step.short}</span></button>)}</div>
          </div>
          <div id="trial-detail" role="tabpanel" aria-labelledby={`trial-step-${activeTrial.number}`} className="mt-4 grid items-center gap-4 sm:grid-cols-[.85fr_1.15fr]">
            <TrialIllustration trial={activeTrial} />
            <div>
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold text-emerald-800">Trial {activeTrial.number} of 3</p><span className="text-[10px] font-semibold text-stone-500">{paused ? "Autoplay paused" : activeTrial.number === 3 ? "Restarting in 6 seconds" : "Next trial in 6 seconds"}</span></div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true"><span key={`${active}-${cycleKey}`} className={`trial-autoplay-progress block h-full rounded-full bg-emerald-700 ${paused ? "is-paused" : ""}`} /></div>
              <h3 className="mt-3 text-xl font-bold text-stone-800">{activeTrial.title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{activeTrial.description}</p>
              <div className="mt-3 flex gap-2"><button type="button" onClick={() => select(active - 1)} aria-label="Previous trial" className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 text-emerald-800"><Icon name="ChevronLeft" size={18} /></button><button type="button" onClick={() => setUserPaused((value) => !value)} aria-label={userPaused ? "Play trial autoplay" : "Pause trial autoplay"} aria-pressed={userPaused} className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 text-emerald-800"><Icon name={userPaused ? "Play" : "Pause"} size={17} /></button><button type="button" onClick={() => select(active + 1)} aria-label="Next trial" className="flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 text-emerald-800"><Icon name="ChevronRight" size={18} /></button></div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center"><button type="button" onClick={() => navigate("/free-trial")} className="min-h-12 rounded-lg bg-emerald-800 px-6 text-sm font-bold text-white hover:bg-emerald-900">Book 3 Free Trial Classes</button></div>
      </div>
    </section>
  );
};
