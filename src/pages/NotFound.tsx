import React from "react";
import { Link, useRouter } from "../lib/router";
import { PUBLIC_ROUTES } from "../config/metadata";

export const NotFound: React.FC = () => <section id="not-found-page" className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 md:py-28">
  <p className="font-semibold text-emerald-800">404 — Page not found</p>
  <h1 className="mt-3 font-display text-4xl font-bold text-stone-950 md:text-5xl">We could not find that page</h1>
  <p className="mx-auto mt-5 max-w-xl leading-7 text-stone-600">The address may be incorrect or the page may have moved. Return home or explore our public programs.</p>
  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-emerald-800 px-6 text-sm font-bold text-white">Return home</Link><Link to="/programs" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-stone-300 bg-white px-6 text-sm font-bold text-stone-800">View programs</Link></div>
</section>;

export const NotFoundRoute: React.FC = () => {
  const { path } = useRouter();
  return PUBLIC_ROUTES.includes(path) ? null : <NotFound />;
};
