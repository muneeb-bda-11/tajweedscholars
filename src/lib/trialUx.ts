import { getCountryCallingCode, type Country } from "react-phone-number-input";
import { getExampleNumber } from "libphonenumber-js";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import { rawTimeZones, timeZonesNames } from "@vvo/tzdb";

export type CountryOption = { code: Country; name: string };
export type GroupedOption = { value: string; label: string; group?: string; search?: string };
export const POPULAR_COUNTRY_CODES: readonly Country[] = ["US", "GB", "CA", "AU", "AE", "PK"];
export const learnerNameLabel = (learnerType: "child" | "self" | "") => learnerType === "child" ? "Learner’s name *" : "Your name *";

export const orderCountries = (countries: CountryOption[], detected?: Country, recent: readonly Country[] = []): (CountryOption & { group: string })[] => {
  const byCode = new Map(countries.map((country) => [country.code, country]));
  const used = new Set<Country>();
  const take = (codes: readonly Country[], group: string) => codes.flatMap((code) => {
    const country = byCode.get(code);
    if (!country || used.has(code)) return [];
    used.add(code);
    return [{ ...country, group }];
  });
  return [
    ...take(detected ? [detected] : [], "Recommended"),
    ...take(recent, "Recent"),
    ...take(POPULAR_COUNTRY_CODES, "Popular"),
    ...countries.filter(({ code }) => !used.has(code)).sort((a, b) => a.name.localeCompare(b.name)).map((country) => ({ ...country, group: "All countries" }))
  ];
};

export const getTimeZoneValues = (supportedValuesOf = (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf) => {
  let modern: string[] = [];
  try { modern = supportedValuesOf?.("timeZone") || []; } catch { /* use bundled data */ }
  return [...new Set((modern.length ? modern : ["UTC", ...timeZonesNames]).filter(Boolean))];
};

export const suggestedTimeZones = (country?: Country) => country
  ? [...new Set(rawTimeZones.filter((zone) => zone.countryCode === country).map((zone) => zone.name))]
  : [];

export const TIME_ZONE_SEARCH_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "America/Los_Angeles": ["Reno", "Las Vegas"],
  "America/New_York": ["Columbus", "Columbus Ohio"],
  "Asia/Karachi": ["Lahore", "Islamabad", "Rawalpindi"],
  "Asia/Dubai": ["United Arab Emirates", "UAE", "Dubai", "Abu Dhabi", "Sharjah"],
  "Europe/London": ["United Kingdom", "UK", "London", "Birmingham", "Manchester"],
  "America/Toronto": ["Canada", "Toronto", "Ottawa"],
  "Australia/Sydney": ["Australia", "Sydney", "Canberra"]
};
const timeZoneRecord = (zone: string) => rawTimeZones.find((record) => record.name === zone || record.group.includes(zone));
export const timeZoneSearchText = (zone: string) => {
  const record = timeZoneRecord(zone);
  return [zone.replaceAll("_", " "), record?.alternativeName, record?.continentName, record?.countryName, ...(record?.mainCities || []), ...(record?.group || []), ...(TIME_ZONE_SEARCH_ALIASES[zone] || [])].filter(Boolean).join(" ");
};

export const groupTimeZones = (zones: string[], detected: string, country?: Country, recent: readonly string[] = []): GroupedOption[] => {
  const available = new Set(zones);
  const used = new Set<string>();
  const add = (values: string[], group: string) => values.flatMap((value) => {
    if (!available.has(value) || used.has(value)) return [];
    used.add(value);
    return [{ value, label: timeZoneLabel(value), group, search: timeZoneSearchText(value) }];
  });
  return [...add([detected], "Recommended"), ...add([...recent], "Recent"), ...add(suggestedTimeZones(country), "Recommended"), ...add(zones, "All time zones")];
};

export const regionField = (country?: Country) => ({
  US: { label: "State (optional)", placeholder: "e.g., California" },
  CA: { label: "Province or territory (optional)", placeholder: "e.g., Ontario" },
  AU: { label: "State or territory (optional)", placeholder: "e.g., Victoria" },
  PK: { label: "Province or region (optional)", placeholder: "e.g., Punjab" },
  GB: { label: "County or region (optional)", placeholder: "e.g., Greater London" }
}[country || ""] || { label: "State / Province / Region (optional)", placeholder: "" });

export const addRecentIdentifier = (current: readonly string[], value: string, allowed: ReadonlySet<string>) =>
  allowed.has(value) ? [value, ...current.filter((item) => item !== value && allowed.has(item))].slice(0, 3) : [...current].filter((item) => allowed.has(item)).slice(0, 3);

