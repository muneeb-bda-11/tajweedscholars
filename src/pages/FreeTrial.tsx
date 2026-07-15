import React, { useEffect } from "react";
import { TrialForm } from "../components/TrialForm";
import { Icon } from "../components/Icon";
import { SITE_CONFIG } from "../config/site";

const trials = [
  { number: 1, title: "Meet and Assess", text: "Meet the teacher, confirm the starting level, and complete a real mini-lesson.", icon: "UserCheck" },
  { number: 2, title: "Learn and Improve", text: "Experience a full lesson with correction, guided practice, and encouragement.", icon: "BookOpen" },
  { number: 3, title: "Review and Plan", text: "Receive a progress recap and the recommended learning plan.", icon: "ClipboardList" }
];
const trust = ["Three free 30-minute trial classes", "Private one-to-one teaching", "No payment information required", "Beginner-friendly placement"];
const faqs = [
  ["Are all three trial classes free?", "Yes. All three trial classes are free."],
  ["How long is each class?", "Each private class is 30 minutes."],
  ["Do I need to pay before the trial?", "No. Payment information is not required to request or attend the trial classes."],
  ["Can beginners join?", "Yes. Trial 1 confirms the appropriate starting level and includes a real mini-lesson."],
  ["How will the class time be arranged?", "Share your preferred days and general time. The final Zoom class time is confirmed with you directly."]
];

export const FreeTrial: React.FC = () => {
  useEffect(() => { document.title = "Book 3 Free Trial Quran Classes | Tajweed Scholars"; }, []);
  return <div id="free-trial-page" className="overflow-x-clip">
    <section className="border-b border-stone-200 bg-stone-50 py-9 sm:py-12" aria-labelledby="trial-page-title"><div className="mx-auto max-w-5xl px-4 text-center sm:px-6"><p className="text-xs font-bold text-emerald-800">Live, private Quran learning</p><h1 id="trial-page-title" className="mx-auto mt-2 max-w-3xl text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl">Start with 3 free trial classes.</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600">Meet your teacher, experience a real lesson, and receive a clear learning recommendation before deciding to enroll.</p><ul className="mx-auto mt-5 grid max-w-3xl gap-2 text-left sm:grid-cols-2">{trust.map((item) => <li key={item} className="flex items-center gap-2 text-sm font-semibold text-stone-700"><Icon name="CheckCircle2" size={17} className="shrink-0 text-emerald-700" />{item}</li>)}</ul></div></section>

    <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8"><section aria-labelledby="trial-summary-title"><h2 id="trial-summary-title" className="text-center text-2xl font-bold text-stone-800 sm:text-3xl">Your three trial classes</h2><div className="mx-auto mt-5 grid max-w-5xl gap-3 md:grid-cols-3">{trials.map((trial) => <article key={trial.number} className="rounded-xl border border-stone-200 bg-white p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><Icon name={trial.icon} size={18} /></span><div><p className="text-xs font-bold text-emerald-800">Trial {trial.number}</p><h3 className="font-bold text-stone-800">{trial.title}</h3></div></div><p className="mt-3 text-sm leading-6 text-stone-600">{trial.text}</p></article>)}</div></section>

      <section id="registration-form-section" className="scroll-mt-24 pt-10" aria-labelledby="form-section-title"><div className="mb-5 text-center"><h2 id="form-section-title" className="text-2xl font-bold text-stone-800 sm:text-3xl">Book 3 Free Trial Classes</h2><p className="mt-2 text-sm text-stone-600">Complete the three short steps below. Your entries are preserved when you go back.</p></div><TrialForm />
        <div className="mx-auto mt-5 flex max-w-[760px] flex-col items-center justify-between gap-3 rounded-xl border border-stone-200 bg-emerald-50 p-4 sm:flex-row"><div><h3 className="font-bold text-stone-800">Prefer WhatsApp?</h3><p className="mt-1 text-xs text-stone-600">Message us directly without including form details in the link.</p></div><a href={SITE_CONFIG.WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Message Tajweed Scholars on WhatsApp" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-white px-4 text-sm font-bold text-emerald-800 sm:w-auto"><Icon name="MessageSquare" size={17} />Message Tajweed Scholars</a></div>
      </section>

      <section className="mx-auto max-w-[760px] pt-10" aria-labelledby="trial-faq-title"><h2 id="trial-faq-title" className="text-center text-2xl font-bold text-stone-800">Free trial FAQ</h2><div className="mt-4 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">{faqs.map(([question, answer]) => <details key={question} className="group p-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-stone-800">{question}<Icon name="ChevronDown" size={17} className="shrink-0 transition-transform group-open:rotate-180" /></summary><p className="pb-1 pr-8 text-sm leading-6 text-stone-600">{answer}</p></details>)}</div></section>
    </main>
  </div>;
};
