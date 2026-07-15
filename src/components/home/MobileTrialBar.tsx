import React, { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { useRouter } from "../../lib/router";

const SESSION_KEY = "tajweed-scholars-trial-bar-dismissed";

export const MobileTrialBar: React.FC = () => {
  const { navigate } = useRouter();
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === "true"; } catch { return false; }
  });

  useEffect(() => {
    if (dismissed) return;
    const heroCta = document.getElementById("hero-primary-cta");
    const footer = document.getElementById("app-footer");
    if (!heroCta || !footer || typeof IntersectionObserver === "undefined") return;
    const heroObserver = new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting), { threshold: 0.05 });
    const footerObserver = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.01 });
    heroObserver.observe(heroCta);
    footerObserver.observe(footer);
    const onFinder = (event: Event) => setFinderOpen(Boolean((event as CustomEvent<{ open: boolean }>).detail?.open));
    window.addEventListener("program-finder-visibility", onFinder);
    return () => { heroObserver.disconnect(); footerObserver.disconnect(); window.removeEventListener("program-finder-visibility", onFinder); };
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(SESSION_KEY, "true"); } catch { /* Storage may be unavailable. */ }
  };

  if (dismissed || heroCtaVisible || footerVisible || finderOpen) return null;
  return <>
    <div className="h-[calc(5.5rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
    <aside className="mobile-trial-bar fixed inset-x-3 z-50 flex min-h-16 items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-800 p-2 pl-3 text-white shadow-lg md:hidden" aria-label="Book three free trial classes">
      <p className="min-w-0 flex-1 text-xs font-bold min-[390px]:text-sm">3 Free Trial Classes</p>
      <button type="button" onClick={() => navigate("/free-trial")} className="min-h-11 rounded-lg bg-white px-4 text-xs font-bold text-emerald-800">Book Now</button>
      <button type="button" onClick={dismiss} aria-label="Dismiss trial booking bar" className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"><Icon name="X" size={17} /></button>
    </aside>
  </>;
};
