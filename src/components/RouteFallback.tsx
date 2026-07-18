import React, { useEffect, useState } from "react";

export function RouteFallback() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setVisible(true), 150); return () => window.clearTimeout(timer); }, []);
  if (!visible) return null;
  return <section aria-label="Loading page" aria-live="polite" className="mx-auto min-h-[55vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <span className="sr-only">Loading page</span>
    <div className="h-4 w-32 animate-pulse rounded bg-stone-200 motion-reduce:animate-none" />
    <div className="mt-5 h-11 max-w-xl animate-pulse rounded bg-stone-200 motion-reduce:animate-none" />
    <div className="mt-4 h-5 max-w-2xl animate-pulse rounded bg-stone-100 motion-reduce:animate-none" />
    <div className="mt-10 grid gap-5 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-2xl border border-stone-200 bg-white motion-reduce:animate-none" />)}</div>
  </section>;
}
