import React, { useEffect } from "react";
import { SITE_CONFIG } from "../config/site";
import { Icon } from "../components/Icon";
import { Link } from "../lib/router";
import { CONTACT_FAQS } from "../config/pageContent";
import { TrialFaqAccordion } from "../components/TrialFaqAccordion";

const contactOptions = [
  { id: "whatsapp", title: "WhatsApp", description: "Ask an admissions or scheduling question.", href: SITE_CONFIG.WHATSAPP_LINK, icon: "MessageSquare", external: true, label: SITE_CONFIG.WHATSAPP_NUMBER },
  { id: "email", title: "Email", description: "Send a detailed academic or general inquiry.", href: `mailto:${SITE_CONFIG.CONTACT_EMAIL}`, icon: "Mail", external: false, label: SITE_CONFIG.CONTACT_EMAIL }
];

export const Contact: React.FC = () => {
  useEffect(() => { document.title = "Contact Tajweed Scholars"; }, []);

  return (
    <div className="py-14 md:py-20" id="contact-page">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-emerald-800">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-stone-950 md:text-5xl">Speak with Tajweed Scholars</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-600">Class placement and scheduling are handled through our Free Trial form. For other questions, contact us directly by WhatsApp or email.</p>
        </div><section className="mx-auto mt-12 max-w-3xl"><h2 className="text-center text-2xl font-bold">Contact FAQ</h2><TrialFaqAccordion faqs={CONTACT_FAQS}/></section>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {contactOptions.map((option) => (
            <a key={option.id} id={`contact-${option.id}-card`} href={option.href} target={option.external ? "_blank" : undefined} rel={option.external ? "noopener noreferrer" : undefined} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-700">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon name={option.icon} size={21} /></span>
              <h2 className="mt-5 text-xl font-bold text-stone-950">{option.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{option.description}</p>
              <span className="mt-5 block break-words text-sm font-bold text-emerald-800">{option.label}</span>
            </a>
          ))}

          <Link id="contact-trial-cta-card" to="/free-trial" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-stone-800 shadow-sm transition-colors hover:border-emerald-700">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Icon name="Calendar" size={21} /></span>
            <h2 className="mt-5 text-xl font-bold">Book 3 Free Trial Classes</h2>
            <p className="mt-2 text-sm leading-6 text-stone-200">Share the learner’s level, goals, availability, and contact details securely with admissions.</p>
            <span className="mt-5 block text-sm font-bold text-emerald-800">Start the Free Trial form</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
