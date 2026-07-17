import { isPossiblePhoneNumber } from "react-phone-number-input";
import { CANONICAL_VALUES, requiresGuardian, type AgeGroup, type LearnerType, type MainGoal, type PreferredDay, type PreferredTime } from "../shared/trialOptions";
import type { TrialSubmissionPayload } from "./trialSubmission";

export type TrialFormData = { learnerType: LearnerType | ""; ageGroup: AgeGroup | ""; mainGoal: MainGoal | ""; contactName: string; guardianName: string; countryCode: string; countryName: string; region: string; timeZone: string; whatsapp: string; email: string; preferredDays: PreferredDay[]; preferredTime: PreferredTime | ""; notes: string; consent: boolean };
export type TrialSubmissionMeta = { submissionId: string; honeypot: string; formStartedAt: number };
export type TrialField = keyof TrialFormData;
export type TrialErrors = Partial<Record<TrialField, string>>;

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validZone = (value: string) => { try { new Intl.DateTimeFormat(undefined, { timeZone: value }).format(); return true; } catch { return false; } };

export function validateTrialForm(data: TrialFormData, scope: 1 | 2 | 3 | "all"): TrialErrors {
  const errors: TrialErrors = {}, check = (step: number) => scope === "all" || scope === step;
  if (check(1)) {
    if (!CANONICAL_VALUES.learnerType.includes(data.learnerType as never)) errors.learnerType = "Choose who is learning.";
    if (!CANONICAL_VALUES.ageGroup.includes(data.ageGroup as never) || (data.learnerType === "child" && data.ageGroup === "adult")) errors.ageGroup = "Choose a valid age group.";
    if (!CANONICAL_VALUES.mainGoal.includes(data.mainGoal as never)) errors.mainGoal = "Choose the main goal.";
  }
  if (check(2)) {
    if (!data.contactName.trim()) errors.contactName = data.learnerType === "child" ? "Enter the learner's name." : "Enter your name.";
    if (requiresGuardian(data.ageGroup) && !data.guardianName.trim()) errors.guardianName = "Enter a parent or guardian name.";
    else if (data.guardianName.trim().length > 120) errors.guardianName = "Guardian name must be 120 characters or fewer.";
    if (!data.countryCode) errors.countryName = "Choose a country from the list.";
    if (!data.timeZone.trim() || !validZone(data.timeZone.trim())) errors.timeZone = "Enter a valid IANA time zone.";
    if (!data.whatsapp || !data.whatsapp.startsWith("+") || data.whatsapp.length > 16 || !isPossiblePhoneNumber(data.whatsapp)) errors.whatsapp = "Enter a possible international phone number.";
    if (!validEmail(data.email.trim().toLowerCase())) errors.email = "Enter a valid email address.";
  }
  if (check(3)) {
    if (!data.preferredDays.length) errors.preferredDays = "Choose at least one preferred day.";
    if (!data.preferredTime) errors.preferredTime = "Choose a preferred time.";
    if (data.notes.length > 1000) errors.notes = "Notes must be 1000 characters or fewer.";
    if (!data.consent) errors.consent = "Consent is required.";
  }
  return errors;
}

export function buildTrialSubmissionPayload(data: TrialFormData, meta: TrialSubmissionMeta): TrialSubmissionPayload {
  return { learnerType: data.learnerType as LearnerType, ageGroup: data.ageGroup as AgeGroup, mainGoal: data.mainGoal as MainGoal, contactName: data.contactName.trim(), guardianName: requiresGuardian(data.ageGroup) ? data.guardianName.trim() : "", countryCode: data.countryCode, countryName: data.countryName.trim(), region: data.region.trim(), timeZone: data.timeZone.trim(), whatsapp: data.whatsapp, email: data.email.trim().toLowerCase(), preferredDays: [...data.preferredDays], preferredTime: data.preferredTime as PreferredTime, notes: data.notes.trim(), consent: true, submissionId: meta.submissionId, honeypot: meta.honeypot, formStartedAt: meta.formStartedAt };
}

export const withLearnerType = (data: TrialFormData, learnerType: LearnerType): TrialFormData => ({ ...data, learnerType, ageGroup: learnerType === "child" && data.ageGroup === "adult" ? "" : data.ageGroup });
export const nextLearnerData = (data: TrialFormData): TrialFormData => ({ learnerType: "", ageGroup: "", mainGoal: "", contactName: data.contactName, guardianName: data.guardianName, countryCode: data.countryCode, countryName: data.countryName, region: data.region, timeZone: data.timeZone, whatsapp: data.whatsapp, email: data.email, preferredDays: [], preferredTime: "", notes: "", consent: data.consent });

export const stepForField = (field?: string): 1 | 2 | 3 => field && ["learnerType", "ageGroup", "mainGoal"].includes(field) ? 1 : field && ["contactName", "guardianName", "countryName", "region", "timeZone", "whatsapp", "email"].includes(field) ? 2 : 3;
