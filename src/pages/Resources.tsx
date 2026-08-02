import React from "react";
import { Link } from "../lib/router";
import { PUBLISHED_RESOURCES, resourceRoute } from "../content/resources";

const formatDate = (date: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

export const Resources: React.FC = () => <div id="resources-page" className="py-12 sm:py-16 md:py-20">
  <section className="mx-auto max-w-5xl px-4 sm:px-6" aria-labelledby="resources-title">
    <p className="text-sm font-bold text-emerald-800">Human-reviewed guidance</p>
    <h1 id="resources-title" className="mt-3 max-w-3xl font-display text-4xl font-bold text-stone-950 sm:text-5xl">Resources for thoughtful Quran learning decisions</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">Clear, practical articles for learners and families considering private online Quran classes.</p>
    <div className="mt-10 border-t border-stone-200">
      {PUBLISHED_RESOURCES.map((resource) => <article key={resource.slug} className="grid gap-4 border-b border-stone-200 py-7 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-800">{resource.category} · {resource.intendedAudience}</p>
          <h2 className="mt-2 text-2xl font-bold text-stone-950"><Link to={resourceRoute(resource)} className="hover:text-emerald-800">{resource.title}</Link></h2>
          <p className="mt-3 max-w-3xl leading-7 text-stone-600">{resource.summary}</p>
          <p className="mt-3 text-sm text-stone-500">By {resource.authorName} · Updated {formatDate(resource.updatedDate)}</p>
        </div>
        <Link to={resourceRoute(resource)} className="inline-flex min-h-11 items-center font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4">Read resource</Link>
      </article>)}
    </div>
  </section>
</div>;
