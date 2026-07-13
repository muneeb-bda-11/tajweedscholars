import React, { useEffect } from "react";
import { ContactForm } from "../components/ContactForm";
import { SITE_CONFIG, HAS_WHATSAPP, HAS_CONTACT_EMAIL } from "../config/site";
import { Icon } from "../components/Icon";
import { useRouter } from "../lib/router";

export const Contact: React.FC = () => {
  const { navigate } = useRouter();

  useEffect(() => {
    document.title = "Contact Tajweed Scholars";
  }, []);

  const isConfigured = HAS_WHATSAPP || HAS_CONTACT_EMAIL || !!SITE_CONFIG.FORM_ENDPOINT;

  return (
    <div className="space-y-16 md:space-y-24 py-10 md:py-16" id="contact-page">
      {/* 1. HERO HEADER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full font-sans">
          Reach Out
        </span>
        
        <h1 className="font-sans text-3xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          We'd Love to Hear From You
        </h1>

        <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          Whether you have a question about a program, scheduling across time zones, or you are not sure where to start, reach out. A real member of our team will respond.
        </p>
      </section>

      {/* 2. CONTACT OPTIONS & FORM GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isConfigured ? (
          <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Icon name="AlertCircle" size={24} />
            </div>
            <p className="text-stone-800 text-sm md:text-base font-semibold">
              This website is currently in development. Official contact and submission details will be added before public launch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14 items-start">
            
            {/* Left Column: Contact Cards */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-sans font-extrabold text-xl md:text-2xl text-stone-950">
                Direct Channels
              </h2>
              <p className="text-stone-500 text-xs md:text-sm">
                Connect with our support team. We aim to respond as quickly as possible, usually within one business day.
              </p>

              <div className="grid gap-4 pt-2">
                {/* WhatsApp Card */}
                {HAS_WHATSAPP && (
                  <div className="bg-white border border-stone-200/50 rounded-xl p-5 flex items-start gap-4 hover:border-emerald-600 transition-colors" id="contact-wa-card">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                      <Icon name="MessageSquare" size={20} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-sm text-stone-900">Admissions WhatsApp</h3>
                      <p className="text-stone-500 text-xs mt-0.5">Chat live with our coordinators for fast onboarding.</p>
                      <a
                        href={SITE_CONFIG.WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-800 font-bold text-xs mt-2.5 inline-flex items-center gap-1 hover:text-emerald-950"
                      >
                        {SITE_CONFIG.WHATSAPP_NUMBER}
                        <Icon name="ExternalLink" size={12} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Email Card */}
                {HAS_CONTACT_EMAIL && (
                  <div className="bg-white border border-stone-200/50 rounded-xl p-5 flex items-start gap-4 hover:border-emerald-600 transition-colors" id="contact-email-card">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                      <Icon name="Mail" size={20} />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-sm text-stone-900">Email Inquiry</h3>
                      <p className="text-stone-500 text-xs mt-0.5">Send us detailed schedule queries or academic questions.</p>
                      <a
                        href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`}
                        className="text-emerald-800 font-bold text-xs mt-2.5 inline-block hover:text-emerald-950"
                      >
                        {SITE_CONFIG.CONTACT_EMAIL}
                      </a>
                    </div>
                  </div>
                )}

                {/* Free Trial Button Card */}
                <div className="bg-emerald-950 text-stone-100 rounded-xl p-6 border border-emerald-800 shadow-md flex flex-col justify-between" id="contact-trial-cta-card">
                  <div className="space-y-2">
                    <h3 className="font-sans font-bold text-base text-stone-50">Ready to Book Your Free Trials?</h3>
                    <p className="text-stone-300 text-xs">Submit your scheduling preferences directly to our coordinator desk to arrange your complimentary sessions.</p>
                  </div>
                  <button
                    onClick={() => navigate("/free-trial")}
                    className="mt-5 w-full inline-flex items-center justify-center px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider text-emerald-950 bg-amber-300 hover:bg-amber-400 transition-colors shadow focus:outline-none cursor-pointer"
                  >
                    Book 3 Free Trial Classes
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

          </div>
        )}
      </section>
    </div>
  );
};
