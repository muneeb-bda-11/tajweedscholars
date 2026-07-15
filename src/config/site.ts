/**
 * Tajweed Scholars - Central Configuration and Content File
 * This file contains all editable business details, program descriptions, pricing plans,
 * navigation metadata, FAQs, and contact parameters.
 */

export const SITE_CONFIG = {
  name: "Tajweed Scholars",
  tagline: "Helping Every Muslim Build a Lifelong Connection with the Quran",
  description: "Online Quran Academy for Kids & Adults offering live 1-to-1 classes with Sanad & Ijazah certified teachers.",
  
  // Contact & Socials
  WHATSAPP_NUMBER: "+923246608501",
  CONTACT_EMAIL: "tajweedscholar@gmail.com",
  WHATSAPP_LINK: "https://wa.me/923246608501",
  SOCIAL_LINKS: { instagram: "", facebook: "", youtube: "", tiktok: "", linkedin: "" },
  
  // App Setup
  DEMO_MODE: true, // When true, validates form but doesn't transmit data
  SHOW_EXACT_PRICES: false, // Hidden completely per guidelines
  FORM_ENDPOINT: "", // Secure POST endpoint for form submissions
  POLICY_PAGES_ENABLED: false, // Disabled by default
  
  // Metadata & Countries Served
  countriesServed: ["United States", "United Kingdom", "Canada", "Australia"],
  timeZoneInfo: "Class timings are confirmed in each student's local time zone."
};

// Explicit visibility helper flags derived from config
export const HAS_WHATSAPP = !!SITE_CONFIG.WHATSAPP_NUMBER && !!SITE_CONFIG.WHATSAPP_LINK;
export const HAS_CONTACT_EMAIL = !!SITE_CONFIG.CONTACT_EMAIL;
export const HAS_FORM_ENDPOINT = !!SITE_CONFIG.FORM_ENDPOINT;

export interface Program {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string; // Lucide icon name
  path: string;
  highlights: string[];
}

