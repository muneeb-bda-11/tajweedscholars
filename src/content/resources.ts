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
    authorName: "Tajweed Scholars",
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
    metaDescription: "Wondering whether your child should start with Qaida? Here are the signs to look for, what Qaida covers, and how a placement assessment finds the right level.",
    summary: "A calm guide for parents on recognizing when a child should begin with Qaida, what it covers, and how placement works.",
    category: "Parents",
    intendedAudience: "Parents",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: "2026-10-17",
    updatedDate: "2026-10-26",
    draft: false,
    relatedProgramRoutes: ["/kids-quran-classes"],
    introduction: "Many parents wonder whether their child should begin with Qaida or move straight into reading the Quran. The honest answer is that it depends on the child\u2019s current level, not their age or school year. Starting with Qaida is the normal and expected path for beginners, and it builds the foundation that makes later reading smooth and correct. This guide explains the signs to look for, what Qaida covers, and how a placement assessment finds the right starting point for your child.",
    sections: [
      {
        heading: "Signs your child would benefit from starting with Qaida",
        paragraphs: [
          "The clearest sign is letter recognition. If your child cannot yet name most Arabic letters on sight, or confuses letters that look similar, such as ba, ta, and tha, or jeem, ha, and kha, then Qaida is the right place to begin. Another common sign is guessing: the child looks at a word and guesses it from memory or from its general shape instead of reading each letter in turn. You may also notice that your child reads English fluently for their age but freezes when faced with Arabic script. This gap is completely normal for children with little exposure to Arabic letters, and it is exactly what Qaida is designed to close, step by step.",
          "A second group of signs relates to pronunciation. If your child has no awareness of where Arabic sounds come from, for example pronouncing ayn like a plain a, or ha like an English h, the foundations need attention before Quran reading begins. Some children rush through words, skipping the short vowels, or they read the same word differently each time they meet it. You might also notice avoidance: the child says reading is boring, or asks to stop after a minute. This is rarely laziness. It is usually frustration from being asked to do something the foundations do not yet support. None of these signs mean your child is behind. They simply describe a beginner, and beginners start with Qaida.",
        ],
        links: [{ label: "Explore Kids Quran Classes", route: "/kids-quran-classes" }],
      },
      {
        heading: "What Qaida actually covers",
        paragraphs: [
          "Qaida teaches the Arabic alphabet as a reading system, not as a song to memorize. Children learn each letter in its isolated form and in its connected forms at the beginning, middle, and end of words, because Arabic letters change shape depending on their position. Just as important, each letter is taught with its correct pronunciation from the very first day. A teacher with verified Sanad and Ijazah training models the sound, the child repeats it, and the teacher corrects gently until it is stable. This early attention to pronunciation is what prevents the fixed mistakes that are much harder to remove years later.",
          "Once letters are secure, Qaida introduces the vowel system: fatha, damma, and kasra, then tanween, sukoon, and shaddah. Children practice joining letters into syllables and then into real words, reading across the page with growing confidence. Toward the end, the basics of madd, the elongation of sounds, are introduced in simple form. Every step includes short practice words and lines, so the child is always reading, not just reciting rules. By the time Qaida is complete, the child can open the Quran and read with the vowel marks, which is the skill everything else builds on.",
        ],
      },
      {
        heading: "Age is a guide, but level decides",
        paragraphs: [
          "Most children who start with Qaida are between four and seven, but the number that matters is level, not age. A nine-year-old who has never learned the Arabic alphabet is still a beginner and should still start with Qaida, and there is nothing unusual about that. On the other hand, a six-year-old who has been reading with a parent at home may place directly into early Quran reading. A placement assessment looks at what the child can actually do today: recognize letters, join them, and read with vowels. That evidence, not the birth year, decides the starting point.",
          "Parents sometimes worry that starting with Qaida means their child is behind other children. It does not. Rushing a beginner into Quran reading without letter and vowel foundations almost always creates Tajweed problems later, and those problems take far longer to fix than Qaida itself takes to complete. Children who build clean foundations in Qaida typically move faster once they reach the Quran, because they are not fighting the basics while trying to read. A few months invested at the start saves a great deal of correction later, and every experienced teacher will tell you the same.",
        ],
      },
      {
        heading: "How the placement assessment finds the right starting point",
        paragraphs: [
          "At Tajweed Scholars, the first of the three free trial classes includes a placement assessment alongside a real mini-lesson, so there is no separate test to book or prepare for. In a relaxed one-to-one session over Zoom, the teacher listens to your child read, checks letter recognition, joining, and comfort with vowel marks, and notes pronunciation. Because the assessment happens inside real teaching, the child simply experiences a normal class while the teacher gathers everything needed to judge the right level.",
          "There is no pass or fail, and nothing for your child to be nervous about. After the trial classes, you receive a clear recommendation: start with Qaida, begin early Quran reading, or, for advanced children, focus on Tajweed refinement. The recommendation is specific to your child, and the teacher explains the reasoning in plain language. Booking the trial classes costs nothing and requires no payment details, so the assessment is genuinely risk-free for your family.",
        ],
        links: [{ label: "Book 3 Free Trial Classes", route: "/free-trial" }],
      },
      {
        heading: "What you can do at home",
        paragraphs: [
          "The single most helpful thing a parent can do is protect a short daily revision habit. Five to ten minutes a day of reading the current Qaida page does more than one long weekend session, because young children build recognition through repetition spaced across days. Sit with your child if they are young, or simply stay nearby and listening if they are older. Ask them to read the page their teacher assigned, and let them read it twice. Regularity matters far more than duration.",
          "When your child makes a mistake, correct lightly and move on. Repeating the correct sound once, warmly, teaches more than stopping at every error, which can make reading feel like a test. Praise the effort and the consistency, not just the correct answers: children who feel safe while reading will read more, and reading more is what builds fluency. If you are unsure how a letter should sound, do not guess and drill the wrong version; note it down and ask the teacher in the next class. Your role is encouragement and routine. The teacher handles the technique.",
        ],
      },
      {
        heading: "When your child is ready to move on to the Quran",
        paragraphs: [
          "Readiness shows itself in fluency. Your child reads Qaida pages smoothly with the vowel marks, joins letters without hesitation, and pronounces each letter distinctly and correctly. They no longer guess at words, and they can read a new line they have not practiced with reasonable confidence. The teacher, who hears your child in every class, is the best judge of this moment, and will tell you when the foundations are solid enough for the next step.",
          "The move into the Quran is gradual rather than sudden. The teacher typically begins with short surahs, applying the same careful pronunciation the child learned in Qaida, and Tajweed rules are introduced naturally as reading progresses. There is no ceremony and no pressure; the child simply starts reading real verses with a teacher beside them. From there, the path continues through fluent reading toward Tajweed mastery, and later, for families who choose it, memorization.",
        ],
        links: [{ label: "Learn about the Tajweed Course", route: "/tajweed-course" }],
      },
      {
        heading: "A quick readiness check you can try at home",
        paragraphs: [
          "Before you book anything, try these five questions with your child. There is no score to pass and no result to worry about — this is simply a way to notice what your child can already do, so the teacher's placement assessment starts from useful information, not guesswork.",
          "1. Can your child name most Arabic letters on sight, without prompting? 2. Does your child join two or three letters and read them together with a short vowel? 3. When your child meets a word they have not practised, do they read it letter by letter, or do they guess it from memory or from its shape? 4. Does your child mix up letters that look similar, such as ba, ta, and tha? 5. Does your child avoid reading, or ask to stop after a minute?",
          "If guessing, letter confusion, or avoidance came up, Qaida is the honest starting point — those are exactly the foundations Qaida is built to fix, and starting there is not a setback. If your child already names letters and joins them confidently, the placement assessment may put them into early Quran reading instead. Either way, the teacher decides from what your child actually does in the session, not from this check alone. Bring what you noticed to the free trial classes, and the teacher will take it from there.",
        ],
        links: [{ label: "Book 3 Free Trial Classes", route: "/free-trial" }, { label: "Explore Kids Quran Classes", route: "/kids-quran-classes" }],
      },
      {
        heading: "Frequently asked questions",
        paragraphs: [
          "Q: My child is eight and has never learned Arabic letters. Is it too late to start with Qaida?",
          "A: It is not too late at all. Qaida is about level, not age, and older beginners often move through it faster because their focus and memory are stronger. The placement assessment will confirm the right starting point, and your child will simply begin where they are.",
          "Q: My child has memorized several short surahs by listening. Does he still need Qaida?",
          "A: Memorizing by ear and reading from the page are different skills. A child who has memorized surahs beautifully may still be unable to read unfamiliar verses, which becomes a problem in Tajweed and later in Hifz. If the assessment shows weak letter recognition or joining, a short period in Qaida will protect everything the child has already memorized.",
          "Q: How long does Qaida usually take?",
          "A: It varies with the child\u2019s age, how regularly they attend, and whether short daily revision happens at home. Some children complete it in a few months; others take longer, and both are normal. Your teacher will give you an honest sense of progress after the first few weeks, but we never promise fixed timelines for any level.",
          "Q: Will my child be bored if placed in Qaida?",
          "A: A good teacher keeps Qaida lively with varied practice, short goals, and visible progress, and children usually enjoy the feeling of mastering each new page. Boredom most often comes from material that is too hard or too easy, which is exactly what correct placement prevents.",
          "Q: Can I teach Qaida at home instead of enrolling?",
          "A: Some parents do teach the alphabet at home, and any exposure helps. The advantage of a trained teacher is correct pronunciation from the start: small errors in pronunciation, once drilled in, are difficult to remove later. Many families combine both, with the teacher leading and the parent supporting daily revision.",
          "Q: My child knows the letters but cannot join them yet. Is Qaida still the right place?",
          "A: Yes. Knowing letters on their own and joining them into words are different skills, and joining is one of the core things Qaida teaches. A child in this position is partway through the foundations, not past them, and the placement assessment will simply start them at the joining stage rather than at the very beginning.",
          "Q: How can I tell whether my child is guessing instead of reading?",
          "A: Watch what happens with a line your child has not practised. A child who is reading will work through the letters, slowly but steadily. A child who is guessing will often say a familiar word from memory, change the word each time they meet it, or stop when the shape of the word is unfamiliar. Guessing is common and easy to fix in Qaida, where the habit of reading letter by letter is built step by step.",
          "Q: Why not skip Qaida and start straight into the Quran?",
          "A: Because reading the Quran well depends on the very skills Qaida builds: recognising letters, joining them, and reading with the vowel marks. A child who starts in the Quran without those foundations often memorises by ear instead of reading, and the pronunciation errors picked up that way are much harder to correct later. Qaida first is the slower-looking route that usually turns out to be the faster one.",
        ],
        links: [{ label: "Book 3 Free Trial Classes", route: "/free-trial" }, { label: "Contact our admissions team", route: "/contact" }],
      },
    ],
  },
  {
    title: "Sabaq, Sabqi and Manzil: A Parent\u2019s Guide",
    slug: "sabaq-sabqi-and-manzil-a-parents-guide",
    metaDescription: "Confused by Sabaq, Sabqi and Manzil? A plain-English guide for parents on how the three-part memorization routine works in online 1-to-1 Hifz classes.",
    summary: "Sabaq, Sabqi and Manzil are the three daily parts of a traditional memorization routine. This guide explains each one in plain English.",
    category: "Memorization",
    intendedAudience: "Parents",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: "2026-10-17",
    updatedDate: "2026-10-17",
    draft: false,
    relatedProgramRoutes: ["/hifz-program"],
    introduction: "When parents first hear about Hifz classes, three unfamiliar words come up again and again: Sabaq, Sabqi, and Manzil. They are simply the three daily parts of a traditional memorization routine, used by Quran schools for centuries. Understanding what each one means helps you follow your child\u2019s progress and support them at home. This guide explains all three in plain English.",
    sections: [
      {
        heading: "What the three words mean",
        paragraphs: [
          "Sabaq is the new lesson: the small portion of new verses your child memorizes for the day. In a one-to-one class, the teacher assigns an amount matched to the child\u2019s capacity, sometimes a few lines and sometimes more, and the child recites it back from memory during the class. Sabqi is the recent revision: roughly the last seven days of new lessons, recited again to keep them fresh while they are still settling into memory. Manzil is the older revision: the large body of previously memorized portions, cycled through continuously so that old memorization stays alive.",
          "Think of the three as concentric circles. Sabaq adds new ground at the center, Sabqi guards the ring around it, and Manzil patrols the outer territory. A class that only ever added new verses would produce a student who knows the newest pages and has forgotten the earliest ones, which is why the traditional routine insists on all three, every day, for as long as memorization continues.",
        ],
        links: [{ label: "Explore the Hifz Program", route: "/hifz-program" }],
      },
      {
        heading: "Why all three matter",
        paragraphs: [
          "Memorization without revision fades; this is the oldest lesson in Hifz teaching. Newly memorized verses are fragile for the first days, which is why Sabqi exists: reciting the recent lessons daily moves them from short-term effort into stable memory. Without that step, each new Sabaq quietly erodes the one before it, and the student works hard without accumulating. Parents sometimes wonder why the teacher spends class time on old material instead of pushing forward. The answer is that forward motion without revision is an illusion.",
          "Manzil protects the long term. As the memorized portion grows, no student can hold it all without a system, and Manzil is that system: a rolling cycle through everything memorized so far. Students who keep up with Manzil find that old portions stay fluent for years, while students who let it slide discover, often painfully, that early sections need re-memorization. The discipline of all three parts is what separates students who complete memorization from those who stall midway.",
        ],
      },
      {
        heading: "How they fit into a 30-minute class",
        paragraphs: [
          "In a live one-to-one class, the teacher divides the thirty minutes across the three parts, adjusting the balance as the child\u2019s memorization grows. A common rhythm is to begin with recitation: the child recites the day\u2019s Sabqi and a portion of Manzil to the teacher, who listens for errors and fluency. Then the teacher teaches the new Sabaq, breaking it into small pieces and having the child repeat each piece until it holds. The class ends with the child reciting the new lesson back, so the teacher knows exactly what was secured.",
          "The proportions shift over time. In the early months, when there is little to revise, most of the class goes to the new lesson. As the memorized portion grows, revision takes a larger share, because protecting what exists becomes as important as adding more. A skilled teacher reads the child each day: if the new lesson is shaky, more time goes there; if revision is slipping, Manzil gets priority. This daily judgment is one of the main advantages of one-to-one teaching.",
        ],
        links: [{ label: "Book 3 Free Trial Classes", route: "/free-trial" }],
      },
      {
        heading: "What you should expect to hear after class",
        paragraphs: [
          "After each class, you should receive a clear, plain-language update: what portion was memorized today, how the revision went, and what needs attention before tomorrow. Good teacher feedback is specific rather than vague. Instead of a general comment, expect to hear which verses were fluent, where the child hesitated, and exactly which pages to revise at home. If you ever feel unsure about how your child is doing, ask; regular progress updates are part of the service, not a favor.",
          "Over weeks, these daily notes form a picture you can actually follow: the Sabaq moving steadily forward, the Sabqi staying clean, the Manzil cycling without decay. When something slips, the teacher should name it early and adjust the plan, perhaps slowing new memorization until revision is secure. This honesty is a sign of a good program. A teacher who always says everything is perfect is not giving you information you can act on.",
        ],
        links: [{ label: "Why families choose Tajweed Scholars", route: "/why-choose-us" }],
      },
      {
        heading: "How long memorization takes",
        paragraphs: [
          "This is the question every parent asks, and the honest answer is that it varies. A young child with daily classes, disciplined revision, and strong home support will move faster than a student with an irregular schedule; that is simply how learning works. The factors that matter include the child\u2019s age and memory strength, how many days per week they learn, how consistently revision happens at home, and the quality of the teacher\u2019s daily judgment. Anyone who promises a fixed completion date is guessing, and you should be cautious of such promises.",
          "Our policy is straightforward: we do not guarantee timelines for completing memorization or any other milestone, because learning pace genuinely differs from student to student. What we do promise is the structure that makes steady progress possible: a qualified teacher, a real routine of Sabaq, Sabqi, and Manzil, and honest feedback about where your child stands. Families who commit to the routine, term after term, see their children accumulate the Quran steadily. Patience with the process is part of the process.",
        ],
      },
      {
        heading: "How parents support at home",
        paragraphs: [
          "Your most valuable contribution is listening. Ask your child to recite the day\u2019s Sabaq to you in the evening; your attention turns revision from a chore into a small daily event. Provide a quiet, consistent space and a fixed time for revision, ideally the same time each day, so it becomes habit rather than negotiation. For Sabqi and Manzil, simply knowing that someone will listen is often enough to keep a child honest about doing the work.",
          "Encourage without adding pressure. Celebrate milestones, a completed page, a fluent Manzil cycle, a difficult verse finally stable, and treat rough days as normal rather than failures. Never compare your child with another family\u2019s child; memorization journeys differ widely, and comparison poisons motivation. If progress stalls for more than a couple of weeks, talk to the teacher rather than increasing pressure at home. The solution is usually an adjustment to the routine, not more force.",
        ],
      },
      {
        heading: "Frequently asked questions",
        paragraphs: [
          "Q: My child keeps forgetting old surahs. Is Manzil the fix?",
          "A: Yes, that is exactly what Manzil is for. Forgetting old portions is the normal result of memorizing without a revision cycle, not a sign of a poor memory. Once a steady Manzil routine is in place, with old portions recited on rotation, you should see retention stabilize within a few weeks.",
          "Q: How much new memorization happens in a single class?",
          "A: It depends on the child\u2019s capacity and stage. The teacher assigns an amount the child can genuinely secure, which matters more than the size of the portion. A small Sabaq that is recited flawlessly is worth more than a large one that falls apart the next day.",
          "Q: Should my child revise on days with no class?",
          "A: Yes. Memorization is a daily discipline, and the days without class are when Sabqi and Manzil matter most. Even twenty minutes of revision on off days keeps everything the class built from slipping.",
          "Q: What if my child struggles with the new lesson?",
          "A: Struggle is part of learning, and a good teacher will notice it before you do. The usual response is to reduce the new portion temporarily and strengthen revision, not to push harder. If difficulty persists, the teacher will discuss it with you and adjust the plan.",
          "Q: Can adults follow the same Sabaq, Sabqi, and Manzil routine?",
          "A: Absolutely. The routine is about how memory works, not about age, and adult students in the Hifz program follow the same three-part structure. Adults often bring stronger discipline to revision, which is a genuine advantage.",
        ],
        links: [{ label: "Contact our admissions team", route: "/contact" }],
      },
    ],
  },
  {
    title: "Starting Quran as an Adult Absolute Beginner",
    slug: "starting-quran-as-an-adult-absolute-beginner",
    metaDescription: "Starting Quran as an adult beginner? A calm guide to the first weeks: the alphabet, private 1-to-1 lessons, free trial placement, and realistic expectations.",
    summary: "A calm, practical guide for adults starting the Quran from zero: what the first weeks cover, how private lessons and free trial placement work, and how to fit learning around a busy life.",
    category: "Getting Started",
    intendedAudience: "Adult beginners",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: "2026-10-17",
    updatedDate: "2026-10-17",
    draft: false,
    relatedProgramRoutes: ["/adult-quran-classes"],
    introduction: "Many adults want to learn the Quran but feel they have left it too late. The truth is simpler: adults begin all the time, and they often learn well, because a private teacher can shape each lesson around your pace and your life. This guide explains what the first weeks look like, how the free trial placement works for adults, and how to fit 30-minute classes around work and family.",
    sections: [
      {
        heading: "Starting late is more normal than you think",
        paragraphs: [
          "If you are an adult who cannot yet read the Quran, you are far from alone. Adults in their twenties, thirties, forties, and beyond decide to begin every year. Some were busy when they were younger. Some are new Muslims finding their footing. Some simply want to read in their daily prayers with understanding instead of guessing. Whatever your reason, the starting line is the same, and it is a well-travelled one.",
          "Adults also bring something children do not: clear motivation. You are not being sent to class by a parent. You chose this, which means you will pay attention, ask questions, and practise between lessons. Teachers consistently find that motivated adult beginners progress steadily, because every minute of class time is used with intention.",
          "There is also no audience. In a private one-to-one class, there is no classroom of faster students to compare yourself with. Your teacher has taught absolute beginners before and expects exactly where you are. The only person you are measured against is yourself, one week ago.",
          "It helps to let go of the idea that learning the Quran belongs to childhood. The Quran was revealed to adults, and for most of Islamic history, adults have been its students. Beginning now does not mean you are behind. It means you are beginning, which is the only step that matters.",
        ],
      },
      {
        heading: "What the first weeks actually look like",
        paragraphs: [
          "The first lessons start with the Arabic alphabet: the names of the letters, how each one sounds, and how each one is written. Arabic letters change shape depending on where they sit in a word, so your teacher will show you each letter on its own first, then at the beginning, middle, and end of words. Nothing is rushed. A few letters at a time, read aloud and repeated until they feel familiar, is the normal pace.",
          "Once the alphabet is comfortable, letters begin to join. You will practise connecting two letters, then three, reading short combinations aloud while your teacher listens and corrects. Then come the short vowels, the small marks above and below letters that tell you whether to say 'a', 'i', or 'u'. This is the moment reading starts to click, because words you once saw as shapes begin to carry sound.",
          "There is no memorisation pressure in these early weeks. The goal is recognition and correct pronunciation, built slowly and checked constantly. Your teacher will not move on until each step is firm, and because the class is private, there is no need to pretend you understood something you did not. Saying 'can we go over that again' is not a failure. It is how the learning works.",
          "Within these foundations, correct pronunciation is built in from the very first lesson. Your teacher will show you where each sound comes from and correct you gently until it sits naturally. Later, these same corrections become the formal rules of Tajweed, but at the start they are simply part of learning to read properly.",
        ],
      },
      {
        heading: "Private lessons remove the hardest part: embarrassment",
        paragraphs: [
          "Ask adult beginners what held them back, and the most common answer is embarrassment. Mispronouncing a letter in front of others feels exposing, and many adults would rather not begin than risk looking foolish. A private one-to-one class removes this completely. It is just you and your teacher, and your teacher's entire job is to hear your mistakes and fix them kindly.",
          "A good teacher expects mispronunciation. It is the raw material of the work, not a disappointment. When a sound comes out wrong, your teacher will show you what to adjust, have you try again, and keep going until it is right. There is no sighing, no rushing past, and no moving on while you are still unsure. Adults who feared the first lesson often say afterwards that it felt easier than they expected.",
          "The pace is also yours. If work is heavy one week, the lesson meets you where you are. If something finally clicks, the teacher builds on it immediately. Questions are welcome at any point, including the ones you think sound basic. In our experience, the 'basic' questions are usually the most important ones.",
        ],
        links: [
          { label: "Adult Quran Classes", route: "/adult-quran-classes" },
          { label: "Why choose Tajweed Scholars", route: "/why-choose-us" },
        ],
      },
      {
        heading: "How the free trial works for adults",
        paragraphs: [
          "Every new learner begins with three free trial classes, and no payment details are collected to book them. The trial exists so you can experience real teaching before making any decision, and so the academy can understand exactly where you are starting from.",
          "The first trial class includes your placement assessment, done live during a real mini-lesson. Even if you cannot read a single letter, that is useful information: it tells your teacher precisely where to begin. There is no separate test beforehand and nothing to prepare. You simply show up, and the teacher takes it from there.",
          "The second trial class is a full lesson at your confirmed level. The third includes a final lesson, a short recap of your progress, and a clear recommendation for what comes next. Pricing and enrolment are discussed separately with the admissions team afterwards, never during a class. If you decide not to continue, the trial costs you nothing.",
        ],
        links: [
          { label: "Book 3 Free Trial Classes", route: "/free-trial" },
          { label: "Contact our admissions team", route: "/contact" },
        ],
      },
      {
        heading: "Fitting 30-minute classes around work and family",
        paragraphs: [
          "Thirty minutes is short on purpose. It fits before work, after the children are in bed, or in a quiet gap in the day, and it is long enough for real progress when the teaching is one-to-one. Most adult learners take two or three classes a week, though one is a perfectly respectable start. Consistency matters far more than long sessions.",
          "Classes take place live on Zoom, so a quiet room, a stable internet connection, and your full attention are the only equipment you need. Choose a regular weekly slot and protect it the way you would any appointment. Between classes, even ten minutes of daily revision, reading aloud what you covered, will move you forward faster than a single long weekend session.",
          "Progress with steady practice is exactly that: steady. Some weeks a letter finally clicks. Some weeks feel flat. Both are normal, and your teacher will keep a clear record of where you are so that no lesson ever starts from scratch. You can see the current plans on our pricing page, and your teacher and the admissions team will help you choose a frequency that fits your life, not the other way around.",
        ],
        links: [
          { label: "View pricing plans", route: "/pricing" },
          { label: "Book 3 Free Trial Classes", route: "/free-trial" },
        ],
      },
      {
        heading: "Frequently asked questions",
        paragraphs: [
          "Q: Am I too old to start learning the Quran?",
          "A: No. Adults of all ages begin, and motivation counts for more than age. A private teacher adapts every lesson to your pace, so there is no keeping up with anyone else.",
          "Q: I cannot read a single Arabic letter. Is that really okay?",
          "A: Yes. Absolute beginners are one of the most common starting points. Your first trial class includes a placement assessment, and if your starting point is zero, your teacher will begin exactly there.",
          "Q: How long will it take before I can read?",
          "A: That depends on your pace, frequency, and practice between classes, so no honest teacher will promise a fixed timeline. What is certain is that steady, short practice with a teacher who corrects you each lesson produces steady progress.",
          "Q: Do I need to buy any books or materials?",
          "A: No. Your teacher will guide you through everything in class. Later on, having your own copy of the Quran to read from is helpful, and your teacher will advise when the time is right.",
          "Q: What happens if I need to miss a class?",
          "A: Life happens. Message the admissions team and they will help you reschedule. Keeping a consistent rhythm matters, and the team will work with you to protect it.",
        ],
      },
    ],
  },
  {title: "What Verified Sanad/Ijazah Means When Choosing a Teacher",
    slug: "what-verified-sanad-ijazah-means-when-choosing-a-teacher",
    metaDescription: "What do Sanad and Ijazah mean? A plain-English guide to verified Quran teacher credentials, what to ask any academy before enrolling, and red flags to avoid.",
    summary: "A plain-English explanation of Sanad and Ijazah, what teacher verification should involve, the questions to ask any academy, and the red flags to avoid.",
    category: "Teacher Standards",
    intendedAudience: "Prospective learners and parents",
    authorName: "Tajweed Scholars Editorial Team",
    publishedDate: "2026-10-17",
    updatedDate: "2026-10-17",
    draft: false,
    relatedProgramRoutes: ["/why-choose-us"],
    introduction: "When you choose a Quran teacher, you are trusting someone with the accuracy of your recitation or your child's. Two words appear again and again in this decision: Sanad and Ijazah. This guide explains both in plain English, describes what 'verified' should mean in practice, and lists the questions worth asking any academy before you enroll.",
    sections: [
      {
        heading: "What a Sanad is",
        paragraphs: [
          "A Sanad is a chain of transmission. It is the record of who taught whom, link by link, going back through generations of teachers. When a teacher holds a Sanad, it means they did not learn the Quran's recitation from a book alone. They learned it by reciting to a teacher, who learned it by reciting to a teacher before them, in an unbroken chain.",
          "This matters because the Quran was preserved through recitation, not only through writing. The written text tells you which words to say. The living chain tells you exactly how to say them: the sounds, the pauses, the melody of the recitation as it has been passed down. A Sanad is how that living transmission is documented and protected.",
          "Think of it as a record of continuity. Each link in the chain was checked by the one before it. When the chain is unbroken, the recitation you learn today is connected, teacher to teacher, to the earliest generations. That is what the word Sanad points to: a supported, traceable path of learning.",
        ],
      },
      {
        heading: "What an Ijazah is",
        paragraphs: [
          "An Ijazah is an authorization to teach. It is granted by a teacher to a student when the student has recited the entire Quran to that teacher, from beginning to end, with precision. The teacher listens, corrects, and requires the student to repeat passages until every sound is right. Only when the recitation meets the standard is the Ijazah given.",
          "The word itself means permission. It says: this person has mastered the recitation under my supervision, and I permit them to teach it to others. It is not a participation certificate. It is the result of a long, careful examination conducted one recitation at a time.",
          "An Ijazah carries responsibility as much as honor. The one who grants it is staking their own name on the student's accuracy, and the one who receives it becomes a link in the chain for the next generation. This is why serious students of the Quran treat the Ijazah as the foundation of a teacher's credibility.",
        ],
      },
      {
        heading: "Why it matters for your recitation",
        paragraphs: [
          "Arabic is a precise language. Letters that look similar to a beginner can sound quite different, and small differences in pronunciation can change the shape of a word. These distinctions cannot be learned reliably from transliteration or from recordings alone. They are learned the way they have always been learned: by reciting to someone who hears the difference and corrects you.",
          "A teacher with an Ijazah learned those distinctions from a teacher who learned them from a teacher before them. When such a teacher corrects your pronunciation, the correction comes from inside that chain, not from personal opinion. This is the practical value of the Sanad system: it keeps recitation anchored to transmitted knowledge rather than guesswork.",
          "The alternative is worth considering honestly. A well-meaning teacher without this training may pass on their own small errors without knowing it, and students tend to keep whatever they learn first. Correcting a mispronounced letter after years of practice is far harder than learning it correctly at the start. Choosing a teacher with verified credentials is how you avoid that cost.",
        ],
      },
      {
        heading: "What 'verified' should mean in practice",
        paragraphs: [
          "Any academy can say its teachers are qualified. The word 'verified' should mean the academy actually checked, before the teacher ever met a student. In practice, that means asking who granted the teacher's Ijazah, reviewing the teacher's credentials, listening to the teacher recite, and observing a demo lesson to confirm they can actually teach, not just recite.",
          "Verification is the academy's job, not the parent's. You should not need to become an expert in chains of transmission to enroll your child. A serious academy treats vetting as an internal standard: no teacher is assigned until their credentials have been examined and their teaching observed. If an academy cannot describe its vetting process in plain language, that is worth noticing.",
          "At Tajweed Scholars, this standard is structural. The founder holds a complete verified Sanad, and every teacher's Sanad and Ijazah are verified before they are assigned to any student. Credentials are a precondition of teaching here, not a marketing line added afterwards.",
        ],
        links: [
          { label: "Why choose Tajweed Scholars", route: "/why-choose-us" },
        ],
      },
      {
        heading: "Questions worth asking any academy",
        paragraphs: [
          "You do not need to interrogate anyone. But a few calm questions will tell you a great deal about how an academy treats teacher quality. First: how are your teachers vetted before they teach? Listen for a process, not just adjectives. 'We check every teacher's Ijazah, listen to them recite, and observe a demo lesson' is a process. 'We have highly qualified teachers' is not.",
          "Second: do your teachers hold Ijazah, and is it verified before assignment? Third: what happens if I am not happy with my teacher's teaching? A confident academy will have a clear answer, usually involving a straightforward teacher change. Fourth: who supervises teaching quality after enrolment? Good academies keep watching after the first lesson.",
          "Notice how the academy responds to the questions themselves. Clear, unhurried answers suggest a real system behind them. Evasion, irritation, or answers that dissolve into slogans suggest the opposite. You are entrusting someone with your child's recitation. Careful questions are not rude. They are responsible.",
        ],
        links: [
          { label: "Contact our admissions team", route: "/contact" },
          { label: "Book 3 Free Trial Classes", route: "/free-trial" },
        ],
      },
      {
        heading: "Red flags to watch for",
        paragraphs: [
          "The clearest red flag is a teacher who cannot describe their own training. Someone who genuinely studied the Quran with a teacher remembers the experience in detail. Vague answers about qualifications, or credentials that cannot be explained in simple terms, deserve scepticism.",
          "Watch for academies that lean entirely on adjectives: 'expert', 'certified', 'professional', with no account of what was checked or by whom. Also be cautious of pressure. A genuine academy with verified teachers does not need to rush your decision. High-pressure enrolment tactics and teacher quality rarely travel together.",
          "Finally, trust the trial. Three free trial classes are not only a chance to experience the teaching. They are a chance to observe it. Listen to how the teacher corrects, how patiently they explain, and whether the lesson feels structured. Credentials open the door. The teaching itself is what you are choosing.",
        ],
        links: [
          { label: "Book 3 Free Trial Classes", route: "/free-trial" },
        ],
      },
      {
        heading: "Frequently asked questions",
        paragraphs: [
          "Q: Does every Quran teacher need an Ijazah?",
          "A: For teaching recitation with accuracy, it is the recognized standard. An Ijazah shows the teacher's own recitation was tested, from beginning to end, by a qualified teacher. Academies that take quality seriously treat it as a precondition.",
          "Q: Is an Ijazah the same as a university degree?",
          "A: No, they are different things. A degree is an academic qualification. An Ijazah is an authorization rooted in direct transmission: the student recited to the teacher, and the teacher permitted them to teach. Both have value, but only the Ijazah speaks to recitation accuracy.",
          "Q: How does Tajweed Scholars verify its teachers?",
          "A: The founder holds a complete verified Sanad, and every teacher's Sanad and Ijazah are verified before they are assigned to a student. Verification includes reviewing credentials and observing teaching, so the check covers both knowledge and the ability to teach it.",
          "Q: Can I ask about my own teacher's background?",
          "A: Yes, and you should feel free to. Contact the admissions team with any questions about your teacher's training. A serious academy welcomes the question.",
          "Q: Does holding an Ijazah guarantee a great teacher?",
          "A: It guarantees tested recitation, which is essential, but teaching is also a skill. Patience, clarity, punctuality, and the ability to explain simply all matter. That is why verification should include observing a demo lesson, not just checking a certificate.",
        ],
      },
    ],
  },
];

export const PUBLISHED_RESOURCES = RESOURCE_RECORDS.filter((resource): resource is PublishedResource => !resource.draft);
export const DRAFT_RESOURCES = RESOURCE_RECORDS.filter((resource): resource is DraftResource => resource.draft);
export const resourceRoute = (resource: Pick<ResourceRecord, "slug">) => `/resources/${resource.slug}`;

export const resourceFaqPairs = (resource: PublishedResource): Array<readonly [question: string, answer: string]> => {
  const section = resource.sections.find((candidate) => candidate.heading === "Frequently asked questions");
  if (!section) return [];
  const pairs: Array<readonly [string, string]> = [];
  for (let index = 0; index + 1 < section.paragraphs.length; index += 2) {
    const question = section.paragraphs[index];
    const answer = section.paragraphs[index + 1];
    if (question.startsWith("Q: ") && answer.startsWith("A: ")) {
      pairs.push([question.slice(3), answer.slice(3)] as const);
    }
  }
  return pairs;
};
export const publishedResourceForPath = (path: string) => PUBLISHED_RESOURCES.find((resource) => resourceRoute(resource) === path);
