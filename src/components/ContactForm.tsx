import React, { useState } from "react";
import { SITE_CONFIG } from "../config/site";
import { FormStatusMessage } from "./FormStatusMessage";

interface ContactFormData {
  fullName: string;
  email: string;
  whatsappNumber: string;
  countryTimeZone: string;
  topic: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    email: "",
    whatsappNumber: "",
    countryTimeZone: "",
    topic: "Kids Quran Classes",
    message: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = "Please enter a valid phone number with country code";
    }
    if (!formData.countryTimeZone.trim()) newErrors.countryTimeZone = "Country or time zone is required";
    if (!formData.message.trim()) {
      newErrors.message = "Message text is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Please write a more descriptive message (at least 10 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      if (SITE_CONFIG.DEMO_MODE || !SITE_CONFIG.FORM_ENDPOINT) {
        // Mock success in Demo mode
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubmitStatus("success");
      } else {
        // Secure POST submission
        const payload = {
          ...formData,
          submittedAt: new Date().toISOString(),
          source: "Website / Contact Form"
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
    <div className="w-full bg-stone-50 border border-stone-200/80 rounded-3xl p-6 md:p-8 shadow-sm" id="contact-form-wrapper">
      {submitStatus === "success" ? (
        <FormStatusMessage
          status={submitStatus}
          isDemo={SITE_CONFIG.DEMO_MODE}
          formType="contact"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate id="contact-form">
          <div className="border-b border-stone-200/60 pb-4">
            <h3 className="font-display font-bold text-xl text-emerald-950">Send Us a Message</h3>
            <p className="text-stone-500 text-xs md:text-sm mt-1">
              We aim to respond as quickly as possible, usually within one business day.
            </p>
          </div>

          <div id="field-fullName">
            <label htmlFor="fullName" className="block text-xs font-semibold text-stone-800 mb-1">
              Full Name <span className="text-emerald-700">*</span>
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
              placeholder="e.g. Salim Siddiqui"
            />
            {errors.fullName && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="e.g. salim@domain.com"
              />
              {errors.email && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.email}</p>}
            </div>

            <div id="field-whatsappNumber">
              <label htmlFor="whatsappNumber" className="block text-xs font-semibold text-stone-800 mb-1">
                WhatsApp Number <span className="text-emerald-700">*</span>
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
                placeholder="e.g. +44 7911 123456"
              />
              {errors.whatsappNumber && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.whatsappNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="field-countryTimeZone">
              <label htmlFor="countryTimeZone" className="block text-xs font-semibold text-stone-800 mb-1">
                Country / Time Zone <span className="text-emerald-700">*</span>
              </label>
              <input
                type="text"
                id="countryTimeZone"
                name="countryTimeZone"
                value={formData.countryTimeZone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                  errors.countryTimeZone ? "border-red-400 focus:ring-red-400" : "border-stone-200"
                }`}
                placeholder="e.g. UK / GMT"
              />
              {errors.countryTimeZone && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.countryTimeZone}</p>}
            </div>

            <div>
              <label htmlFor="topic" className="block text-xs font-semibold text-stone-800 mb-1">
                Inquiry Topic <span className="text-emerald-700">*</span>
              </label>
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-colors outline-none"
              >
                <option value="Kids Quran Classes">Kids Quran Classes</option>
                <option value="Adult Quran Classes">Adult Quran Classes</option>
                <option value="Tajweed Course">Tajweed Course</option>
                <option value="Hifz Program">Hifz Program</option>
                <option value="Arabic Language">Arabic Language</option>
                <option value="Islamic Studies">Islamic Studies</option>
                <option value="School or mosque partnership">School or mosque partnership</option>
                <option value="Something else">Something else</option>
              </select>
            </div>
          </div>

          <div id="field-message">
            <label htmlFor="message" className="block text-xs font-semibold text-stone-800 mb-1">
              Your Message <span className="text-emerald-700">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 border transition-colors outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
                errors.message ? "border-red-400 focus:ring-red-400" : "border-stone-200"
              }`}
              placeholder="How can we help you? Let us know your preferred study hours, multiple children booking, or specific questions."
            />
            {errors.message && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.message}</p>}
          </div>

          <FormStatusMessage
            status={submitStatus}
            isDemo={SITE_CONFIG.DEMO_MODE}
            errorMessage={errorMessage}
            formType="contact"
          />

          {submitStatus !== "loading" && (
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl text-sm font-bold text-stone-50 bg-emerald-800 hover:bg-emerald-900 shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 hover:scale-[1.01] active:scale-[0.99]"
            >
              Send Message
            </button>
          )}
        </form>
      )}
    </div>
  );
};