export const PROGRAMS: Program[] = [
  {
    id: "kids-classes",
    title: "Kids Quran Classes",
    shortDescription: "For children ages 4–15, from their first Arabic letters to confident Quran recitation.",
    fullDescription: "Designed specifically for young minds, this program keeps children engaged, motivated, and excited about learning. We cover the basic Arabic letters (Qaida), standard pronunciation, visual recognition, and gradual transition into reciting the Quran with beautiful Tajweed, tailored to each child's learning pace.",
    icon: "Baby",
    path: "/kids-quran-classes",
    highlights: [
      "Fun, interactive 1-to-1 teaching style",
      "Age-appropriate activities and positive encouragement",
      "Patient, certified teachers trained to keep kids engaged",
      "Flexible timings fitting school & family routines"
    ]
  },
  {
    id: "adult-classes",
    title: "Adult Quran Classes",
    shortDescription: "Private, judgment-free Quran and Tajweed learning for adults at every starting level.",
    fullDescription: "It is never too late to refine your recitation or start from the beginning. Our adult classes provide a supportive, completely judgment-free private environment. Whether you are learning to read for the first time or polishing your pronunciation, your teacher adapts to your busy schedule and individual goals.",
    icon: "GraduationCap",
    path: "/adult-quran-classes",
    highlights: [
      "100% private, highly supportive 1-to-1 setting",
      "Flexible scheduling for professionals and parents",
      "Tailored focus: from basic reading to advanced recitation",
      "Teacher gender preferences are considered where relevant, subject to availability and schedule compatibility."
    ]
  },
  {
    id: "tajweed-course",
    title: "Tajweed Course",
    shortDescription: "Systematic Makharij, Sifaat, rules, correction, and advanced recitation development.",
    fullDescription: "Master the rules of Tajweed systematically. Learn the correct articulation points of letters (Makharij), their essential characteristics (Sifaat), rules of Noon and Meem Sakinah, Mudood (elongations), and apply them directly to your recitation. This course transitions you from reading to reciting with precision.",
    icon: "BookOpen",
    path: "/tajweed-course",
    highlights: [
      "In-depth analysis of articulation points (Makharij)",
      "Practical application of Tajweed rules on Quranic passages",
      "Syllabus based on traditional Tajweed texts",
      "Immediate correction & fine-tuning of tone and rhythm"
    ]
  },
  {
    id: "hifz-program",
    title: "Hifz Program",
    shortDescription: "Structured Quran memorization using Sabaq, Sabqi, and Manzil.",
    fullDescription: "A structured approach to memorizing the Book of Allah. Our teachers use the proven three-pillar system of memorization: Sabaq (newly memorized portion), Sabqi (recent revision), and Manzil (old revision). This ensures your memorization is designed to strengthen long-term retention through regular revision.",
    icon: "Bookmark",
    path: "/hifz-program",
    highlights: [
      "Daily structured memorization plans (Sabaq)",
      "Rigorous systematic revision cycle (Sabqi & Manzil)",
      "Focus on maintaining accurate Tajweed and careful recitation.",
      "Regular memorization and revision reviews"
    ]
  },
  {
    id: "arabic-language",
    title: "Arabic Language",
    shortDescription: "Arabic learning through consultation-based placement during Phase 1.",
    fullDescription: "Phase 1 enrollment for Arabic language classes is entirely consultation-based, and class placement is confirmed individually. Learn to read, understand, and communicate in classical Quranic Arabic or Modern Standard Arabic. Syllabus planning is customized through a personal consultation class with our academic team to fit your specific objectives.",
    icon: "Languages",
    path: "/arabic-language",
    highlights: [
      "Custom-tailored vocabulary and grammar focus",
      "Understanding Quranic vocabulary & sentence structures",
      "Consultation-based placement to match your current level",
      "Practical exercises for reading and comprehension"
    ]
  },
  {
    id: "islamic-studies",
    title: "Islamic Studies",
    shortDescription: "Initially available as an add-on alongside eligible Quran programs.",
    fullDescription: "Islamic Studies is initially available as an add-on alongside eligible Quran programs, rather than as a standalone comprehensive program. Equip yourself or your children with essential Islamic knowledge, covering basic Aqeedah (belief), Fiqh of daily worship, Seerah (prophetic biography), Islamic history, and daily Adhkar (supplications), integrated seamlessly into your standard Quran schedule.",
    icon: "HeartHandshake",
    path: "/islamic-studies",
    highlights: [
      "Age-appropriate curricula for kids and adults",
      "Covers daily Adhkar, basic Fiqh, and Islamic manners (Akhlaq)",
      "Engaging stories of the Prophets and Seerah",
      "Offered as a value-added module with Quran studies"
    ]
  }
];

export interface TrustPoint {
  title: string;
  description: string;
}

export const TRUST_STRIP: TrustPoint[] = [
  {
    title: "Sanad & Ijazah Instructors",
    description: "Instructors hold certified credentials and traditional permissions."
  },
  {
    title: "Live, Private 1-to-1 Sessions",
    description: "Undivided teacher attention focused entirely on your pronunciation, pace, and progress."
  },
  {
    title: "Structured Level-by-Level Path",
    description: "A clear, milestone-driven curriculum. No open-ended, structureless reading circles."
  },
  {
    title: "Regular Feedback & Updates",
    description: "Regular attendance notes, homework updates, teacher feedback, and progress updates."
  }
];

export interface FeatureSection {
  id: string;
  title: string;
  boldText: string;
  description: string;
  icon: string;
}

