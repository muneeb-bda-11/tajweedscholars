export type LearnerType = "My child" | "Myself";
export type AgeGroup = "4–6" | "7–9" | "10–12" | "13–15" | "16–17" | "Adult";
export type MainGoal = "Learn Qaida" | "Improve Quran reading" | "Tajweed correction" | "Hifz" | "Not sure yet";
export type PreferredDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type PreferredTime = "Morning" | "Afternoon" | "Evening";

export interface TrialSubmissionPayload {
  learner: { type: LearnerType; ageGroup: AgeGroup; mainGoal: MainGoal };
  contact: { name: string; guardianName?: string; whatsappNumber: string; email: string; country: string; timeZone: string };
  availability: { preferredDays: PreferredDay[]; preferredTime: PreferredTime; note?: string };
  consent: true;
  source: "Website / Free Trial Form";
}

/** Connect the approved lead API here. This function must never silently discard production data. */
export async function submitTrialRequest(_payload: TrialSubmissionPayload): Promise<{ status: "development" }> {
  const isDevelopment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;
  if (isDevelopment) return { status: "development" };
  throw new Error("Lead submission service is not connected yet.");
}
