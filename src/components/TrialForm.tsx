import React, { useState, useEffect } from "react";
import { SITE_CONFIG } from "../config/site";
import { FormStatusMessage } from "./FormStatusMessage";

interface FormData {
  fullName: string;
  email: string;
  whatsappNumber: string;
  studentName: string;
  studentAge: string;
  country: string;
  stateCity: string;
  timeZone: string;
  program: string;
  currentLevel: string;
  teacherPreference: string;
  preferredDays: string;
  preferredTime: string;
  previousLearning: string;
  additionalNotes: string;
  consent: boolean;
}

export const TrialForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    whatsappNumber: "",
    studentName: "",
    studentAge: "",
    country: "United States",
    stateCity: "",
    timeZone: "",
    program: "Kids Quran Classes",
    currentLevel: "Complete beginner",
    teacherPreference: "No preference",
    preferredDays: "",
    preferredTime: "",
    previousLearning: "",
    additionalNotes: "",
    consent: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detectedZone) {
        setFormData((prev) => ({ ...prev, timeZone: detectedZone }));
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  useEffect(() => {
    const query = window.location.hash.split("?")[1];
    if (!query) return;

    const params = new URLSearchParams(query);
    const allowedPrograms = ["Kids Quran Classes", "Adult Quran Classes", "Tajweed Course", "Hifz Program"];
    const allowedLevels = ["Complete beginner", "Learning Arabic letters", "Reading Qaida", "Reading Quran", "Memorizing Quran", "Tajweed correction needed", "Tajweed learner", "Already memorizing", "Not sure"];
    const allowedAgeGroups = ["4–5", "6–8", "9–12", "13–15"];
    const allowedGoals = ["Learn from the beginning", "Improve Quran reading", "Improve Tajweed", "Memorize Quran", "Tajweed correction", "Hifz", "Both"];
    const program = params.get("recommendedProgram");
    const currentLevel = params.get("currentLevel");
    const ageGroup = params.get("ageGroup");
    const goal = params.get("goal");

    setFormData((previous) => ({
      ...previous,
      program: program && allowedPrograms.includes(program) ? program : previous.program,
      currentLevel: currentLevel && allowedLevels.includes(currentLevel) ? currentLevel : previous.currentLevel,
      studentAge: ageGroup && allowedAgeGroups.includes(ageGroup) ? ageGroup : previous.studentAge,
      additionalNotes: goal && allowedGoals.includes(goal) ? `Learning goal: ${goal}` : previous.additionalNotes
    }));
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Your full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp phone number is required";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = "Please enter a valid phone number with country code";
    }
    if (!formData.studentName.trim()) newErrors.studentName = "Student name is required";
    if (!formData.studentAge.trim()) newErrors.studentAge = "Student age is required";
    if (!formData.stateCity.trim()) newErrors.stateCity = "State or city is required";
    if (!formData.timeZone.trim()) newErrors.timeZone = "Your time zone is required (e.g. EST, GMT)";
    if (!formData.preferredDays.trim()) newErrors.preferredDays = "Please select preferred days (e.g. Weekends, Mon & Wed)";
    if (!formData.preferredTime.trim()) newErrors.preferredTime = "Preferred time range is required";
    if (!formData.consent) newErrors.consent = "You must accept the communication consent to proceed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      if (errors[name as keyof FormData]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormData]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        document.getElementById(`field-${firstErrorKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      if (SITE_CONFIG.DEMO_MODE || !SITE_CONFIG.FORM_ENDPOINT) {
        // Mock a network response in Demo mode
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubmitStatus("success");
      } else {
        // Secure POST submission
        const payload = {
          ...formData,
          submittedAt: new Date().toISOString(),
          source: "Website / Free Trial Form"
        };

        const response = await fetch(SITE_CONFIG.FORM_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Server returned error code: ${response.status}`);
        }

        setSubmitStatus("success");
      }
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred. Please contact us via WhatsApp.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-stone-50 border border-stone-200/85 rounded-3xl p-6 md:p-10 shadow-sm" id="trial-form-container">
      {submitStatus === "success" ? (
        <FormStatusMessage
          status={submitStatus}
          isDemo={SITE_CONFIG.DEMO_MODE}
          formType="trial"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8" noValidate id="free-trial-form">
          <div className="border-b border-stone-200 pb-5">
            <h3 className="font-display font-bold text-xl text-emerald-950">Book 3 Free Trial Classes</h3>
            <p className="text-stone-500 text-xs md:text-sm mt-1">
              Please fill out all fields. No payment cards or financial commitments required.
            </p>
          </div>

          {/* Section 1: Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-emerald-800 font-bold font-mono">
              1. Contact Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id="field-fullName">
                <label htmlFor="fullName" className="block text-xs font-semibold text-stone-800 mb-1">
                  Parent or Adult Learner Full Name <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.fullName ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. Tariq Mansoor"
                />
                {errors.fullName && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.fullName}</p>}
              </div>

              <div id="field-email">
                <label htmlFor="email" className="block text-xs font-semibold text-stone-800 mb-1">
                  Email Address <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.email ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. tariq@domain.com"
                />
                {errors.email && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id="field-whatsappNumber">
                <label htmlFor="whatsappNumber" className="block text-xs font-semibold text-stone-800 mb-1">
                  WhatsApp Number (with country code) <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.whatsappNumber ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. +1 555 123 4567"
                />
                {errors.whatsappNumber && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.whatsappNumber}</p>}
              </div>

              <div id="field-timeZone">
                <label htmlFor="timeZone" className="block text-xs font-semibold text-stone-800 mb-1">
                  Your Time Zone <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  id="timeZone"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.timeZone ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. EST (Eastern Standard Time)"
                />
                {errors.timeZone && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.timeZone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-stone-800 mb-1">
                  Country <span className="text-emerald-700">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-colors outline-none"
                >
                  {SITE_CONFIG.countriesServed.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div id="field-stateCity">
                <label htmlFor="stateCity" className="block text-xs font-semibold text-stone-800 mb-1">
                  State / City <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  id="stateCity"
                  name="stateCity"
                  value={formData.stateCity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.stateCity ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. New York, Brooklyn"
                />
                {errors.stateCity && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.stateCity}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Student Details */}
          <div className="space-y-4 pt-4 border-t border-stone-200/60">
            <h4 className="text-xs uppercase tracking-wider text-emerald-800 font-bold font-mono">
              2. Student Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id="field-studentName">
                <label htmlFor="studentName" className="block text-xs font-semibold text-stone-800 mb-1">
                  Student Name <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.studentName ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. Yusuf Mansoor"
                />
                {errors.studentName && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.studentName}</p>}
              </div>

              <div id="field-studentAge">
                <label htmlFor="studentAge" className="block text-xs font-semibold text-stone-800 mb-1">
                  Student Age <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  id="studentAge"
                  name="studentAge"
                  value={formData.studentAge}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.studentAge ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. 9 (or 'Adult' for yourself)"
                />
                {errors.studentAge && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.studentAge}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="program" className="block text-xs font-semibold text-stone-800 mb-1">
                  Program of Interest <span className="text-emerald-700">*</span>
                </label>
                <select
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-colors outline-none"
                >
                  <option value="Kids Quran Classes">Kids Quran Classes</option>
                  <option value="Adult Quran Classes">Adult Quran Classes</option>
                  <option value="Tajweed Course">Tajweed Course</option>
                  <option value="Hifz Program">Hifz Program</option>
                  <option value="Arabic Language">Arabic Language</option>
                  <option value="Islamic Studies">Islamic Studies</option>
                </select>
              </div>

              <div>
                <label htmlFor="currentLevel" className="block text-xs font-semibold text-stone-800 mb-1">
                  Current Quran Recitation Level <span className="text-emerald-700">*</span>
                </label>
                <select
                  id="currentLevel"
                  name="currentLevel"
                  value={formData.currentLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-colors outline-none"
                >
                  <option value="Complete beginner">Complete beginner</option>
                  <option value="Learning Arabic letters">Learning Arabic letters</option>
                  <option value="Reading Qaida">Reading Qaida</option>
                  <option value="Reading Quran">Reading Quran</option>
                  <option value="Tajweed correction needed">Tajweed correction needed</option>
                  <option value="Memorizing Quran">Memorizing Quran</option>
                  <option value="Tajweed learner">Tajweed learner</option>
                  <option value="Already memorizing">Already memorizing</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="teacherPreference" className="block text-xs font-semibold text-stone-800 mb-1">
                Preferred Teacher Gender <span className="text-emerald-700">*</span>
              </label>
              <select
                id="teacherPreference"
                name="teacherPreference"
                value={formData.teacherPreference}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-colors outline-none"
              >
                <option value="No preference">No preference</option>
                <option value="Male teacher preferred">Male teacher preferred</option>
                <option value="Female teacher preferred">Female teacher preferred</option>
              </select>
            </div>
          </div>

          {/* Section 3: Class Schedule Preferences */}
          <div className="space-y-4 pt-4 border-t border-stone-200/60">
            <h4 className="text-xs uppercase tracking-wider text-emerald-800 font-bold font-mono">
              3. Scheduling & Background
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id="field-preferredDays">
                <label htmlFor="preferredDays" className="block text-xs font-semibold text-stone-800 mb-1">
                  Preferred Days for Trials <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  id="preferredDays"
                  name="preferredDays"
                  value={formData.preferredDays}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.preferredDays ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. Saturdays, or Mon & Wed"
                />
                {errors.preferredDays && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.preferredDays}</p>}
              </div>

              <div id="field-preferredTime">
                <label htmlFor="preferredTime" className="block text-xs font-semibold text-stone-800 mb-1">
                  Preferred Time Range <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                    errors.preferredTime ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                  }`}
                  placeholder="e.g. 5:30 PM - 8:00 PM"
                />
                {errors.preferredTime && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.preferredTime}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="previousLearning" className="block text-xs font-semibold text-stone-800 mb-1">
                Previous Quran Learning (Brief summary)
              </label>
              <textarea
                id="previousLearning"
                name="previousLearning"
                value={formData.previousLearning}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-colors outline-none"
                placeholder="e.g. Has studied basic Qaida at a local mosque, knows Arabic alphabet, but struggles with rules."
              />
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-xs font-semibold text-stone-800 mb-1">
                Additional Notes or Special Requests
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-colors outline-none"
                placeholder="e.g. Looking for a patient teacher who works well with slow learners"
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-4 border-t border-stone-200/60" id="field-consent">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="mt-1 w-4.5 h-4.5 accent-emerald-800 rounded text-emerald-900 focus:ring-emerald-700 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="consent" className="text-stone-600 text-xs leading-relaxed select-none cursor-pointer">
                I consent to receive class updates and scheduling text messages/emails from Tajweed Scholars. Message and data rates may apply. Reply STOP to opt out. <span className="text-emerald-700">*</span>
              </label>
            </div>
            {errors.consent && <p className="text-red-500 text-[11px] mt-1.5 font-medium">{errors.consent}</p>}
          </div>

          <FormStatusMessage
            status={submitStatus}
            isDemo={SITE_CONFIG.DEMO_MODE}
            errorMessage={errorMessage}
            formType="trial"
          />

          {submitStatus !== "loading" && (
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-4.5 rounded-xl text-base font-bold text-stone-50 bg-emerald-800 hover:bg-emerald-900 shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              Request 3 Complimentary Trial Classes
            </button>
          )}
        </form>
      )}
    </div>
  );
};