export const WHY_CHOOSE_US: FeatureSection[] = [
  {
    id: "curriculum",
    title: "A Real Curriculum, Not Just a Teacher",
    boldText: "Every class is part of a defined learning path with clear levels, modules, and milestones.",
    description: "Our students follow a well-crafted academic syllabus. They are never placed into an open-ended, directionless reading group. From Day 1, you know exactly what level you are in and what goals you are working toward.",
    icon: "Compass"
  },
  {
    id: "teachers",
    title: "Teachers You Can Verify",
    boldText: "Tajweed Scholars is led by a founder with a complete verified Sanad.",
    description: "We are committed to absolute academic integrity. Every teacher is required to hold verified Sanad/Ijazah credentials. Before they are assigned to any family, we rigorously audit their teaching abilities, Tajweed accuracy, professionalism, and online teaching suitability.",
    icon: "BadgeCheck"
  },
  {
    id: "progress",
    title: "Progress You Can Actually See",
    boldText: "Families receive regular attendance notes, homework updates, teacher feedback, and clear next goals.",
    description: "We bridge the gap between classroom and home. Parents receive transparent progress updates after lessons, outlining exactly what was studied, homework assignments, and upcoming milestones so you're always in the loop.",
    icon: "LineChart"
  }
];

export interface TrialStep {
  number: number;
  title: string;
  subtitle: string;
  description: string;
}

export const TRIAL_STEPS: TrialStep[] = [
  {
    number: 1,
    title: "Trial 1",
    subtitle: "Assessment & Connection",
    description: "The official placement class. The teacher confirms the correct starting level while also delivering a real, engaging mini-lesson to establish connection and trust."
  },
  {
    number: 2,
    title: "Trial 2",
    subtitle: "Real Learning Experience",
    description: "A complete, uninterrupted lesson at the correct level, focusing on precise pronunciation correction, guided practice, and warm, encouraging feedback."
  },
  {
    number: 3,
    title: "Trial 3",
    subtitle: "Confidence & Recommendation",
    description: "A final lesson to solidify the routine, followed by a detailed progress recap and a completely transparent, no-pressure recommendation for your next learning plan."
  }
];

export interface PricingPlan {
  id: string;
  title: string;
  frequency: string;
  priceValue: number; // Development/exact price
  features: string[];
  isPopular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    title: "Starter Plan",
    frequency: "1 day per week",
    priceValue: 40,
    features: [
      "Dedicated private teacher",
      "Live 1-to-1 classes through Zoom",
      "30-minute sessions",
      "Structured level-by-level curriculum",
      "Regular progress updates",
      "Three free trial classes included"
    ]
  },
  {
    id: "standard",
    title: "Standard Plan",
    frequency: "2 days per week",
    priceValue: 50,
    isPopular: true,
    features: [
      "Recommended for most students",
      "Dedicated private teacher",
      "Live 1-to-1 classes through Zoom",
      "30-minute sessions",
      "Structured level-by-level curriculum",
      "Regular progress updates",
      "Three free trial classes included"
    ]
  },
  {
    id: "growth",
    title: "Growth Plan",
    frequency: "3 days per week",
    priceValue: 60,
    features: [
      "Dedicated private teacher",
      "Live 1-to-1 classes through Zoom",
      "30-minute sessions",
      "Structured level-by-level curriculum",
      "Regular progress updates",
      "Three free trial classes included"
    ]
  },
  {
    id: "strong-progress",
    title: "Strong Progress Plan",
    frequency: "4 days per week",
    priceValue: 70,
    features: [
      "Dedicated private teacher",
      "Live 1-to-1 classes through Zoom",
      "30-minute sessions",
      "Structured level-by-level curriculum",
      "Regular progress updates",
      "Three free trial classes included"
    ]
  },
  {
    id: "intensive",
    title: "Intensive Plan",
    frequency: "5 days per week",
    priceValue: 75,
    features: [
      "Dedicated private teacher",
      "Live 1-to-1 classes through Zoom",
      "30-minute sessions",
      "Structured level-by-level curriculum",
      "Regular progress updates",
      "Three free trial classes included"
    ]
  },
  {
    id: "weekend-1day",
    title: "Weekend 1-Day Plan",
    frequency: "Saturday or Sunday",
    priceValue: 40,
    features: [
      "Dedicated private teacher",
      "Live 1-to-1 classes through Zoom",
      "30-minute sessions",
      "Structured level-by-level curriculum",
      "Regular progress updates",
      "Three free trial classes included"
    ]
  },
  {
    id: "weekend-2day",
    title: "Weekend 2-Day Plan",
    frequency: "Saturday and Sunday",
    priceValue: 50,
    features: [
      "Dedicated private teacher",
      "Live 1-to-1 classes through Zoom",
      "30-minute sessions",
      "Structured level-by-level curriculum",
      "Regular progress updates",
      "Three free trial classes included"
    ]
  }
];

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "general" | "pricing" | "trial";
}

