export const ATTRIBUTION_LIMITS = {
  utm_source: 100, utm_medium: 100, utm_campaign: 160, utm_content: 160, utm_term: 160,
  referrer_host: 253, landing_path: 300, submission_path: 300, first_touch_at: 30,
} as const;

export type AttributionField = keyof typeof ATTRIBUTION_LIMITS;
export type MarketingAttribution = Partial<Record<AttributionField, string>>;
export const ATTRIBUTION_FIELDS = Object.keys(ATTRIBUTION_LIMITS) as AttributionField[];
export const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export const sanitizeAttributionValue = (value: string, maxLength: number) => value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
export const sanitizePath = (value: string) => {
  const cleaned = sanitizeAttributionValue(value, ATTRIBUTION_LIMITS.landing_path);
  if (!cleaned.startsWith("/") || cleaned.startsWith("//")) return "/";
  return cleaned.split(/[?#]/, 1)[0] || "/";
};
export const isIsoTimestamp = (value: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value));
