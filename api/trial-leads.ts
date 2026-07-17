import type { IncomingMessage, ServerResponse } from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { getCountries, isPossiblePhoneNumber } from "react-phone-number-input";
import type { TrialSubmissionPayload } from "../src/lib/trialSubmission";
import { CANONICAL_VALUES, requiresGuardian } from "../src/shared/trialOptions.js";

type ApiRequest = IncomingMessage & { body?: unknown }; type FieldErrors = Record<string, string>;
const MAX_BODY_BYTES = 16_384, UPSTREAM_TIMEOUT_MS = 15_000, MAX_REDIRECTS = 5, ISO_COUNTRIES = new Set<string>(getCountries());
const send = (response: ServerResponse, status: number, body: object) => { response.statusCode = status; response.setHeader("Content-Type", "application/json; charset=utf-8"); response.setHeader("Cache-Control", "no-store"); response.end(JSON.stringify(body)); };
const text = (value: unknown, max: number, required = true) => typeof value === "string" && (!required || value.trim().length > 0) && value.trim().length <= max;
const validZone = (value: unknown) => { if (typeof value !== "string") return false; try { new Intl.DateTimeFormat(undefined, { timeZone: value }).format(); return true; } catch { return false; } };
const validEmail = (value: unknown) => typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const VALUE_MAPS = {
  learnerType: { "My child": "child", Myself: "self", child: "child", self: "self" },
  ageGroup: { "4–6": "4-6", "4-6": "4-6", "7–9": "7-9", "7-9": "7-9", "10–12": "10-12", "10-12": "10-12", "13–15": "13-15", "13-15": "13-15", "16–17": "16-17", "16-17": "16-17", Adult: "adult", adult: "adult" },
  mainGoal: { "Learn Qaida": "qaida", qaida: "qaida", "Improve Quran reading": "quran-reading", "quran-reading": "quran-reading", "Tajweed correction": "tajweed", tajweed: "tajweed", Hifz: "hifz", hifz: "hifz", "Not sure yet": "unsure", unsure: "unsure" },
  preferredDays: { Monday: "monday", monday: "monday", Tuesday: "tuesday", tuesday: "tuesday", Wednesday: "wednesday", wednesday: "wednesday", Thursday: "thursday", thursday: "thursday", Friday: "friday", friday: "friday", Saturday: "saturday", saturday: "saturday", Sunday: "sunday", sunday: "sunday" },
  preferredTime: { Morning: "morning", morning: "morning", Afternoon: "afternoon", afternoon: "afternoon", Evening: "evening", evening: "evening" }
} as const;
const trim = (value: unknown) => typeof value === "string" ? value.trim() : value;
const mapped = (map: Record<string, string>, value: unknown) => typeof value === "string" ? map[value] ?? value : value;

export function normalizeTrialPayload(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const body = value as Record<string, unknown>;
  return {
    learnerType: mapped(VALUE_MAPS.learnerType, body.learnerType), ageGroup: mapped(VALUE_MAPS.ageGroup, body.ageGroup), mainGoal: mapped(VALUE_MAPS.mainGoal, body.mainGoal),
    contactName: trim(body.contactName), guardianName: trim(body.guardianName), countryCode: trim(body.countryCode), countryName: trim(body.countryName || body.country), region: trim(body.region ?? ""), timeZone: trim(body.timeZone),
    whatsapp: trim(body.whatsapp), email: typeof body.email === "string" ? body.email.trim().toLowerCase() : body.email,
    preferredDays: Array.isArray(body.preferredDays) ? body.preferredDays.map((day) => mapped(VALUE_MAPS.preferredDays, day)) : body.preferredDays,
    preferredTime: mapped(VALUE_MAPS.preferredTime, body.preferredTime), notes: trim(body.notes), consent: body.consent,
    submissionId: body.submissionId, honeypot: body.honeypot, formStartedAt: body.formStartedAt
  };
}

