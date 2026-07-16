import type { AgeGroup, LearnerType, MainGoal, PreferredDay, PreferredTime } from "../shared/trialOptions";
export type { AgeGroup, LearnerType, MainGoal, PreferredDay, PreferredTime } from "../shared/trialOptions";

export interface TrialSubmissionPayload {
  learnerType: LearnerType; ageGroup: AgeGroup; mainGoal: MainGoal; contactName: string; guardianName: string;
  countryCode: string; countryName: string; region: string; timeZone: string; whatsapp: string; email: string;
  preferredDays: PreferredDay[]; preferredTime: PreferredTime; notes: string; consent: true;
  submissionId: string; honeypot: string; formStartedAt: number;
}
export interface TrialSubmissionSuccess { ok: true; leadId: string; message: string }
type ErrorResponse = { ok: false; code?: string; message?: string; fieldErrors?: Record<string, string> };

export class TrialSubmissionError extends Error {
  fieldErrors: Record<string, string>;
  constructor(message: string, fieldErrors: Record<string, string> = {}) { super(message); this.name = "TrialSubmissionError"; this.fieldErrors = fieldErrors; }
}

export async function submitTrialRequest(payload: TrialSubmissionPayload): Promise<TrialSubmissionSuccess> {
  let response: Response;
  try { response = await fetch("/api/trial-leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
  catch { throw new TrialSubmissionError("We could not submit your request. Please try again or contact us through WhatsApp."); }
  let result: TrialSubmissionSuccess | ErrorResponse;
  try { result = await response.json() as TrialSubmissionSuccess | ErrorResponse; }
  catch { throw new TrialSubmissionError("We could not submit your request. Please try again or contact us through WhatsApp."); }
  if (!response.ok || !result.ok) { const error = result as ErrorResponse; throw new TrialSubmissionError(error.message || "Please correct the highlighted fields and try again.", error.fieldErrors); }
  return result;
}
