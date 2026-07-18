import React, { useEffect } from "react";
import { NAVIGATION_LINKS, SITE_CONFIG } from "../config/site";
import { Icon } from "../components/Icon";
import { useRouter } from "../lib/router";

export const PolicyUnavailable: React.FC = () => {
  const { path } = useRouter();
  const title = NAVIGATION_LINKS.policies.find((policy) => policy.path === path)?.label || "Policy";

  useEffect(() => {
    document.title = `${title} | Tajweed Scholars`;
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previous = existing?.content;
    const meta = existing || document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    if (!existing) document.head.appendChild(meta);
    return () => { if (existing && previous !== undefined) existing.content = previous; else meta.remove(); };
  }, [title]);

  return <div className="py-16 md:py-24" id="policy-unpublished-page"><section className="mx-auto max-w-3xl px-4 text-center sm:px-6">
    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon name="FileText" size={23} /></span>
    <h1 className="mt-6 font-display text-4xl font-bold text-stone-950">{title}</h1>
    <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-600">This policy is not currently published. Please contact Tajweed Scholars directly if you need information before booking or enrolling.</p>
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 text-sm font-bold text-stone-800"><Icon name="Mail" size={17} />Email</a><a href={SITE_CONFIG.WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 text-sm font-bold text-stone-50"><Icon name="MessageSquare" size={17} />WhatsApp</a></div>
  </section></div>;
};
