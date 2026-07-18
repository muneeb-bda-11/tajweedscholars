import React, { useEffect } from "react";
import { Icon } from "../components/Icon";
import { Link } from "../lib/router";

const commitments = [
  ["Verified scholarly credentials", "Tajweed Scholars is founder-led, and the founder holds a complete verified Sanad. Teachers must hold verified Sanad/Ijazah credentials before assignment."],
  ["Private one-to-one learning", "Children and adult learners receive focused, live instruction shaped around their current level and goals."],
  ["Structured placement", "The three free trial classes establish the learner’s starting point, provide real lessons, and lead to a clear enrollment recommendation."],
  ["Clear family communication", "Families receive regular progress updates, attendance notes, homework updates, teacher feedback, and clear next goals."]
];

export const About: React.FC = () => {
  useEffect(() => { document.title = "About Tajweed Scholars"; }, []);
  return <div className="py-14 md:py-20" id="about-page"><section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl"><p className="text-sm font-bold text-emerald-800">About the academy</p><h1 className="mt-3 font-display text-4xl font-bold text-stone-950 md:text-5xl">Careful Quran learning, grounded in scholarly trust</h1><p className="mt-6 text-lg leading-8 text-stone-600">Our mission is to help children and adults build a lasting relationship with the Quran through accurate, patient, private teaching. Tajweed Scholars is a founder-led online academy built around verified credentials, structured learner placement, and consistent guidance.</p></div>
    <div className="mt-12 grid gap-5 md:grid-cols-2">{commitments.map(([title, body]) => <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6"><Icon name="BadgeCheck" size={22} className="text-emerald-800" /><h2 className="mt-4 text-xl font-bold text-stone-950">{title}</h2><p className="mt-3 leading-7 text-stone-600">{body}</p></article>)}</div>
    <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"><h2 className="font-display text-2xl font-bold">Experience the teaching approach</h2><Link to="/free-trial" className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-emerald-800 px-6 text-sm font-bold text-white">Book 3 Free Trial Classes</Link></div>
  </section></div>;
};
