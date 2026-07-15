import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { AgeGroup, LearnerType, MainGoal, PreferredDay, PreferredTime, submitTrialRequest, TrialSubmissionPayload } from "../lib/trialSubmission";

type FormData = { learnerType: LearnerType | ""; ageGroup: AgeGroup | ""; mainGoal: MainGoal | ""; contactName: string; guardianName: string; whatsappNumber: string; email: string; country: string; timeZone: string; preferredDays: PreferredDay[]; preferredTime: PreferredTime | ""; note: string; consent: boolean };
type Field = keyof FormData;
type Errors = Partial<Record<Field, string>>;
const ageGroups: AgeGroup[] = ["4–6", "7–9", "10–12", "13–15", "16–17", "Adult"];
const goals: MainGoal[] = ["Learn Qaida", "Improve Quran reading", "Tajweed correction", "Hifz", "Not sure yet"];
const days: PreferredDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const times: PreferredTime[] = ["Morning", "Afternoon", "Evening"];
const initial: FormData = { learnerType: "", ageGroup: "", mainGoal: "", contactName: "", guardianName: "", whatsappNumber: "", email: "", country: "", timeZone: "", preferredDays: [], preferredTime: "", note: "", consent: false };

function safePrefill(): Partial<FormData> {
  const query = window.location.hash.split("?")[1]; if (!query) return {};
  const params = new URLSearchParams(query); const result: Partial<FormData> = {};
  const learners: Record<string, LearnerType> = { "My Child": "My child", "My child": "My child", Myself: "Myself" };
  const ages: Record<string, AgeGroup> = { "4–5": "4–6", "4–6": "4–6", "6–8": "7–9", "7–9": "7–9", "9–12": "10–12", "10–12": "10–12", "13–15": "13–15", "16–17": "16–17", Adult: "Adult" };
  const goalValues: Record<string, MainGoal> = { "Learn from the beginning": "Learn Qaida", "Learn Qaida": "Learn Qaida", "Improve Quran reading": "Improve Quran reading", "Improve Tajweed": "Tajweed correction", "Tajweed correction": "Tajweed correction", "Memorize Quran": "Hifz", Hifz: "Hifz", "Not sure yet": "Not sure yet" };
  const programs: Record<string, MainGoal> = { "Kids Quran Classes": "Not sure yet", "Adult Quran Classes": "Not sure yet", "Tajweed Course": "Tajweed correction", "Hifz Program": "Hifz" };
  const learner = params.get("learnerType"), age = params.get("ageGroup"), goal = params.get("goal"), program = params.get("recommendedProgram");
  if (learner && learners[learner]) result.learnerType = learners[learner];
  if (age && ages[age]) result.ageGroup = ages[age];
  if (goal && goalValues[goal]) result.mainGoal = goalValues[goal]; else if (program && programs[program]) result.mainGoal = programs[program];
  if (result.learnerType === "My child" && result.ageGroup === "Adult") delete result.ageGroup;
  if (result.learnerType === "Myself" && result.ageGroup && !["16–17", "Adult"].includes(result.ageGroup)) delete result.ageGroup;
  return result;
}

const isValidTimeZone = (value: string) => {
  try { new Intl.DateTimeFormat(undefined, { timeZone: value }).format(); return true; } catch { return false; }
};