export const FAQS: FAQ[] = [
  {
    id: "q-trial-free",
    question: "Are all three trial classes free?",
    answer: "Yes, absolutely. All three trial classes are completely free and no payment information is required to book them. This ensures you experience our quality with zero commitment.",
    category: "trial"
  },
  {
    id: "q-trial-length",
    question: "How long is each trial class?",
    answer: "Each trial is 30 minutes long and takes place live 1-to-1 through Zoom with a dedicated teacher assigned to you.",
    category: "trial"
  },
  {
    id: "q-trial-prep",
    question: "Do we need to prepare anything?",
    answer: "No formal preparation is required. The student should simply join from a quiet place with a stable internet connection, using a laptop, tablet, or phone.",
    category: "trial"
  },
  {
    id: "q-trial-after",
    question: "What happens after Trial 3?",
    answer: "Within 24 hours after your third trial class, our Admissions team sends a personalized lesson recap and an academic recommendation plan. Continuing with paid enrollment is entirely optional.",
    category: "trial"
  },
  {
    id: "q-gender-pref",
    question: "Can we request a male or female teacher?",
    answer: "Yes. Teacher gender preferences are carefully considered wherever relevant, subject to teacher availability and schedule compatibility.",
    category: "trial"
  },
  {
    id: "q-fees-hidden",
    question: "Are there any hidden fees or trial fees?",
    answer: "No. There are no registration fees, platform fees, or hidden costs. You only pay the flat monthly rate for your selected subscription plan.",
    category: "pricing"
  },
  {
    id: "q-change-plan",
    question: "Can we change our plan later?",
    answer: "Yes, you can upgrade, downgrade, or change your weekly frequency at any time by contacting support. Changes will be reflected in your next monthly billing cycle.",
    category: "pricing"
  },
  {
    id: "q-pause-classes",
    question: "Can we pause classes during holidays or travel?",
    answer: "Yes. You can temporarily pause your plan with a minimum 7 days notice. We will hold your spot and resume classes as soon as you return.",
    category: "pricing"
  },
  {
    id: "q-siblings",
    question: "Do you offer family or sibling discounts?",
    answer: "Yes, we offer special sibling rates. Please submit a free trial request and note your sibling details in the additional info box so our admissions coordinator can provide a customized quote.",
    category: "pricing"
  },
  {
    id: "q-weekend",
    question: "Are weekend class timings available?",
    answer: "Yes, we have dedicated weekend plans (once-a-week or twice-a-week) as well as regular weekday timings to fit your busy schedule.",
    category: "pricing"
  }
];

export const NAVIGATION_LINKS = {
  main: [
    { label: "Home", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" }
  ],
  programs: [
    { label: "Kids Quran Classes", path: "/kids-quran-classes" },
    { label: "Adult Quran Classes", path: "/adult-quran-classes" },
    { label: "Tajweed Course", path: "/tajweed-course" },
    { label: "Hifz Program", path: "/hifz-program" },
    { label: "Arabic Language", path: "/arabic-language" },
    { label: "Islamic Studies", path: "/islamic-studies" }
  ],
  otherPlaceholders: [
    { label: "Why Choose Us", path: "/why-choose-us" }
  ],
  policies: [
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms and Conditions", path: "/terms-and-conditions" },
    { label: "Payment Policy", path: "/payment-policy" },
    { label: "Refund Policy", path: "/refund-policy" },
    { label: "Reschedule Policy", path: "/reschedule-policy" }
  ]
};
