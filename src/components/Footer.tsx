import React from "react";
import { SITE_CONFIG, NAVIGATION_LINKS } from "../config/site";
import { Link } from "../lib/router";
import { Icon } from "./Icon";

const academy = [{ label: "About", path: "/about" }, { label: "Why Choose Us", path: "/why-choose-us" }, { label: "Pricing", path: "/pricing" }, { label: "Free Trial", path: "/free-trial" }, { label: "Contact", path: "/contact" }];
const policyLabels: Record<string, string> = { "/terms-and-conditions": "Terms & Conditions" };
const FooterLink: React.FC<{ label: string; path: string }> = ({ label, path }) => <li><Link to={path} activeClassName="footer-active-route" className="flex min-h-10 items-center text-sm text-white/85 hover:text-white">{label}</Link></li>;

export const Footer: React.FC = () => <footer id="app-footer" className="border-t border-emerald-700 bg-emerald-800 text-white/90">
  <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="grid gap-9 border-b border-white/20 pb-8 sm:grid-cols-2 lg:grid-cols-4">
      <div><img src="/brand/logo-horizontal-white.svg" alt="Tajweed Scholars" width="1600" height="400" className="h-auto w-[205px]"/><p className="mt-3 text-sm leading-6">Live, private one-to-one Quran classes for children and adults.</p>
        <div className="mt-4 grid gap-2"><a href={SITE_CONFIG.WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 text-sm"><Icon name="Phone" size={18}/><span><strong>WhatsApp</strong><br/><span className="text-white/75">+92 324 660 8501</span></span></a><a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} className="flex min-h-11 items-center gap-3 text-sm"><Icon name="Mail" size={18}/><span><strong>Email</strong><br/><span className="break-all text-white/75">{SITE_CONFIG.CONTACT_EMAIL}</span></span></a></div>
      </div>
      <div><h2 className="text-sm font-bold text-white">Programs</h2><ul className="mt-2">{NAVIGATION_LINKS.programs.map(FooterLink)}</ul></div>
      <div><h2 className="text-sm font-bold text-white">Academy</h2><ul className="mt-2">{academy.map(FooterLink)}</ul></div>
      <div><h2 className="text-sm font-bold text-white">Policies & Support</h2><ul className="mt-2 grid sm:grid-cols-2 lg:grid-cols-1">{NAVIGATION_LINKS.policies.map((link) => <FooterLink key={link.path} path={link.path} label={policyLabels[link.path] || link.label}/>)}</ul></div>
    </div><p className="pt-5 text-xs text-white/75">© {new Date().getFullYear()} Tajweed Scholars. All rights reserved.</p>
  </div>
</footer>;