export function validateTrialPayload(value: unknown): { payload?: TrialSubmissionPayload; fieldErrors: FieldErrors } {
  const errors: FieldErrors = {}; if (!value || typeof value !== "object" || Array.isArray(value)) return { fieldErrors: { form: "Invalid request body." } }; const body = value as Record<string, unknown>;
  if (!CANONICAL_VALUES.learnerType.includes(body.learnerType as never)) errors.learnerType = "Choose a valid learner type.";
  if (!CANONICAL_VALUES.ageGroup.includes(body.ageGroup as never)) errors.ageGroup = "Choose a valid age group.";
  if (body.learnerType === "child" && body.ageGroup === "adult") errors.ageGroup = "Choose a valid age group.";
  if (!CANONICAL_VALUES.mainGoal.includes(body.mainGoal as never)) errors.mainGoal = "Choose a valid main goal.";
  if (!text(body.contactName, 120)) errors.contactName = "Enter the parent or learner name.";
  const guardianRequired = requiresGuardian(body.ageGroup); if (guardianRequired && !text(body.guardianName, 120)) errors.guardianName = "Enter a parent or guardian name."; else if (!text(body.guardianName, 120, false)) errors.guardianName = "Guardian name must be 120 characters or fewer.";
  if (typeof body.countryCode !== "string" || !ISO_COUNTRIES.has(body.countryCode)) errors.countryCode = "Choose a valid country.";
  if (!text(body.countryName, 100)) errors.countryName = "Choose a valid country.";
  if (!text(body.region, 100, false)) errors.region = "State / Province / Region must be 100 characters or fewer.";
  if (!validZone(body.timeZone)) errors.timeZone = "Enter a valid IANA time zone.";
  if (typeof body.whatsapp !== "string" || !body.whatsapp.startsWith("+") || body.whatsapp.length > 16 || !isPossiblePhoneNumber(body.whatsapp)) errors.whatsapp = "Enter a possible international phone number.";
  const normalizedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""; if (!validEmail(normalizedEmail)) errors.email = "Enter a valid email address.";
  if (!Array.isArray(body.preferredDays) || !body.preferredDays.length || body.preferredDays.length > 7 || new Set(body.preferredDays).size !== body.preferredDays.length || body.preferredDays.some((day) => !CANONICAL_VALUES.preferredDays.includes(day as never))) errors.preferredDays = "Choose valid preferred days.";
  if (!CANONICAL_VALUES.preferredTime.includes(body.preferredTime as never)) errors.preferredTime = "Choose a valid preferred time.";
  if (!text(body.notes, 1000, false)) errors.notes = "Notes must be 1000 characters or fewer."; if (body.consent !== true) errors.consent = "Consent is required.";
  if (!text(body.submissionId, 100)) errors.submissionId = "Invalid submission identifier."; if (body.honeypot !== "") errors.honeypot = "Invalid submission.";
  if (typeof body.formStartedAt !== "number" || !Number.isFinite(body.formStartedAt) || body.formStartedAt <= 0 || body.formStartedAt > Date.now()) errors.formStartedAt = "Invalid form start time.";
  if (Object.keys(errors).length) return { fieldErrors: errors };
  return { payload: { learnerType: body.learnerType as TrialSubmissionPayload["learnerType"], ageGroup: body.ageGroup as TrialSubmissionPayload["ageGroup"], mainGoal: body.mainGoal as TrialSubmissionPayload["mainGoal"], contactName: String(body.contactName).trim(), guardianName: guardianRequired ? String(body.guardianName).trim() : "", countryCode: String(body.countryCode), countryName: String(body.countryName).trim(), region: String(body.region).trim(), timeZone: String(body.timeZone).trim(), whatsapp: String(body.whatsapp), email: normalizedEmail, preferredDays: [...body.preferredDays as TrialSubmissionPayload["preferredDays"]], preferredTime: body.preferredTime as TrialSubmissionPayload["preferredTime"], notes: String(body.notes).trim(), consent: true, submissionId: String(body.submissionId), honeypot: "", formStartedAt: body.formStartedAt as number }, fieldErrors: {} };
}

export type UpstreamResult = { statusCode: number; body: string };
type UpstreamRequest = { url: URL; method: "GET" | "POST"; body?: string; timeoutMs: number };
export type RequestOnce = (request: UpstreamRequest) => Promise<UpstreamResult & { location?: string }>;

export class UpstreamError extends Error {
  diagnosticCode: string;
  constructor(diagnosticCode: string, message = diagnosticCode) { super(message); this.name = "UpstreamError"; this.diagnosticCode = diagnosticCode; }
}
export class UpstreamValidationError extends Error {
  fieldErrors: FieldErrors;
  constructor(fieldErrors: FieldErrors) { super("UPSTREAM_VALIDATION_ERROR"); this.name = "UpstreamValidationError"; this.fieldErrors = fieldErrors; }
}