const ErrorText = ({ field, errors }: { field: Field; errors: Errors }) => errors[field] ? <p id={`${field}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-700"><Icon name="AlertCircle" size={14} />{errors[field]}</p> : null;

export const TrialForm: React.FC = () => {
  const [step, setStep] = useState(1); const [data, setData] = useState<FormData>(initial); const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "development" | "error">("idle"); const [message, setMessage] = useState(""); const headingRef = useRef<HTMLHeadingElement>(null);
  const isMinor = data.ageGroup !== "" && data.ageGroup !== "Adult";
  useEffect(() => { let zone = ""; try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* Manual entry remains available. */ } setData((value) => ({ ...value, ...safePrefill(), timeZone: zone })); }, []);
  const update = <K extends Field>(field: K, value: FormData[K]) => { setData((current) => ({ ...current, [field]: value })); if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined })); };
  const updateLearnerType = (value: LearnerType) => { setData((current) => ({ ...current, learnerType: value, ageGroup: value === "My child" && current.ageGroup === "Adult" || value === "Myself" && current.ageGroup !== "" && !["16–17", "Adult"].includes(current.ageGroup) ? "" : current.ageGroup })); setErrors((current) => ({ ...current, learnerType: undefined, ageGroup: undefined })); };
  const updateAgeGroup = (value: AgeGroup) => { setData((current) => ({ ...current, ageGroup: value, learnerType: value === "Adult" && current.learnerType === "My child" ? "" : current.learnerType })); setErrors((current) => ({ ...current, ageGroup: undefined, learnerType: value === "Adult" ? undefined : current.learnerType, guardianName: value === "Adult" ? undefined : current.guardianName })); };
  const validate = (target: number): Errors => { const next: Errors = {};
    if (target === 1) { if (!data.learnerType) next.learnerType = "Choose who is learning."; if (!data.ageGroup) next.ageGroup = "Choose an age group."; if (!data.mainGoal) next.mainGoal = "Choose the main learning goal."; }
    if (target === 2) { if (!data.contactName.trim()) next.contactName = "Enter the parent or learner name."; if (isMinor && !data.guardianName.trim()) next.guardianName = "Enter a parent or guardian name for a learner under 18."; if (!data.whatsappNumber.trim()) next.whatsappNumber = "Enter a WhatsApp number."; else if (!/^\+?[0-9\s()-]{7,20}$/.test(data.whatsappNumber.trim())) next.whatsappNumber = "Enter a valid number with country code."; if (!data.email.trim()) next.email = "Enter an email address."; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = "Enter a valid email address."; if (!data.country.trim()) next.country = "Enter the learner’s country."; if (!data.timeZone.trim()) next.timeZone = "Enter the learner’s time zone."; else if (!isValidTimeZone(data.timeZone.trim())) next.timeZone = "Enter a valid IANA time zone, such as Europe/London."; }
    if (target === 3) { if (!data.preferredDays.length) next.preferredDays = "Choose at least one preferred day."; if (!data.preferredTime) next.preferredTime = "Choose a preferred general time."; if (!data.consent) next.consent = "Consent is required so we may contact you about the trials."; } return next; };
  const reveal = (element: HTMLElement | null) => { if (!element) return; element.focus({ preventScroll: true }); element.scrollIntoView({ block: "center" }); };
  const showErrors = (next: Errors) => { setErrors(next); requestAnimationFrame(() => reveal(document.getElementById(Object.keys(next)[0]))); };
  const showStep = (nextStep: number) => { setStep(nextStep); setErrors({}); requestAnimationFrame(() => reveal(headingRef.current)); };
  const nextStep = () => { const next = validate(step); if (Object.keys(next).length) { showErrors(next); return; } showStep(step + 1); };
  const toggleDay = (day: PreferredDay) => update("preferredDays", data.preferredDays.includes(day) ? data.preferredDays.filter((value) => value !== day) : [...data.preferredDays, day]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const next = validate(3); if (Object.keys(next).length) { showErrors(next); return; }
    const payload: TrialSubmissionPayload = { learner: { type: data.learnerType as LearnerType, ageGroup: data.ageGroup as AgeGroup, mainGoal: data.mainGoal as MainGoal }, contact: { name: data.contactName.trim(), ...(isMinor ? { guardianName: data.guardianName.trim() } : {}), whatsappNumber: data.whatsappNumber.trim(), email: data.email.trim(), country: data.country.trim(), timeZone: data.timeZone.trim() }, availability: { preferredDays: data.preferredDays, preferredTime: data.preferredTime as PreferredTime, ...(data.note.trim() ? { note: data.note.trim() } : {}) }, consent: true, source: "Website / Free Trial Form" };
    setStatus("submitting"); try { await submitTrialRequest(payload); setStatus("development"); setMessage("Local development validation complete. Lead submission service is not connected yet. No information was saved or transmitted."); } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "Lead submission service is not connected yet."); }
  };
  const described = (field: Field) => errors[field] ? `${field}-error` : undefined;
  const input = (field: Field) => `mt-1.5 min-h-11 w-full rounded-lg border bg-white px-3 text-sm ${errors[field] ? "border-red-500" : "border-stone-300"}`;
  const choice = (selected: boolean) => `flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-2 text-xs font-semibold sm:px-3 sm:text-sm ${selected ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-stone-300 bg-white text-stone-700"}`;
  return <div id="trial-form-container" className="mx-auto w-full max-w-[760px] rounded-2xl border border-stone-200 bg-white shadow-sm">
    <div className="sticky top-[calc(4.25rem+env(safe-area-inset-top))] z-20 rounded-t-2xl border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:top-[4.5rem] sm:px-6 lg:static"><div className="flex justify-between"><p className="text-xs font-bold text-emerald-800" aria-live="polite">Step {step} of 3</p><p className="text-xs text-stone-500">No payment information</p></div><div className="mt-2 grid grid-cols-3 gap-1" aria-hidden="true">{[1,2,3].map((value) => <span key={value} className={`h-1.5 rounded-full ${value <= step ? "bg-emerald-700" : "bg-stone-200"}`} />)}</div></div>
    <form onSubmit={submit} noValidate className="scroll-pt-[calc(8.75rem+env(safe-area-inset-top))] p-4 pb-6 sm:scroll-pt-36 sm:p-6 lg:scroll-pt-24"><h2 ref={headingRef} tabIndex={-1} className="scroll-mt-[calc(8.75rem+env(safe-area-inset-top))] text-xl font-bold text-stone-800 sm:scroll-mt-36 lg:scroll-mt-24">{step === 1 ? "About the learner" : step === 2 ? "Contact details" : "Class availability"}</h2><p className="mt-1 text-sm text-stone-600">{step === 1 ? "Help us understand the right starting point." : step === 2 ? "Tell us how to reach you to arrange the classes." : "Choose general preferences; the final time is confirmed with you."}</p>
      {step === 1 && <div className="mt-6 space-y-6">
        <fieldset><legend className="text-sm font-bold">Who is learning? *</legend><div className="mt-2 grid grid-cols-2 gap-2">{(["My child","Myself"] as LearnerType[]).map((value, index) => <label key={value} className={choice(data.learnerType === value)}><input id={index === 0 ? "learnerType" : undefined} type="radio" name="learnerType" checked={data.learnerType === value} onChange={() => updateLearnerType(value)} aria-describedby={described("learnerType")} />{value}</label>)}</div><ErrorText field="learnerType" errors={errors} /></fieldset>
        <fieldset><legend className="text-sm font-bold">Age group *</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{ageGroups.map((value, index) => <label key={value} className={choice(data.ageGroup === value)}><input id={index === 0 ? "ageGroup" : undefined} type="radio" name="ageGroup" checked={data.ageGroup === value} onChange={() => updateAgeGroup(value)} aria-describedby={described("ageGroup")} />{value}</label>)}</div><ErrorText field="ageGroup" errors={errors} /></fieldset>
        <fieldset><legend className="text-sm font-bold">Main goal *</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{goals.map((value, index) => <label key={value} className={choice(data.mainGoal === value)}><input id={index === 0 ? "mainGoal" : undefined} type="radio" name="mainGoal" checked={data.mainGoal === value} onChange={() => update("mainGoal", value)} aria-describedby={described("mainGoal")} />{value}</label>)}</div><ErrorText field="mainGoal" errors={errors} /></fieldset>
      </div>}
      {step === 2 && <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">Parent or learner name *<input id="contactName" value={data.contactName} onChange={(e) => update("contactName", e.target.value)} className={input("contactName")} aria-describedby={described("contactName")} /><ErrorText field="contactName" errors={errors} /></label>
        {isMinor && <label className="text-sm font-bold">Parent/guardian name *<input id="guardianName" value={data.guardianName} onChange={(e) => update("guardianName", e.target.value)} className={input("guardianName")} aria-describedby={described("guardianName")} /><ErrorText field="guardianName" errors={errors} /></label>}
        <label className="text-sm font-bold">WhatsApp number *<input id="whatsappNumber" type="tel" value={data.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} className={input("whatsappNumber")} placeholder="Include country code" aria-describedby={described("whatsappNumber")} /><ErrorText field="whatsappNumber" errors={errors} /></label>
        <label className="text-sm font-bold">Email address *<input id="email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} className={input("email")} aria-describedby={described("email")} /><ErrorText field="email" errors={errors} /></label>
        <label className="text-sm font-bold">Country *<input id="country" value={data.country} onChange={(e) => update("country", e.target.value)} className={input("country")} aria-describedby={described("country")} /><ErrorText field="country" errors={errors} /></label>
        <label className="text-sm font-bold">Time zone *<input id="timeZone" value={data.timeZone} onChange={(e) => update("timeZone", e.target.value)} className={input("timeZone")} placeholder="e.g. Europe/London" aria-describedby={described("timeZone")} /><ErrorText field="timeZone" errors={errors} /></label>
      </div>}
      {step === 3 && <div className="mt-6 space-y-6">
        <fieldset><legend className="text-sm font-bold">Preferred days *</legend><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{days.map((value, index) => <label key={value} className={choice(data.preferredDays.includes(value))}><input id={index === 0 ? "preferredDays" : undefined} type="checkbox" checked={data.preferredDays.includes(value)} onChange={() => toggleDay(value)} aria-describedby={described("preferredDays")} />{value}</label>)}</div><ErrorText field="preferredDays" errors={errors} /></fieldset>
        <fieldset><legend className="text-sm font-bold">Preferred general time *</legend><div className="mt-2 grid grid-cols-3 gap-2">{times.map((value, index) => <label key={value} className={choice(data.preferredTime === value)}><input id={index === 0 ? "preferredTime" : undefined} type="radio" name="preferredTime" checked={data.preferredTime === value} onChange={() => update("preferredTime", value)} aria-describedby={described("preferredTime")} />{value}</label>)}</div><p className="mt-2 text-xs leading-5 text-stone-600">The final class time will be confirmed with you based on teacher availability and your time zone.</p><ErrorText field="preferredTime" errors={errors} /></fieldset>
        <label className="block text-sm font-bold">Optional note<textarea value={data.note} onChange={(e) => update("note", e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-stone-300 p-3 text-sm font-normal" placeholder="Tell us anything that may help us arrange the trial." /></label>
        <div><label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-stone-700"><input id="consent" type="checkbox" checked={data.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-1.5 h-5 w-5 shrink-0 accent-emerald-800" aria-describedby={described("consent")} />I agree that Tajweed Scholars may contact me about these trial classes through WhatsApp or email.</label><ErrorText field="consent" errors={errors} /></div>
      </div>}
      {status !== "idle" && <div role="status" className={`mt-5 rounded-lg border p-3 text-sm ${status === "development" ? "border-amber-300 bg-amber-50 text-amber-900" : status === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-stone-200 bg-stone-50"}`}>{status === "submitting" ? "Validating request…" : message}</div>}
      <div className="mt-6 flex gap-3 border-t border-stone-200 pt-5">{step > 1 && <button type="button" onClick={() => { showStep(step - 1); setStatus("idle"); }} className="min-h-11 rounded-lg border border-emerald-700 px-5 text-sm font-bold text-emerald-800">Back</button>}<button type={step === 3 ? "submit" : "button"} onClick={step === 3 ? undefined : nextStep} disabled={status === "submitting"} className="min-h-12 flex-1 rounded-lg bg-emerald-800 px-4 text-sm font-bold text-white disabled:opacity-60">{step === 3 ? "Request My 3 Free Trial Classes" : "Continue"}</button></div>
      <p className="mt-4 text-center text-xs leading-5 text-stone-500"><Icon name="Lock" size={13} className="mr-1 inline" />Your details are used only to arrange the trial classes. No payment information is requested.</p>
    </form>
  </div>;
};
