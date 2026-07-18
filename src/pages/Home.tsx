import React, { useEffect } from "react";
import { AudiencePathSelector } from "../components/home/AudiencePathSelector";
import { ClassExperience } from "../components/home/ClassExperience";
import { HeroLessonVisual } from "../components/home/HeroLessonVisual";
import { LearningJourney } from "../components/home/LearningJourney";
import { SampleProgressUpdate } from "../components/home/SampleProgressUpdate";
import { VisualTrialJourney } from "../components/home/VisualTrialJourney";
import { useRouter } from "../lib/router";
import { useProgramFinder } from "../components/ProgramFinder";

export const Home: React.FC = () => {
  const { navigate } = useRouter();
  const { openFinder } = useProgramFinder();

  useEffect(() => {
    document.title = "Online Quran Classes for Children & Adults | Tajweed Scholars";
  }, []);

  return (
    <div id="home-page" className="overflow-x-clip">
      <section id="home-hero" className="relative border-b border-stone-200 bg-stone-50" aria-labelledby="hero-title">
        <div className="mx-auto grid min-w-0 max-w-7xl items-center gap-3 px-4 pb-[0.7rem] pt-[0.9rem] sm:px-6 sm:py-8 lg:min-h-[590px] lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-10">
          <div className="relative z-10 min-w-0 lg:col-span-6">
            <p className="text-xs font-bold text-emerald-800">Live, private Quran learning</p>
            <h1 id="hero-title" className="mt-2 max-w-2xl font-display text-[clamp(2.75rem,11.7vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.035em] text-stone-800 sm:text-6xl lg:text-[4.25rem] lg:leading-[1.04]">
              Learn the Quran with <span className="confidence-underline">confidence.</span>
            </h1>
            <p className="mt-2 text-sm font-bold text-emerald-800 sm:text-base">From first Arabic letters to confident Quran recitation.</p>
            <p className="mt-3 max-w-xl text-lg leading-[1.45] text-stone-600 sm:leading-7">
              Private one-to-one Quran classes for children and adults, with qualified teachers, structured learning, and three free trial classes.
            </p>
            <div className="mt-4 flex flex-col items-stretch gap-1.5 min-[390px]:flex-row min-[390px]:items-center">
              <button id="hero-primary-cta" type="button" onClick={() => navigate("/free-trial")} className="inline-flex min-h-[56px] flex-1 whitespace-nowrap items-center justify-center rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-900 sm:flex-none sm:px-5">
                Book 3 Free Trial Classes
              </button>
              <button type="button" onClick={(event) => openFinder(event.currentTarget)} className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Find My Program <span aria-hidden="true" className="ml-1">→</span></button>
            </div>
            <p className="mt-2 text-xs font-medium leading-5 text-stone-500">Takes about 2 minutes. No payment information required.</p>
          </div>
          <div className="min-w-0 lg:col-span-6"><HeroLessonVisual /></div>
        </div>
      </section>

      <AudiencePathSelector />
      <ClassExperience />
      <LearningJourney />
      <SampleProgressUpdate />
      <VisualTrialJourney />

      <section className="border-y border-stone-200 bg-white py-10 sm:py-12" aria-labelledby="pricing-teaser-title">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="text-xs font-bold text-emerald-800">Flexible monthly plans</p>
            <h2 id="pricing-teaser-title" className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">Plans from $40/month</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["1–5 days per week", "Weekend-only options", "30-minute private classes", "Three free trial classes before enrollment"].map((item) => (
                <span key={item} className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-600">{item}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => navigate("/pricing")} className="min-h-12 rounded-lg border border-emerald-700 bg-white px-6 text-sm font-bold text-emerald-800 hover:bg-emerald-50">View Pricing</button>
            <button type="button" onClick={() => navigate("/free-trial")} className="min-h-12 rounded-lg bg-emerald-800 px-6 text-sm font-bold text-white hover:bg-emerald-900">Book 3 Free Trial Classes</button>
          </div>
        </div>
      </section>

    </div>
  );
};
