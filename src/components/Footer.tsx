import React from "react";
import { Link } from "../lib/router";
import { SITE_CONFIG, NAVIGATION_LINKS } from "../config/site";
import { Icon } from "./Icon";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-stone-600 border-t border-stone-200/80 pt-16 pb-12" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-stone-200/80">
          
          {/* Logo & Tagline Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-stone-50 shadow-sm">
                <Icon name="BookOpen" className="text-stone-50" size={18} />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-stone-900">
                {SITE_CONFIG.name}
              </span>
            </div>
            
            <p className="text-stone-500 text-sm leading-relaxed max-w-sm">
              {SITE_CONFIG.tagline}. Live, private 1-to-1 Quran instruction rooted in verified educational traditions.
            </p>
            
            {/* Quick Contact Info */}
            <div className="space-y-2.5 pt-2 text-xs text-stone-500">
              <div className="flex items-center gap-2.5">
                <Icon name="MessageSquare" className="text-emerald-700 shrink-0" size={14} />
                <a href={SITE_CONFIG.WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors">
                  WhatsApp: {SITE_CONFIG.WHATSAPP_NUMBER}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Icon name="Mail" className="text-emerald-700 shrink-0" size={14} />
                <a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="hover:text-stone-900 transition-colors">
                  Email: {SITE_CONFIG.CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          {/* Programs Column */}
          <div>
            <h4 className="text-stone-900 font-display font-semibold text-sm uppercase tracking-wider mb-5">
              Programs
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              {NAVIGATION_LINKS.programs.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-emerald-800 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-stone-900 font-display font-semibold text-sm uppercase tracking-wider mb-5">
              Academy
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li>
                <Link to="/about" className="hover:text-emerald-800 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/why-choose-us" className="hover:text-emerald-800 transition-colors">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-emerald-800 transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/free-trial" className="hover:text-emerald-800 transition-colors">
                  Book Free Trial
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-800 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies Column */}
          <div>
            <h4 className="text-stone-900 font-display font-semibold text-sm uppercase tracking-wider mb-5">
              Policies
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              {NAVIGATION_LINKS.policies.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-emerald-800 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Trust strip details & Compliance Disclaimer */}
        <div className="py-8 border-b border-stone-200/80 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
              <strong>Core Pillars:</strong> Sanad/Ijazah-verified teachers · Live 1-to-1 classes · Regular progress updates · Serving students across the United States, United Kingdom, Canada, and Australia.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold font-mono bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-800/10">
              <Icon name="BadgeCheck" size={13} className="text-emerald-800" />
              <span>Verified Academy</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & safe transactional statement */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
          <p className="text-stone-400 max-w-sm sm:text-right leading-normal">
            Admissions and lesson assignments are conducted directly with parents. No checkout, online payment portals, or card input forms are published here. Payment arrangements are sent exclusively through verified coordinators.
          </p>
        </div>

      </div>
    </footer>
  );
};
