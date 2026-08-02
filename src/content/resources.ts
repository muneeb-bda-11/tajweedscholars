export type ResourceCategory = "Getting Started" | "Parents" | "Memorization" | "Teacher Standards";
export type ResourceAudience = "Parents and adult learners" | "Parents" | "Adult beginners" | "Prospective learners and parents";

interface ResourceBase {
  title: string;
  slug: string;
  metaDescription: string;
  summary: string;
  category: ResourceCategory;
  intendedAudience: ResourceAudience;
  authorName: string;
  reviewerName?: string;
  publishedDate: string | null;
  updatedDate: string;
  relatedProgramRoutes: string[];
}

export interface ResourceSection {
  heading: string;
  paragraphs: string[];
  links?: Array<{ label: string; route: string }>;
}

export interface PublishedResource extends ResourceBase {
  draft: false;
  publishedDate: string;
  introduction: string;
  sections: ResourceSection[];
}

export interface DraftResource extends ResourceBase {
  draft: true;
  publishedDate: null;
}

export type ResourceRecord = PublishedResource | DraftResource;

export const RESOURCE_RECORDS: ResourceRecord[] = [
  {
    title: "What Happens in Three Free Quran Trial Classes?",
    slug: "what-happens-in-three-free-quran-trial-classes",
    metaDescription: "A clear guide to Tajweed Scholars’ three free Quran trial classes, from placement and a mini-lesson to feedback and an enrollment recommendation.",
    summary: "A practical, step-by-step explanation of the three free trial classes and what admissions confirms before regular lessons begin.",
    category: "Getting Started",
    intendedAudience: "Parents and adult learners",
    authorName: "Tajweed Scholars Admissions Team",
    publishedDate: "2026-08-02",
    updatedDate: "2026-08-02",
    draft: false,
    relatedProgramRoutes: ["/kids-quran-classes", "/adult-quran-classes", "/tajweed-course", "/hifz-program"],
    introduction: "The three free trial classes are designed to help a learner experience private, live Quran teaching before making an enrollment decision. All three trials are free, and no payment details are required.",
    sections: [
      {
        heading: "Before the first trial",
        paragraphs: ["After a trial request is sent, the admissions team normally responds within one business day. Admissions confirms the learner’s goals, suitable timing, and teacher matching before the trial schedule is finalized."],
        links: [{ label: "Book 3 Free Trial Classes", route: "/free-trial" }],
      },
      {
        heading: "Trial 1: placement and a real mini-lesson",
        paragraphs: ["Trial 1 includes the official placement assessment and a real mini-lesson. The teacher identifies an appropriate starting point while the learner also experiences direct teaching, guided reading, and useful correction. There is no separate assessment class."],
      },
      {
        heading: "Trial 2: a complete learning experience",
        paragraphs: ["Trial 2 is a complete learning experience at the learner’s identified level. It includes teacher-led correction, guided practice, and time to work through the lesson in the same private one-to-one format used for regular classes."],
      },
      {
        heading: "Trial 3: lesson, recap, and recommendation",
        paragraphs: ["Trial 3 includes another lesson, followed by a recap of progress across the trials and a recommendation for the learner’s next step. The recommendation can help the family or adult learner understand a suitable program and learning frequency."],
      },
      {
        heading: "What happens after the trials?",
        paragraphs: ["Enrollment is not automatic or guaranteed. Continuing after the trials is optional, and admissions confirms teacher availability, timing, and the appropriate program before any regular class arrangement is finalized."],
        links: [
          { label: "Explore all Quran programs", route: "/programs" },
          { label: "Kids Quran Classes", route: "/kids-quran-classes" },
          { label: "Adult Quran Classes", route: "/adult-quran-classes" },
        ],
      },
    ],
  },
  {
    title: "How to Know Whether Your Child Should Start with Qaida",
    slug: "how-to-know-whether-your-child-should-start-with-qaida",
    metaDescription: "Draft guide to understanding when a child may need to begin Quran learning with Qaida.",
    summary: "An editorial draft planned for parents considering a child’s Quran reading starting point.",
    category: "Parents",
    intendedAudience: "Parents",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: null,
    updatedDate: "2026-08-02",
    draft: true,
    relatedProgramRoutes: ["/kids-quran-classes"],
  },
  {
    title: "Sabaq, Sabqi and Manzil: A Parent’s Guide",
    slug: "sabaq-sabqi-and-manzil-a-parents-guide",
    metaDescription: "Draft parent guide to the terms Sabaq, Sabqi, and Manzil in a Quran memorization routine.",
    summary: "An editorial draft planned to explain three common parts of a structured memorization routine.",
    category: "Memorization",
    intendedAudience: "Parents",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: null,
    updatedDate: "2026-08-02",
    draft: true,
    relatedProgramRoutes: ["/hifz-program"],
  },
  {
    title: "Starting Quran as an Adult Absolute Beginner",
    slug: "starting-quran-as-an-adult-absolute-beginner",
    metaDescription: "Draft guide for adults preparing to begin Quran reading from the first steps.",
    summary: "An editorial draft planned for adult learners who are new to Quran reading.",
    category: "Getting Started",
    intendedAudience: "Adult beginners",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: null,
    updatedDate: "2026-08-02",
    draft: true,
    relatedProgramRoutes: ["/adult-quran-classes"],
  },
  {
    title: "What Verified Sanad/Ijazah Means When Choosing a Teacher",
    slug: "what-verified-sanad-ijazah-means-when-choosing-a-teacher",
    metaDescription: "Draft guide to understanding verified Sanad/Ijazah credentials when considering a Quran teacher.",
    summary: "An editorial draft planned to explain teacher credential checks without making unsupported claims.",
    category: "Teacher Standards",
    intendedAudience: "Prospective learners and parents",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: null,
    updatedDate: "2026-08-02",
    draft: true,
    relatedProgramRoutes: ["/why-choose-us"],
  },
];

export const PUBLISHED_RESOURCES = RESOURCE_RECORDS.filter((resource): resource is PublishedResource => !resource.draft);
export const DRAFT_RESOURCES = RESOURCE_RECORDS.filter((resource): resource is DraftResource => resource.draft);
export const resourceRoute = (resource: Pick<ResourceRecord, "slug">) => `/resources/${resource.slug}`;
export const publishedResourceForPath = (path: string) => PUBLISHED_RESOURCES.find((resource) => resourceRoute(resource) === path);
