import React from "react";
import { Link, useRouter } from "../lib/router";
import { PUBLISHED_RESOURCES, publishedResourceForPath, resourceRoute } from "../content/resources";

const formatDate = (date: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
const programNames: Record<string, string> = { "/kids-quran-classes": "Kids Quran Classes", "/adult-quran-classes": "Adult Quran Classes", "/tajweed-course": "Tajweed Course", "/hifz-program": "Hifz Program" };

export const ResourceArticle: React.FC<{ resourcePath?: string }> = ({ resourcePath }) => {
  const { path } = useRouter();
  const resource = publishedResourceForPath(resourcePath ?? path);
  if (!resource) return null;
  const relatedResources = PUBLISHED_RESOURCES.filter((candidate) => candidate.slug !== resource.slug && (candidate.category === resource.category || candidate.relatedProgramRoutes.some((route) => resource.relatedProgramRoutes.includes(route)))).slice(0, 3);
  return <article id="resource-article-page" className="pb-16 md:pb-24">
    <div className="border-b border-stone-200 bg-emerald-50/60">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-stone-600"><ol className="flex flex-wrap items-center gap-2"><li><Link to="/" className="underline underline-offset-4">Home</Link></li><li aria-hidden="true">/</li><li><Link to="/resources" className="underline underline-offset-4">Resources</Link></li><li aria-hidden="true">/</li><li aria-current="page">{resource.title}</li></ol></nav>
        <p className="mt-8 text-sm font-bold text-emerald-800">{resource.category} · For {resource.intendedAudience.toLowerCase()}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">{resource.title}</h1>
        <p className="mt-5 text-lg leading-8 text-stone-600">{resource.summary}</p>
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-emerald-900/10 pt-5 text-sm text-stone-600"><div><dt className="sr-only">Author</dt><dd>By <strong className="text-stone-800">{resource.authorName}</strong></dd></div><div><dt className="sr-only">Updated date</dt><dd>Updated <time dateTime={resource.updatedDate}>{formatDate(resource.updatedDate)}</time></dd></div></dl>
      </div>
    </div>
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <p className="text-lg leading-8 text-stone-700">{resource.introduction}</p>
      <div className="mt-10 space-y-10">{resource.sections.map((section) => <section key={section.heading} aria-labelledby={`section-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
        <h2 id={`section-${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="font-display text-2xl font-bold text-stone-950 sm:text-3xl">{section.heading}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-stone-700">{paragraph}</p>)}
        {section.links && <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{section.links.map((link) => <li key={link.route}><Link to={link.route} className="font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4">{link.label}</Link></li>)}</ul>}
      </section>)}</div>
      <aside className="mt-12 border-y border-stone-200 py-8" aria-labelledby="related-programs-title"><h2 id="related-programs-title" className="text-xl font-bold text-stone-950">Related learning programs</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{resource.relatedProgramRoutes.map((route) => <li key={route}><Link to={route} className="flex min-h-11 items-center rounded-lg border border-stone-200 bg-white px-4 font-bold text-emerald-800 hover:border-emerald-300">{programNames[route] ?? "View related program"}</Link></li>)}</ul></aside>
      {relatedResources.length > 0 && <aside className="mt-10" aria-labelledby="related-resources-title"><h2 id="related-resources-title" className="text-xl font-bold">Related resources</h2><ul className="mt-4 space-y-3">{relatedResources.map((related) => <li key={related.slug}><Link to={resourceRoute(related)} className="font-bold text-emerald-800 underline underline-offset-4">{related.title}</Link></li>)}</ul></aside>}
    </div>
  </article>;
};