export const readSessionIdentifiers = (key: string, allowed: ReadonlySet<string>) => {
  if (typeof sessionStorage === "undefined") return [];
  try { const value = JSON.parse(sessionStorage.getItem(key) || "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && allowed.has(item)).slice(0, 3) : []; } catch { return []; }
};

export const writeSessionIdentifiers = (key: string, values: readonly string[], allowed: ReadonlySet<string>) => {
  if (typeof sessionStorage === "undefined") return;
  try { sessionStorage.setItem(key, JSON.stringify(values.filter((value) => allowed.has(value)).slice(0, 3))); } catch { /* session storage is optional */ }
};
export const clearSessionIdentifiers = (key: string) => {
  if (typeof sessionStorage === "undefined") return;
  try { sessionStorage.removeItem(key); } catch { /* session storage is optional */ }
};

export const getPhonePatternPlaceholder = (country?: Country) => {
  if (!country) return "+ country code and number";
  const callingCode = getCountryCallingCode(country);
  const example = getExampleNumber(country, examples);
  if (!example) return `+${callingCode} phone number`;
  if (callingCode === "1") return "+1 (XXX) XXX-XXXX";
  const formatted = example.formatInternational();
  const nationalStart = formatted.indexOf(" ");
  if (nationalStart < 0) return `+${callingCode} phone number`;
  let keptMobileDigit = false;
  const nationalPattern = formatted.slice(nationalStart + 1).replace(/\d/g, (digit) => {
    if (!keptMobileDigit) { keptMobileDigit = true; return digit; }
    return "X";
  });
  return `+${callingCode} ${nationalPattern}`;
};
export const phonePlaceholder = getPhonePatternPlaceholder;
export const getNationalPhonePlaceholder = (country?: Country) => {
  if (!country) return "Phone number";
  const full = getPhonePatternPlaceholder(country);
  const prefix = `+${getCountryCallingCode(country)}`;
  return full.startsWith(prefix) ? full.slice(prefix.length).trim() : full;
};
export const formatNationalPhoneInput = (value: string, country: Country) => {
  const digits = value.replace(/\D/g, "");
  const parsed = parsePhoneNumberFromString(digits, country);
  if (parsed) {
    const prefix = `+${getCountryCallingCode(country)}`;
    const international = parsed.formatInternational();
    if (international.startsWith(prefix)) return international.slice(prefix.length).trim();
  }
  return new AsYouType(country).input(digits);
};
export const normalizePhoneEntry = (value: string, country?: Country) => {
  const trimmed = value.trim();
  if (!trimmed) return { e164: "", national: "", country };
  if (trimmed.startsWith("+")) {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (!parsed) return { e164: "", national: trimmed, country };
    const detected = parsed.country as Country | undefined;
    return { e164: parsed.number, national: detected ? formatNationalPhoneInput(parsed.nationalNumber, detected) : parsed.nationalNumber, country: detected || country };
  }
  if (!country) return { e164: "", national: trimmed, country };
  const national = formatNationalPhoneInput(trimmed, country);
  const parsed = parsePhoneNumberFromString(trimmed, country);
  return { e164: parsed?.number || "", national, country };
};
export const detectInitialCountry = (locales: readonly string[], timeZone: string): Country | undefined => {
  const reliableZones: Record<string, Country> = { "Asia/Karachi": "PK", "Europe/London": "GB", "America/New_York": "US", "America/Toronto": "CA", "Australia/Sydney": "AU", "Asia/Dubai": "AE", "Asia/Kabul": "AF" };
  if (reliableZones[timeZone]) return reliableZones[timeZone];
  for (const locale of locales) {
    try { const region = new Intl.Locale(locale).region; if (region?.length === 2) return region as Country; } catch { /* try next locale */ }
  }
  return undefined;
};
export const detectedTimeZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };
export const resolveDeviceDefaults = (locales: readonly string[], timeZone = detectedTimeZone()) => {
  const country = detectInitialCountry(locales, timeZone);
  return { timeZone, country, phoneCountry: country };
};
export const timeZoneLabel = (zone: string, now = new Date()) => {
  const record = timeZoneRecord(zone);
  let city = record?.mainCities[0] || (zone === "UTC" ? "UTC" : zone.split("/").at(-1)?.replaceAll("_", " ") || zone);
  const names: Record<string, string> = { "Asia/Karachi": "Pakistan Time", "Europe/London": "United Kingdom", "America/New_York": "Eastern Time", "America/Los_Angeles": "Pacific Time" };
  try { const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "longOffset" }).formatToParts(now); const offset = (parts.find((p) => p.type === "timeZoneName")?.value || "GMT+00:00").replace("GMT", "UTC").replace("-", "−"); if (zone === "Asia/Karachi") return `Pakistan Time (${offset})`; return `${names[zone] || zone.split("/")[0].replaceAll("_", " ")} — ${city} (${offset})`; } catch { return zone === "Asia/Karachi" ? "Pakistan Time (UTC+05:00)" : `${city} (UTC+00:00)`; }
};
export const newSubmissionMeta = () => ({ submissionId: globalThis.crypto.randomUUID(), formStartedAt: Date.now() });
