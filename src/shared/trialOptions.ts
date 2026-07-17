export const LEARNER_TYPE_OPTIONS = [{ value: "child", label: "My child" }, { value: "self", label: "Myself" }] as const;
export const AGE_GROUP_OPTIONS = [{ value: "4-6", label: "4–6" }, { value: "7-9", label: "7–9" }, { value: "10-12", label: "10–12" }, { value: "13-15", label: "13–15" }, { value: "16-17", label: "16–17" }, { value: "adult", label: "Adult" }] as const;
export const MAIN_GOAL_OPTIONS = [{ value: "qaida", label: "Start with Qaida" }, { value: "quran-reading", label: "Improve Quran reading" }, { value: "tajweed", label: "Improve Tajweed & pronunciation" }, { value: "hifz", label: "Hifz / Quran memorization" }, { value: "unsure", label: "Not sure — help me choose" }] as const;
export const PREFERRED_DAY_OPTIONS = [{ value: "monday", label: "Monday" }, { value: "tuesday", label: "Tuesday" }, { value: "wednesday", label: "Wednesday" }, { value: "thursday", label: "Thursday" }, { value: "friday", label: "Friday" }, { value: "saturday", label: "Saturday" }, { value: "sunday", label: "Sunday" }] as const;
export const PREFERRED_TIME_OPTIONS = [{ value: "morning", label: "Morning" }, { value: "afternoon", label: "Afternoon" }, { value: "evening", label: "Evening" }] as const;

type OptionValue<T extends readonly { value: string }[]> = T[number]["value"];
export type LearnerType = OptionValue<typeof LEARNER_TYPE_OPTIONS>;
export type AgeGroup = OptionValue<typeof AGE_GROUP_OPTIONS>;
export type MainGoal = OptionValue<typeof MAIN_GOAL_OPTIONS>;
export type PreferredDay = OptionValue<typeof PREFERRED_DAY_OPTIONS>;
export type PreferredTime = OptionValue<typeof PREFERRED_TIME_OPTIONS>;

export const CANONICAL_VALUES = {
  learnerType: LEARNER_TYPE_OPTIONS.map(({ value }) => value), ageGroup: AGE_GROUP_OPTIONS.map(({ value }) => value),
  mainGoal: MAIN_GOAL_OPTIONS.map(({ value }) => value), preferredDays: PREFERRED_DAY_OPTIONS.map(({ value }) => value),
  preferredTime: PREFERRED_TIME_OPTIONS.map(({ value }) => value)
} as const;
export const UNDER_18_AGE_GROUPS: readonly AgeGroup[] = ["4-6", "7-9", "10-12", "13-15", "16-17"];
export const requiresGuardian = (ageGroup: AgeGroup | "" | unknown): boolean => UNDER_18_AGE_GROUPS.includes(ageGroup as AgeGroup);
