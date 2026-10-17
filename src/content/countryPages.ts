export interface CountryTimingRow {
  slot: string;
  detail: string;
}

export interface CountryPageData {
  path: string;
  countryName: string;
  title: string;
  metaDescription: string;
  intro: string[];
  timezoneLine: string;
  timingRows: CountryTimingRow[];
  timingNote: string;
  cities: string[];
  pricingTeaser: string;
  pricingCurrencyNote: string;
  faqs: Array<readonly [question: string, answer: string]>;
}

export const COUNTRY_PAGES: Record<string, CountryPageData> = {
  "/online-quran-classes-in-usa": {
    path: "/online-quran-classes-in-usa",
    countryName: "the USA",
    title: "Online Quran Classes in the USA",
    metaDescription:
      "Live, private 1-to-1 online Quran classes for kids and adults across the USA. US-timezone scheduling, verified teachers, and 3 free trial classes.",
    intro: [
      "Tajweed Scholars offers live, private one-to-one Quran classes for children and adults across the United States. Every class is taught live over Zoom by a teacher with verified Sanad/Ijazah credentials — never a recorded lesson, never a group class.",
      "Families in the USA usually choose evening slots after school and work. Scheduling is arranged around US time zones, and every new learner begins with three free trial classes before any payment is discussed.",
    ],
    timezoneLine: "Classes are scheduled across Eastern, Central, Mountain, and Pacific time.",
    timingRows: [
      { slot: "Weekday evenings", detail: "Typically 4 PM – 9 PM local time — the most popular option for school-age children." },
      { slot: "Weekday mornings", detail: "Limited availability for homeschooling families and adult learners." },
      { slot: "Weekends", detail: "Saturday and Sunday slots, including dedicated Weekend 1-Day and 2-Day plans." },
    ],
    timingNote:
      "These are typical scheduling windows. Your exact class times are confirmed by our admissions team based on teacher availability — request your free trial and we will propose slots that fit your routine.",
    cities: ["New York", "Chicago", "Houston", "Dallas", "Los Angeles", "Atlanta", "Dearborn", "Minneapolis"],
    pricingTeaser: "Plans from $29/month",
    pricingCurrencyNote: "Billed in USD. Payment through Remitly, TapTap Send, or bank transfer.",
    faqs: [
      ["What times are Quran classes available in the USA?", "Most US families choose weekday evening slots, typically between 4 PM and 9 PM in their local time zone — Eastern, Central, Mountain, or Pacific. Weekend and limited morning slots are also available. Exact times are confirmed by admissions based on teacher availability."],
      ["How do the three free trial classes work?", "Every new learner receives three free trial classes with no payment details required. Trial 1 includes a placement assessment and a real mini-lesson, Trial 2 is a full learning experience, and Trial 3 ends with a progress recap and an enrollment recommendation."],
      ["Are the teachers qualified?", "Every Tajweed Scholars teacher holds verified Sanad/Ijazah credentials, checked before they are assigned to any student. The academy is led by a founder with a complete verified Sanad."],
      ["What ages do you teach?", "Our Kids Quran Classes serve ages 4–15, and we run a separate private pathway for adult learners. Teenagers are placed according to level, not just age."],
      ["How much do online Quran classes cost in the USA?", "Plans start from $29/month for one class per week, up to five days per week plus weekend options. Billing is in USD and admissions confirms your plan after the trial classes."],
      ["How do we pay from the USA?", "We accept Remitly, TapTap Send, and direct bank transfer. Payment details are shared only through official Tajweed Scholars channels — card payments are never collected on this website."],
      ["What if we need to reschedule a class?", "Classes can be rescheduled with at least 24 hours notice for students under 18 (4 hours for adults) through our official WhatsApp channel — never through a teacher's personal number. Rescheduled classes carry no penalty."],
      ["Is it safe for my child to learn online?", "Safeguarding is a first-class standard here: teachers never contact students through personal numbers or social media, a parent is always the point of contact, and every teacher is vetted before teaching a child. Read our Child Safeguarding Policy for the full detail."],
      ["Do you offer weekend-only classes?", "Yes — Weekend 1-Day and Weekend 2-Day plans are designed for families who prefer Saturday and Sunday learning."],
      ["How do we start?", "Book three free trial classes through our trial form or WhatsApp. Admissions will confirm placement, timing, and teacher matching — usually within one business day."],
    ],
  },
  "/online-quran-classes-in-uk": {
    path: "/online-quran-classes-in-uk",
    countryName: "the UK",
    title: "Online Quran Classes in the UK",
    metaDescription:
      "Live, private 1-to-1 online Quran classes for kids and adults across the UK. After-school GMT/BST scheduling, verified teachers, and 3 free trial classes.",
    intro: [
      "Tajweed Scholars offers live, private one-to-one Quran classes for children and adults across the United Kingdom. Every class is taught live over Zoom by a teacher with verified Sanad/Ijazah credentials — never a recorded lesson, never a group class.",
      "UK families usually choose after-school slots. Scheduling follows GMT/BST, and every new learner begins with three free trial classes before any payment is discussed.",
    ],
    timezoneLine: "Classes are scheduled around UK time (GMT/BST), including after-school hours.",
    timingRows: [
      { slot: "After school", detail: "Typically 4 PM – 8 PM UK time — the most popular option for school-age children." },
      { slot: "Weekday mornings", detail: "Limited availability for home-educating families and adult learners." },
      { slot: "Weekends", detail: "Saturday and Sunday slots, including dedicated Weekend 1-Day and 2-Day plans." },
    ],
    timingNote:
      "These are typical scheduling windows. Your exact class times are confirmed by our admissions team based on teacher availability — request your free trial and we will propose slots that fit your routine.",
    cities: ["London", "Birmingham", "Manchester", "Bradford", "Leicester", "Luton", "Leeds", "Glasgow"],
    pricingTeaser: "Plans from £30/month",
    pricingCurrencyNote: "Billed in GBP. Payment through Remitly, TapTap Send, or bank transfer.",
    faqs: [
      ["What times are Quran classes available in the UK?", "Most UK families choose after-school slots, typically between 4 PM and 8 PM UK time (GMT/BST). Weekend and limited morning slots are also available. Exact times are confirmed by admissions based on teacher availability."],
      ["How do the three free trial classes work?", "Every new learner receives three free trial classes with no payment details required. Trial 1 includes a placement assessment and a real mini-lesson, Trial 2 is a full learning experience, and Trial 3 ends with a progress recap and an enrollment recommendation."],
      ["Are the teachers qualified?", "Every Tajweed Scholars teacher holds verified Sanad/Ijazah credentials, checked before they are assigned to any student. The academy is led by a founder with a complete verified Sanad."],
      ["What ages do you teach?", "Our Kids Quran Classes serve ages 4–15, and we run a separate private pathway for adult learners. Teenagers are placed according to level, not just age."],
      ["How much do online Quran classes cost in the UK?", "Plans start from £30/month for one class per week, up to five days per week plus weekend options. Billing is in GBP and admissions confirms your plan after the trial classes."],
      ["How do we pay from the UK?", "We accept Remitly, TapTap Send, and direct bank transfer. Payment details are shared only through official Tajweed Scholars channels — card payments are never collected on this website."],
      ["What if we need to reschedule a class?", "Classes can be rescheduled with at least 24 hours notice for students under 18 (4 hours for adults) through our official WhatsApp channel — never through a teacher's personal number. Rescheduled classes carry no penalty."],
      ["Is it safe for my child to learn online?", "Safeguarding is a first-class standard here: teachers never contact students through personal numbers or social media, a parent is always the point of contact, and every teacher is vetted before teaching a child. Read our Child Safeguarding Policy for the full detail."],
      ["Do you offer weekend-only classes?", "Yes — Weekend 1-Day and Weekend 2-Day plans are designed for families who prefer Saturday and Sunday learning."],
      ["How do we start?", "Book three free trial classes through our trial form or WhatsApp. Admissions will confirm placement, timing, and teacher matching — usually within one business day."],
    ],
  },
};

export const countryPageForPath = (path: string): CountryPageData | undefined => COUNTRY_PAGES[path];
export const COUNTRY_PAGE_PATHS = Object.keys(COUNTRY_PAGES);
