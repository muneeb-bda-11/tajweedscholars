import React from "react";
import { SITE_CONFIG } from "../config/site";
import { Link } from "../lib/router";
import { Icon } from "./Icon";

const corePrograms = [
  { label: "Kids Classes", path: "/kids-quran-classes" },
  { label: "Adult Classes", path: "/adult-quran-classes" },
  { label: "Tajweed", path: "/tajweed-course" },
  { label: "Hifz", path: "/hifz-program" }
];

const academyLinks = [
  { label: "About", path: "/about" },
  { label: "Pricing", path: "/pricing" },
  { label: "Free Trial", path: "/free-trial" },
  { label: "Contact", path: "/contact" }
];

const socialLinks = [
  { key: "instagram", label: "Instagram", icon: "Instagram" },
  { key: "facebook", label: "Facebook", icon: "Facebook" },
  { key: "youtube", label: "YouTube", icon: "Youtube" },
  { key: "tiktok", label: "TikTok", icon: "Music2" },
  { key: "linkedin", label: "LinkedIn", icon: "Linkedin" }
] as const;

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const configuredSocials = socialLinks.filter((social) => SITE_CONFIG.SOCIAL_LINKS[social.key]);

  return (
    <footer id="app-footer" className="border-t border-emerald-700 bg-emerald-800 text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 border-b border-white/20 pb-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <img
              src="/brand/logo-horizontal-white.svg"
              alt="Tajweed Scholars"
              width="1600"
              height="400"
              className="h-auto w-[185px] object-contain sm:w-[195px] lg:w-[240px]"
            />
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/90">Live, private one-to-one Quran classes for children and adults.</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <a href={SITE_CONFIG.WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Contact Tajweed Scholars on WhatsApp at +92 324 660 8501" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold hover:text-white"><Icon name="MessageSquare" size={16} />WhatsApp <span className="text-white/75">+92 324 660 8501</span></a>
              <a href={`mailto:${SITE_CONFIG.CONTACT_EMAIL}`} aria-label={`Email Tajweed Scholars at ${SITE_CONFIG.CONTACT_EMAIL}`} className="inline-flex min-h-10 min-w-0 items-center gap-2 text-sm font-semibold hover:text-white"><Icon name="Mail" size={16} /><span className="sm:hidden">Email us</span><span className="hidden break-all sm:inline">{SITE_CONFIG.CONTACT_EMAIL}</span></a>
            </div>
            {configuredSocials.length > 0 && <div className="mt-2 flex gap-1" aria-label="Tajweed Scholars social media">{configuredSocials.map((social) => <a key={social.key} href={SITE_CONFIG.SOCIAL_LINKS[social.key]} target="_blank" rel="noopener noreferrer" aria-label={`Follow Tajweed Scholars on ${social.label}`} className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"><Icon name={social.icon} size={17} /></a>)}</div>}
          </div>

          <div className="grid grid-cols-2 gap-6 lg:col-span-7">
            <div>
              <h2 className="text-xs font-bold text-white">Programs</h2>
              <ul className="mt-2 grid grid-cols-1">
                {corePrograms.map((program) => <li key={program.path}><Link to={program.path} className="flex min-h-9 items-center text-sm hover:text-white sm:min-h-10 sm:text-[15px]">{program.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Academy</h2>
              <ul className="mt-2 grid grid-cols-1">
                {academyLinks.map((link) => <li key={link.path}><Link to={link.path} className="flex min-h-9 items-center text-sm hover:text-white sm:min-h-10 sm:text-[15px]">{link.label}</Link></li>)}
              </ul>
            </div>
          </div>
        </div>

        <p className="pt-4 text-xs text-white/85">© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
      </div>
    </footer>
  );
};
