import React, { useState } from "react";
import { Icon } from "../Icon";

const labels = [
  { text: "Live 1-to-1 Lesson", position: "left-0 top-5 sm:-left-3 sm:top-8" },
  { text: "Real-Time Correction", position: "bottom-1 right-2 sm:bottom-3 sm:right-5" }
];

export const HeroLessonVisual: React.FC = () => {
  const [imageAvailable, setImageAvailable] = useState(true);

  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-[34rem] sm:h-[300px] sm:aspect-auto lg:h-[390px]" role="img" aria-label="A live private Quran lesson between a teacher and learner">
      <div className="absolute inset-2 overflow-hidden rounded-[2rem_.85rem_2rem_.85rem] border border-stone-200 bg-emerald-50 shadow-sm">
        {imageAvailable ? (
          <img src="/brand/hero-online-quran-class.webp" width="1200" height="750" alt="A Quran teacher guiding a learner in a live private online class" decoding="async" fetchPriority="high" sizes="(max-width: 640px) calc(100vw - 48px), 544px" className="h-full w-full object-cover object-[50%_25%]" onError={() => setImageAvailable(false)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex items-end gap-4 text-emerald-800" aria-hidden="true">
              <svg viewBox="0 0 64 76" className="h-16 w-14 sm:h-24 sm:w-20"><circle cx="32" cy="18" r="11" fill="currentColor" /><path d="M10 72c2-28 10-42 22-42s20 14 22 42" fill="currentColor" opacity=".72" /></svg>
              <div className="mb-1 rounded-lg border-2 border-amber-300 bg-white p-2"><Icon name="BookOpen" size={30} /></div>
              <svg viewBox="0 0 64 76" className="h-14 w-12 text-emerald-700 sm:h-20 sm:w-16"><circle cx="32" cy="18" r="11" fill="currentColor" /><path d="M10 72c2-28 10-42 22-42s20 14 22 42" fill="currentColor" opacity=".55" /></svg>
            </div>
            <p className="mt-3 text-xs font-bold text-stone-700 sm:text-sm">Temporary photography placeholder</p>
            <p className="mt-1 max-w-xs text-[10px] leading-4 text-stone-500 sm:text-xs">Live teacher guidance, learner practice, and an open Mushaf or Qaida.</p>
          </div>
        )}
      </div>
      {labels.map((label) => <span key={label.text} className={`absolute ${label.position} rounded-full border border-stone-200 bg-white/95 px-2 py-1 text-[9px] font-bold text-stone-700 shadow-sm backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs`}><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-700" />{label.text}</span>)}
    </div>
  );
};
