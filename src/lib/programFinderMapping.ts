import type { AgeGroup, LearnerType, MainGoal } from "../shared/trialOptions";

export type FinderAudience = "child" | "adult" | "advanced";
export const CHILD_AGES: readonly AgeGroup[] = ["4-6", "7-9", "10-12", "13-15", "16-17", "adult"];
export type FinderRecommendation = { title: string; explanation: string; route?: string; learnerType: LearnerType; ageGroup: AgeGroup; mainGoal: MainGoal; focus?: "both" };

export function programFinderRecommendation(audience: FinderAudience, answer: string): FinderRecommendation {
  if (audience === "child") {
    const ageGroup = CHILD_AGES.includes(answer as AgeGroup) ? answer as AgeGroup : "4-6";
    if (ageGroup === "16-17") return { title: "Private teen placement", explanation: "Trial 1 confirms the best private pathway for a learner aged 16–17.", learnerType: "child", ageGroup, mainGoal: "unsure" };
    if (ageGroup === "adult") return { title: "Adult Quran Classes", explanation: "A private adult pathway suited to the learner’s current level and goal.", route: "/adult-quran-classes", learnerType: "child", ageGroup, mainGoal: "unsure" };
    return { title: "Kids Quran Classes", explanation: "Age-aware private learning for children ages 4–15, confirmed during Trial 1.", route: "/kids-quran-classes", learnerType: "child", ageGroup, mainGoal: "unsure" };
  }
  if (audience === "adult") {
    const goals: Record<string, MainGoal> = { beginner: "qaida", reading: "quran-reading", tajweed: "tajweed", hifz: "hifz" };
    const mainGoal = goals[answer] || "unsure";
    const route = mainGoal === "tajweed" ? "/tajweed-course" : mainGoal === "hifz" ? "/hifz-program" : "/adult-quran-classes";
    const title = mainGoal === "tajweed" ? "Tajweed Course" : mainGoal === "hifz" ? "Hifz Program" : "Adult Quran Classes";
    return { title, explanation: "A private adult pathway matched to your selected learning goal.", route, learnerType: "self", ageGroup: "adult", mainGoal };
  }
  if (answer === "both") return { title: "Hifz with Tajweed support", explanation: "Hifz is the main goal, with Tajweed correction built into the placement plan.", route: "/hifz-program", learnerType: "self", ageGroup: "adult", mainGoal: "hifz", focus: "both" };
  const hifz = answer === "hifz";
  return { title: hifz ? "Hifz Program" : "Tajweed Course", explanation: hifz ? "A structured memorization and revision pathway." : "Focused recitation correction through guided practice.", route: hifz ? "/hifz-program" : "/tajweed-course", learnerType: "self", ageGroup: "adult", mainGoal: hifz ? "hifz" : "tajweed" };
}

export const programFinderPrefill = (audience: FinderAudience, answer: string) => { const { learnerType, ageGroup, mainGoal } = programFinderRecommendation(audience, answer); return { learnerType, ageGroup, mainGoal }; };
export function programFinderQuery(audience: FinderAudience, answer: string) { const r = programFinderRecommendation(audience, answer); return new URLSearchParams({ learnerType: r.learnerType, ageGroup: r.ageGroup, mainGoal: r.mainGoal, recommendedProgram: r.title, ...(r.focus ? { focus: r.focus } : {}) }).toString(); }
