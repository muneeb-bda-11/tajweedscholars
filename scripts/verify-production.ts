import { CANONICAL_BASE, PAGE_METADATA, PUBLIC_ROUTES, canonicalUrlFor } from "../src/config/metadata";
import { inspectRouteHtml } from "./html-validation";

const TIMEOUT_MS = 10_000;
const failures: string[] = [];
const rows: Array<{ route: string; status: number | string; html: string; canonical: string }> = [];

const request = async (url: string, redirect: RequestRedirect = "follow") => {
  try {
    return await fetch(url, { redirect, signal: AbortSignal.timeout(TIMEOUT_MS), headers: { "user-agent": "Tajweed-Scholars-production-verifier/1.0" } });
  } catch (error) {
    failures.push(`${url}: request failed: ${error instanceof Error ? error.message : String(error)}`);
    return undefined;
  }
};

const titles = new Map<string, string>();
const signatures = new Map<string, string>();
for (const route of PUBLIC_ROUTES) {
  const response = await request(canonicalUrlFor(route));
  if (!response) {
    rows.push({ route, status: "ERR", html: "FAIL", canonical: "FAIL" });
    continue;
  }
  const html = await response.text();
  const result = inspectRouteHtml(html, { ...PAGE_METADATA[route], canonical: canonicalUrlFor(route) });
  if (response.status !== 200) failures.push(`${route}: expected 200, received ${response.status}`);
  for (const error of result.errors) failures.push(`${route}: ${error}`);
  if (titles.has(result.inspection.title)) failures.push(`${route}: title duplicates ${titles.get(result.inspection.title)}`);
  else titles.set(result.inspection.title, route);
  const signature = `${result.inspection.title}|${result.inspection.h1}|${result.inspection.textLength}`;
  if (signatures.has(signature)) failures.push(`${route}: HTML signature duplicates ${signatures.get(signature)} (not route-specific)`);
  else signatures.set(signature, route);
  rows.push({ route, status: response.status, html: result.errors.length ? "FAIL" : "OK", canonical: result.inspection.canonical === canonicalUrlFor(route) ? "OK" : "FAIL" });
}

for (const path of ["/robots.txt", "/sitemap.xml"]) {
  const response = await request(`${CANONICAL_BASE}${path}`);
  if (response?.status !== 200) failures.push(`${path}: expected 200, received ${response?.status ?? "request error"}`);
}

const unknown = await request(`${CANONICAL_BASE}/__production-verification-not-found__`, "manual");
if (unknown?.status !== 404) failures.push(`unknown route: expected 404, received ${unknown?.status ?? "request error"}`);

for (const route of PUBLIC_ROUTES.filter((route) => route !== "/")) {
  const response = await request(`${canonicalUrlFor(route)}/`, "manual");
  if (!response || ![301, 302, 307, 308].includes(response.status)) failures.push(`${route}/: expected redirect, received ${response?.status ?? "request error"}`);
  else if (new URL(response.headers.get("location") ?? "", canonicalUrlFor(route)).href !== canonicalUrlFor(route)) failures.push(`${route}/: redirect does not target ${canonicalUrlFor(route)}`);
}

for (const [label, source] of [["HTTP", "http://tajweedscholars.com/"], ["www", "https://www.tajweedscholars.com/"]] as const) {
  const response = await request(source, "manual");
  const location = response?.headers.get("location");
  if (!response || ![301, 302, 307, 308].includes(response.status)) failures.push(`${label}: expected redirect, received ${response?.status ?? "request error"}`);
  else if (new URL(location ?? "", source).href !== `${CANONICAL_BASE}/`) failures.push(`${label}: expected redirect to ${CANONICAL_BASE}/, received ${location ?? "no Location header"}`);
}

const api = await request(`${CANONICAL_BASE}/api/trial-leads`, "manual");
if (api?.status !== 405) failures.push(`/api/trial-leads GET: expected 405, received ${api?.status ?? "request error"}`);

console.table(rows);
if (failures.length) {
  console.error(`\nProduction verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Production verification passed for all ${PUBLIC_ROUTES.length} routes and operational checks.`);
}
