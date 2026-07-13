import React, { useEffect } from "react";
import { TrialForm } from "../components/TrialForm";
import { TrialSteps } from "../components/TrialSteps";
import { FAQAccordion } from "../components/FAQAccordion";
import { Icon } from "../components/Icon";

export const FreeTrial: React.FC = () => {
  useEffect(() => {
    document.title = "Book 3 Free Trial Quran Classes | Tajweed Scholars";
  }, []);

  return (
    <div className="space-y-16 md:space-y-24 py-10 md:py-16" id="free-trial-page">
      {/* 1. HERO SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full font-sans">
          Free Placement Inquiry
        </span>
        
        <h1 className="font-sans text-3xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          See the Teaching Quality for Yourself Before You Decide Anything
        </h1>

        <p className="text-stone-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
          We never ask a family to commit before they have experienced real classes. Your three free trial classes exist to demonstrate teaching quality and teacher fit. Nothing is sold during the classes.
        </p>
      </section>

      {/* 2. THREE STEPS SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-6 md:p-12 space-y-10">
          <div className="max-w-3xl">
            <h2 className="font-sans font-bold text-xl md:text-2xl text-stone-900">
              Your Complete Trial Roadmap
            </h2>
            <p className="text-stone-500 text-xs md:text-sm mt-1">
              Before Trial 1, a short consultation or this form confirms the student’s age, program, previous Quran learning, preferred teacher gender, country, time zone, and preferred schedule.
            </p>
          </div>

          <TrialSteps showIntro={false} />
        </div>
      </section>

      {/* 3. MULTI-SECTION REGISTRATION FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24" id="registration-form-section">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full font-sans">
            Direct Booking Form
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-stone-900 mt-3">
            Secure Your Complimentary Sessions
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mt-2 leading-relaxed">
            Submit your schedule preferences below. Our placement registrar will contact you through WhatsApp to coordinate.
          </p>
        </div>

        <TrialForm />
      </section>

      {/* 4. FAQS BY TRIAL CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-stone-100/35 border-y border-stone-200/50 py-16 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 font-sans">
            Support Center
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-stone-900 mt-2">
            Frequently Asked Trial Questions
          </h2>
        </div>

        <FAQAccordion category="trial" />
      </section>
    </div>
  );
};
