import { ATTRIBUTION_LIMITS, UTM_FIELDS, sanitizeAttributionValue, sanitizePath, type MarketingAttribution } from "../shared/attribution";

const STORAGE_KEY = "tajweed-scholars-first-touch";
export interface AttributionBrowser { location: Pick<Location, "href" | "origin" | "pathname">; document: Pick<Document, "referrer">; sessionStorage?: Pick<Storage, "getItem" | "setItem">; now?: () => Date; }

const externalReferrerHost = (referrer: string, origin: string) => {
  if (!referrer) return "";
  try { const source = new URL(referrer); return /^https?:$/.test(source.protocol) && source.origin !== origin ? sanitizeAttributionValue(source.hostname.toLowerCase(), ATTRIBUTION_LIMITS.referrer_host) : ""; }
  catch { return ""; }
};

const validStoredAttribution = (value: unknown): MarketingAttribution | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.landing_path !== "string" || typeof record.first_touch_at !== "string") return undefined;
  const result: MarketingAttribution = {};
  for (const [field, limit] of Object.entries(ATTRIBUTION_LIMITS)) { const current = record[field]; if (typeof current === "string" && current.length <= limit) result[field as keyof MarketingAttribution] = current; }
  return result;
};

export const captureFirstTouchAttribution = (browser?: AttributionBrowser): MarketingAttribution | undefined => {
  let runtime = browser;
  if (!runtime) {
    try { if (typeof window === "undefined") return undefined; runtime = { location: window.location, document: window.document, sessionStorage: window.sessionStorage }; }
    catch { return undefined; }
  }
  if (!runtime?.sessionStorage) return undefined;
  try {
    const existing = runtime.sessionStorage.getItem(STORAGE_KEY);
    if (existing) { const parsed = validStoredAttribution(JSON.parse(existing)); if (parsed) return parsed; }
    const url = new URL(runtime.location.href);
    const attribution: MarketingAttribution = { landing_path: sanitizePath(runtime.location.pathname), first_touch_at: (runtime.now?.() ?? new Date()).toISOString() };
    for (const field of UTM_FIELDS) { const value = sanitizeAttributionValue(url.searchParams.get(field) ?? "", ATTRIBUTION_LIMITS[field]); if (value) attribution[field] = value; }
    const referrerHost = externalReferrerHost(runtime.document.referrer, runtime.location.origin); if (referrerHost) attribution.referrer_host = referrerHost;
    runtime.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution)); return attribution;
  } catch { return undefined; }
};

export const attributionForSubmission = (pathname?: string, browser?: AttributionBrowser): MarketingAttribution | undefined => {
  const stored = captureFirstTouchAttribution(browser); if (!stored) return undefined;
  return { ...stored, submission_path: sanitizePath(pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/")) };
};
export const ATTRIBUTION_SESSION_KEY = STORAGE_KEY;
