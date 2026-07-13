import React, { useEffect } from "react";
import { useRouter, Link } from "../lib/router";
import { SITE_CONFIG, PROGRAMS, WHY_CHOOSE_US } from "../config/site";
import { TrustStrip } from "../components/TrustStrip";
import { TrialSteps } from "../components/TrialSteps";
import { Icon } from "../components/Icon";
import { motion } from "motion/react";

export const Home: React.FC = () => {
  const { navigate } = useRouter();

  useEffect(() => {
    document.title = "Online Quran Classes for Kids & Adults | Tajweed Scholars";
  }, []);

  return (
    <div className="space-y-20 md:space-y-28" id="home-page">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-16 md:pb-24" id="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-800/10 text-emerald-800 text-xs font-bold uppercase tracking-wider font-sans">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live 1-to-1 Instruction
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.08]">
                Helping Every Muslim Build a <span className="text-amber-300 font-extrabold">Lifelong Connection</span> with the Quran
              </h1>

              <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
                Live, one-to-one Quran classes for children and adults, taught by credentialed instructors, with a structured curriculum, visible progress, and personalized schedules.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => navigate("/free-trial")}
                  className="inline-flex items-center justify-center px-7 py-4 rounded-md text-base font-bold text-stone-50 bg-emerald-800 hover:bg-emerald-850 shadow transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 hover:scale-[1.02] active:scale-[0.98]"
                  id="hero-primary-cta"
                >
                  Book 3 Free Trial Classes
                </button>
                <a
                  href="#programs"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center px-7 py-4 rounded-md text-base font-bold text-emerald-800 bg-transparent hover:bg-emerald-50 border border-emerald-800/35 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700 hover:scale-[1.02]"
                  id="hero-secondary-cta"
                >
                  Explore Our Programs
                </a>
              </div>

              {/* Simple value markers */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200/60 max-w-lg">
                <div>
                  <p className="font-display text-lg font-bold text-emerald-950">1-to-1</p>
                  <p className="text-stone-400 text-xs mt-0.5 font-medium">Private Instruction</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-emerald-950">Structured</p>
                  <p className="text-stone-400 text-xs mt-0.5 font-medium">Clear Curricula</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-emerald-950">No Card</p>
                  <p className="text-stone-400 text-xs mt-0.5 font-medium">Required for Trial</p>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Abstract Visual Placeholder (Non-unverified photo) */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 to-amber-50/50 rounded-2xl blur-2xl transform rotate-3 -z-10" />
              
              <div className="w-full max-w-md bg-stone-50 border border-stone-200/60 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6">
                {/* Dot background pattern */}
                <div className="geometric-pattern absolute inset-0 opacity-15 pointer-events-none" />
                
                {/* Visual Header imitating an online classroom interface */}
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 font-semibold tracking-wider uppercase">
                    Live Classroom Interface
                  </span>
                </div>

                {/* Neutral Visual Teacher Card */}
                <div className="bg-emerald-900 text-stone-100 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-800/60 rounded-full blur-xl animate-pulse" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-850 border border-emerald-700 flex items-center justify-center text-amber-200 shadow">
                      <Icon name="BookOpen" size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-300 font-bold tracking-wider">Custom Lesson</span>
                      <h4 className="font-display font-bold text-lg text-stone-50">Live 1-to-1 Quran Class</h4>
                    </div>
                  </div>

                  {/* Core Features */}
                  <div className="mt-6 space-y-3 relative z-10 text-stone-100 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-800/80 flex items-center justify-center text-amber-300">
                        <Icon name="Check" size={12} className="stroke-[3]" />
                      </div>
                      <span>Teacher guidance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-800/80 flex items-center justify-center text-amber-300">
                        <Icon name="Check" size={12} className="stroke-[3]" />
                      </div>
                      <span>Quran recitation practice</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-800/80 flex items-center justify-center text-amber-300">
                        <Icon name="Check" size={12} className="stroke-[3]" />
                      </div>
                      <span>Live pronunciation correction</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-800/80 flex items-center justify-center text-amber-300">
                        <Icon name="Check" size={12} className="stroke-[3]" />
                      </div>
                      <span>30-minute private session</span>
                    </div>
                  </div>
                </div>

                {/* Live Lesson Progress Indicator */}
                <div className="bg-stone-100/80 rounded-2xl p-5 border border-stone-200/40 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-stone-700">Recitation Practice</span>
                    <span className="text-xs font-semibold text-emerald-800 font-mono">Live Interactive Mode</span>
                  </div>

                  {/* Interactive Progress Line */}
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-700 h-full w-3/4 rounded-full" />
                  </div>

                  <div className="flex items-center gap-2.5 pt-1.5 border-t border-stone-200/50">
                    <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Icon name="Clock" size={12} />
                    </div>
                    <p className="text-stone-600 text-xs">
                      <strong>Lesson Pace:</strong> Fully adjusted to your personal speed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP SECTION */}
      <TrustStrip />

      {/* 3. WHY FAMILIES CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="why-choose-us-section">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full font-mono">
            Our Standard
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mt-3">
            Setting the Benchmark for Online Quran Learning
          </h2>
          <p className="text-stone-500 text-base mt-4 leading-relaxed font-normal">
            We don't match you with random tutors from Craigslist. We build structured, verified, highly professional learning environments that fit modern family life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {WHY_CHOOSE_US.map((feat, index) => {
            const icons = ["Compass", "BadgeCheck", "LineChart"];
            return (
              <div
                key={feat.id}
                className="bg-white border border-stone-200/50 rounded-xl p-8 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group"
                id={`why-choose-${feat.id}`}
              >
                <div className="space-y-6">
                  {/* Decorative index badge */}
                  <div className="absolute top-6 right-8 text-stone-200 text-5xl font-sans font-extrabold select-none opacity-40">
                    0{index + 1}
                  </div>

                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-amber-100 transition-colors duration-300 shadow-sm">
                    <Icon name={icons[index] || "Check"} size={22} />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-sans font-bold text-xl text-stone-950 leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-emerald-950 text-sm leading-relaxed font-semibold">
                      {feat.boldText}
                    </p>
                    <p className="text-stone-500 text-sm leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PROGRAMS GRID SECTION */}
      <section className="bg-stone-100/35 border-y border-stone-200/50 py-20 md:py-24" id="programs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full font-sans">
              Academic Curricula
            </span>
            <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight mt-3">
              Explore Our Comprehensive Programs
            </h2>
            <p className="text-stone-500 text-base mt-3 leading-relaxed font-normal">
              Structured lesson schedules customized for students of all ages and current experience levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.id}
                className="bg-white border border-stone-200/50 rounded-xl p-6 md:p-8 flex flex-col justify-between hover:border-emerald-800/40 hover:shadow-md transition-all duration-300 group"
                id={`program-card-${prog.id}`}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Icon name={prog.icon} size={22} />
                  </div>
                  
                  <h3 className="font-sans font-bold text-lg text-stone-900 tracking-tight group-hover:text-emerald-850 transition-colors">
                    {prog.title}
                  </h3>

                  <p className="text-stone-600 text-sm leading-relaxed">
                    {prog.shortDescription}
                  </p>
                </div>

                {/* Program Card CTA Links */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-200/50 text-xs font-bold font-sans uppercase tracking-wider">
                  <Link
                    to={prog.path}
                    className="text-stone-500 hover:text-emerald-800 transition-colors flex items-center gap-1 group/link focus:outline-none"
                  >
                    Learn More
                    <Icon name="ArrowRight" size={12} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/free-trial"
                    className="text-emerald-850 hover:text-emerald-950 transition-colors flex items-center gap-1 focus:outline-none"
                  >
                    Book Free Trials
                    <span className="text-[10px] text-amber-300">★</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW THE FREE TRIAL WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="how-trial-works">
        <TrialSteps showIntro={true} />
      </section>

      {/* 6. PRICING PREVIEW */}
      <section className="bg-emerald-950 text-stone-100 py-16 md:py-24 relative overflow-hidden" id="pricing-preview">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-850/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300 font-mono">
            Value Without Overhead
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-50">
            Simple, Transparent Pricing
          </h2>
          <p className="text-stone-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Plans start from $40 per month and support one to five classes per week, along with weekend-only options. Every class is live, private, 30 minutes long, and taught by a dedicated teacher.
          </p>

          <div className="pt-4">
            <button
              onClick={() => navigate("/pricing")}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-md text-sm font-bold text-emerald-950 bg-amber-300 hover:bg-amber-400 shadow transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-50 hover:scale-102"
              id="pricing-preview-cta"
            >
              See All Plans
            </button>
          </div>
        </div>
      </section>

      {/* 7. COUNTRIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="countries-served-section">
        <div className="bg-stone-50 border border-stone-200/50 rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 font-sans">
                Global Timings
              </span>
              <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-stone-950 leading-tight">
                Serving Families Across Multiple Time Zones
              </h2>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed font-normal">
                Tajweed Scholars welcomes suitable students from the United States, United Kingdom, Canada, Australia, and other English-speaking markets. Class timings are confirmed in each student’s local time zone.
              </p>
              
              {/* Dynamic visual markers for countries */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {SITE_CONFIG.countriesServed.map((country) => (
                  <div key={country} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-700 font-semibold font-mono">
                    <Icon name="Globe" size={13} className="text-emerald-700" />
                    {country}
                  </div>
                ))}
              </div>
            </div>

            {/* Micro visual map card */}
            <div className="bg-emerald-950 text-stone-100 rounded-xl p-6 border border-emerald-800 shadow-lg space-y-4 relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-800/40 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-amber-300" />
                <span className="font-mono text-[10px] text-stone-400 font-bold uppercase tracking-wider">Local Schedule Optimizer</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Our coordinate team aligns schedules so lessons never conflict with school, prayers, or family commitments.
              </p>
              
              <div className="bg-emerald-900/60 rounded-xl p-3 border border-emerald-850 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400 font-mono">New York (EST)</span>
                  <span className="font-semibold text-amber-200">6:00 PM • Confirmed</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400 font-mono">London (GMT)</span>
                  <span className="font-semibold text-amber-200">5:30 PM • Confirmed</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-400 font-mono">Sydney (AEST)</span>
                  <span className="font-semibold text-amber-200">4:30 PM • Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL HOME CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" id="final-cta">
        <div className="bg-gradient-to-tr from-emerald-900 to-emerald-950 text-stone-100 rounded-xl p-8 md:p-14 text-center relative overflow-hidden shadow-lg border border-emerald-850">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-800/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
              Experience the Teaching Before You Decide
            </h2>
            <p className="text-stone-300 text-sm md:text-base leading-relaxed font-normal">
              Meet a qualified teacher, confirm the right starting level, and experience three real classes before making any enrollment decision.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/free-trial")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-md text-base font-bold text-emerald-950 bg-amber-300 hover:bg-amber-400 shadow transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-50 hover:scale-102"
                id="final-cta-btn"
              >
                Book 3 Free Trial Classes
              </button>
            </div>
            
            <p className="text-[11px] text-stone-400 font-mono uppercase tracking-widest pt-2">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
