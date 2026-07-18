export const CANONICAL_BASE = "https://tajweedscholars.com";

export interface PageMetadata {
  title: string;
  description: string;
}

export const PAGE_METADATA: Record<string, PageMetadata> = {
  "/": { title: "Live 1-to-1 Online Quran Classes | Tajweed Scholars", description: "Live, private one-to-one Quran classes for children and adults with verified Sanad/Ijazah teachers and three free trial classes." },
  "/programs": { title: "Online Quran Programs | Tajweed Scholars", description: "Explore private Quran, Tajweed, Hifz, Arabic, and Islamic Studies learning pathways for children and adults." },
  "/kids-quran-classes": { title: "Kids Quran Classes Ages 4–15 | Tajweed Scholars", description: "Private online Quran classes for children ages 4–15, with age-appropriate teaching, verified teachers, and parent communication." },
  "/adult-quran-classes": { title: "Private Adult Quran Classes | Tajweed Scholars", description: "Judgment-free, private online Quran and Tajweed classes for adults at every starting level." },
  "/tajweed-course": { title: "Online Tajweed Course | Tajweed Scholars", description: "Study Makharij, Sifaat, Tajweed rules, correction, and advanced recitation in live private classes." },
  "/hifz-program": { title: "Online Hifz Program | Tajweed Scholars", description: "A private Quran memorization pathway structured around Sabaq, Sabqi, Manzil, Tajweed, and regular revision." },
  "/arabic-language": { title: "Online Arabic Language Classes | Tajweed Scholars", description: "Consultation-based Phase 1 Arabic placement for Quranic Arabic or Modern Standard Arabic learning." },
  "/islamic-studies": { title: "Online Islamic Studies Add-on | Tajweed Scholars", description: "Islamic Studies learning available as an add-on with eligible Tajweed Scholars Quran programs." },
  "/pricing": { title: "Online Quran Class Pricing | Tajweed Scholars", description: "Monthly private Quran class plans start from $40, with one-to-five-day and weekend options." },
  "/free-trial": { title: "Book 3 Free Trial Classes | Tajweed Scholars", description: "Book three free private Quran trial classes. Trial 1 includes placement assessment and a real mini-lesson." },
  "/about": { title: "About Tajweed Scholars", description: "Learn about Tajweed Scholars, a private online Quran academy led by a founder with a complete verified Sanad." },
  "/why-choose-us": { title: "Why Choose Tajweed Scholars", description: "Verified Sanad/Ijazah teachers, private one-to-one learning, safeguarding standards, and regular progress updates." },
  "/contact": { title: "Contact Tajweed Scholars", description: "Contact Tajweed Scholars through official WhatsApp or email for trials, programs, scheduling, and support." },
  "/privacy-policy": { title: "Privacy Policy | Tajweed Scholars", description: "Read how Tajweed Scholars handles information for prospective and enrolled learners, parents, and guardians." },
  "/terms-and-conditions": { title: "Terms & Conditions | Tajweed Scholars", description: "Read the Tajweed Scholars Terms & Conditions — how live, one-to-one Quran classes, trials, and enrolment work." },
  "/payment-policy": { title: "Payment Policy | Tajweed Scholars", description: "How Tajweed Scholars billing, approved manual payment methods, currency, and missed payments work." },
  "/refund-policy": { title: "Refund Policy | Tajweed Scholars", description: "Tajweed Scholars refund policy for free trials, missed classes, plan pauses, and approved refunds." },
  "/reschedule-policy": { title: "Reschedule & Make-Up Class Policy | Tajweed Scholars", description: "How rescheduling, notice periods, make-up classes, and holiday scheduling work at Tajweed Scholars." },
  "/child-safeguarding": { title: "Child Safeguarding Policy | Tajweed Scholars", description: "How Tajweed Scholars protects students under 18 through official contact, teacher vetting, and concern reporting." },
  "/recording-policy": { title: "Class Recording & Consent Policy | Tajweed Scholars", description: "When classes may be recorded, how consent works, who can access recordings, and the retention standard." },
  "/complaints": { title: "Complaints Process | Tajweed Scholars", description: "How to raise a concern with Tajweed Scholars and how complaints are reviewed, resolved, and escalated." },
  "/acceptable-use": { title: "Acceptable Use Policy | Tajweed Scholars", description: "How to use Tajweed Scholars classes, official communication channels, and website respectfully and safely." },
};

export const PUBLIC_ROUTES = Object.keys(PAGE_METADATA);