export function validateAppsScriptUrl(value: string): URL {
  let url: URL; try { url = new URL(value.trim()); } catch { throw new UpstreamError("UPSTREAM_CONFIG_ERROR"); }
  if (url.protocol !== "https:" || url.hostname !== "script.google.com" || !url.pathname.endsWith("/exec")) throw new UpstreamError("UPSTREAM_CONFIG_ERROR");
  return url;
}

const nodeHttpsRequest: RequestOnce = ({ url, method, body, timeoutMs }) => new Promise((resolve, reject) => {
  const headers: Record<string, string | number> = {}; if (body !== undefined) { headers["Content-Type"] = "application/json"; headers["Content-Length"] = Buffer.byteLength(body); }
  let timer: NodeJS.Timeout;
  const request = https.request(url, { method, headers, family: 4 }, (response) => {
    const chunks: Buffer[] = []; response.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))); response.on("end", () => { clearTimeout(timer); resolve({ statusCode: response.statusCode || 0, body: Buffer.concat(chunks).toString("utf8"), location: response.headers.location }); });
  });
  timer = setTimeout(() => request.destroy(new UpstreamError("UPSTREAM_TIMEOUT")), timeoutMs);
  request.on("error", (error: NodeJS.ErrnoException) => { clearTimeout(timer); if (error instanceof UpstreamError) reject(error); else if (error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") reject(new UpstreamError("UPSTREAM_DNS_ERROR")); else reject(new UpstreamError("UPSTREAM_CONNECTION_ERROR", error.code || error.name)); });
  if (body !== undefined) request.write(body); request.end();
});

export async function requestAppsScript(webhookUrl: string, payload: object, options: { requestOnce?: RequestOnce; timeoutMs?: number; maxRedirects?: number; debug?: boolean } = {}): Promise<UpstreamResult> {
  const requestOnce = options.requestOnce || nodeHttpsRequest, timeoutMs = options.timeoutMs ?? UPSTREAM_TIMEOUT_MS, maxRedirects = options.maxRedirects ?? MAX_REDIRECTS, debug = options.debug === true;
  let url = validateAppsScriptUrl(webhookUrl), method: "GET" | "POST" = "POST", body: string | undefined = JSON.stringify(payload), redirects = 0;
  const started = Date.now(), deadline = started + timeoutMs; if (debug) { console.info("Trial lead: Apps Script request started"); console.info("Trial lead: safe hostname", url.hostname); }
  while (true) {
    const remaining = deadline - Date.now(); if (remaining <= 0) throw new UpstreamError("UPSTREAM_TIMEOUT");
    const result = await requestOnce({ url, method, body, timeoutMs: remaining });
    if ([301, 302, 303, 307, 308].includes(result.statusCode)) {
      if (debug) console.info("Trial lead: redirect HTTP status", result.statusCode);
      if (!result.location) throw new UpstreamError("UPSTREAM_INVALID_RESPONSE"); if (redirects >= maxRedirects) throw new UpstreamError("UPSTREAM_REDIRECT_LIMIT");
      url = new URL(result.location, url); if (url.protocol !== "https:") throw new UpstreamError("UPSTREAM_INVALID_RESPONSE"); redirects += 1;
      if ([301, 302, 303].includes(result.statusCode)) { method = "GET"; body = undefined; }
      continue;
    }
    if (debug) { console.info("Trial lead: final HTTP status", result.statusCode); console.info("Trial lead: total elapsed milliseconds", Date.now() - started); }
    return { statusCode: result.statusCode, body: result.body };
  }
}

const safeDiagnostic = (error: unknown) => error instanceof UpstreamError ? error.diagnosticCode : "UPSTREAM_INVALID_RESPONSE";
export function parseAppsScriptResponse(upstream: UpstreamResult): { ok: true; leadId: string } {
  let result: unknown; try { result = JSON.parse(upstream.body); } catch { throw new UpstreamError("UPSTREAM_INVALID_RESPONSE"); }
  if (result && typeof result === "object" && (result as { ok?: unknown }).ok === false && (result as { code?: unknown }).code === "VALIDATION_ERROR" && (result as { fieldErrors?: unknown }).fieldErrors && typeof (result as { fieldErrors?: unknown }).fieldErrors === "object") {
    const allowed = new Set(["learnerType", "ageGroup", "mainGoal", "contactName", "guardianName", "countryCode", "countryName", "region", "timeZone", "whatsapp", "email", "preferredDays", "preferredTime", "notes", "consent"]), fieldErrors: FieldErrors = {};
    for (const [field, message] of Object.entries((result as { fieldErrors: Record<string, unknown> }).fieldErrors)) if (allowed.has(field) && typeof message === "string") fieldErrors[field] = message;
    if (Object.keys(fieldErrors).length) throw new UpstreamValidationError(fieldErrors);
  }
  if (upstream.statusCode < 200 || upstream.statusCode >= 300 || !result || typeof result !== "object" || (result as { ok?: unknown }).ok !== true || typeof (result as { leadId?: unknown }).leadId !== "string" || !/^TS-[A-Za-z0-9-]{1,80}$/.test((result as { leadId: string }).leadId)) throw new UpstreamError("UPSTREAM_INVALID_RESPONSE");
  return { ok: true, leadId: (result as { leadId: string }).leadId };
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  const debug = process.env.NODE_ENV !== "production";
  if (debug) console.info("Trial lead: request reached API");
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); return send(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED", message: "Method not allowed." }); }
  if (String(request.headers["content-type"] || "").split(";")[0].trim().toLowerCase() !== "application/json") return send(response, 415, { ok: false, code: "UNSUPPORTED_MEDIA_TYPE", message: "Content-Type must be application/json." });
  if (Number(request.headers["content-length"] || 0) > MAX_BODY_BYTES) return send(response, 413, { ok: false, code: "PAYLOAD_TOO_LARGE", message: "Request is too large." });
  let body = request.body; if (typeof body === "string") { if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) return send(response, 413, { ok: false, code: "PAYLOAD_TOO_LARGE", message: "Request is too large." }); try { body = JSON.parse(body); } catch { return send(response, 400, { ok: false, code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fieldErrors: { form: "Invalid JSON body." } }); } }
  if (body && Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_BODY_BYTES) return send(response, 413, { ok: false, code: "PAYLOAD_TOO_LARGE", message: "Request is too large." });
  const normalized = normalizeTrialPayload(body);
  if (debug && normalized && typeof normalized === "object") console.info("Trial lead: normalized field names", Object.keys(normalized));
  const guardianRequired = normalized && typeof normalized === "object" && requiresGuardian((normalized as Record<string, unknown>).ageGroup);
  const guardianPresent = normalized && typeof normalized === "object" && typeof (normalized as Record<string, unknown>).guardianName === "string" && Boolean(String((normalized as Record<string, unknown>).guardianName).trim());
  if (debug) { console.info("Trial lead: guardian required", guardianRequired); console.info("Trial lead: guardian present", guardianPresent); }
  const validated = validateTrialPayload(normalized); if (!validated.payload) { if (debug) console.info("Trial lead: validation failed fields", Object.keys(validated.fieldErrors)); return send(response, 400, { ok: false, code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fieldErrors: validated.fieldErrors }); }
  if (debug) console.info("Trial lead: validation passed");
  const webhookUrl = process.env.APPS_SCRIPT_WEB_APP_URL, apiSecret = process.env.APPS_SCRIPT_API_SECRET; if (!webhookUrl || !apiSecret) return send(response, 500, { ok: false, code: "SUBMISSION_FAILED", message: "We could not submit your request. Please try again or contact us through WhatsApp.", ...(debug ? { diagnosticCode: "UPSTREAM_CONFIG_ERROR" } : {}) });
  try { const result = parseAppsScriptResponse(await requestAppsScript(webhookUrl, { ...validated.payload, apiSecret }, { debug })); if (debug) console.info("Trial lead: returned lead ID", result.leadId); return send(response, 200, { ok: true, leadId: result.leadId, message: "Your trial request has been received." }); }
  catch (error) { if (error instanceof UpstreamValidationError) { if (debug) console.info("Trial lead: upstream validation failed fields", Object.keys(error.fieldErrors)); return send(response, 400, { ok: false, code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fieldErrors: error.fieldErrors }); } const diagnosticCode = safeDiagnostic(error); if (debug) console.info("Trial lead: safe network error code or error name", diagnosticCode); return send(response, 502, { ok: false, code: "SUBMISSION_FAILED", message: "We could not submit your request. Please try again or contact us through WhatsApp.", ...(debug ? { diagnosticCode } : {}) }); }
}
