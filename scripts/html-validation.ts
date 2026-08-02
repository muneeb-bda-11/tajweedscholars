export interface HtmlExpectations {
  canonical: string;
  description?: string;
  title?: string;
  minimumTextLength?: number;
}

export interface HtmlInspection {
  title: string;
  description: string;
  canonical: string;
  h1: string;
  mainCount: number;
  textLength: number;
}

const decodeHtml = (value: string) => value
  .replaceAll("&quot;", '"')
  .replaceAll("&amp;", "&")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

const matches = (html: string, pattern: RegExp) => [...html.matchAll(pattern)];
const text = (value: string) => decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

const exactlyOne = (html: string, pattern: RegExp, label: string, errors: string[]) => {
  const found = matches(html, pattern);
  if (found.length !== 1) errors.push(`expected exactly one ${label}, found ${found.length}`);
  return found[0]?.[1] ? decodeHtml(found[0][1].trim()) : "";
};

export const inspectRouteHtml = (html: string, expected: HtmlExpectations): { inspection: HtmlInspection; errors: string[] } => {
  const errors: string[] = [];
  const title = exactlyOne(html, /<title\b[^>]*>([^<]*)<\/title>/gi, "title", errors);
  const description = exactlyOne(html, /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/gi, "meta description", errors);
  const canonical = exactlyOne(html, /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']*)["'])[^>]*>/gi, "canonical link", errors);
  const h1Matches = matches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1Matches.length !== 1) errors.push(`expected exactly one H1, found ${h1Matches.length}`);
  const h1 = h1Matches[0] ? text(h1Matches[0][1]) : "";
  const mainCount = matches(html, /<main\b[^>]*>/gi).length;
  if (mainCount !== 1) errors.push(`expected exactly one main landmark, found ${mainCount}`);
  const rootMatch = html.match(/<div\s+id=["']root["'][^>]*>([\s\S]+)<\/body>/i);
  const textLength = text(rootMatch?.[1] ?? "").length;

  if (!title) errors.push("title is empty");
  if (!description) errors.push("description is empty");
  if (!canonical) errors.push("canonical is empty");
  if (!h1) errors.push("H1 is empty");
  if (expected.title !== undefined && title !== expected.title) errors.push(`title mismatch: expected ${JSON.stringify(expected.title)}, received ${JSON.stringify(title)}`);
  if (expected.description !== undefined && description !== expected.description) errors.push("description does not match route configuration");
  if (canonical !== expected.canonical) errors.push(`canonical mismatch: expected ${expected.canonical}, received ${canonical || "(empty)"}`);
  if (textLength < (expected.minimumTextLength ?? 200)) errors.push(`empty SPA shell or insufficient route HTML (${textLength} text characters)`);
  if (/localhost|vercel\.app/i.test(html)) errors.push("HTML contains localhost or vercel.app");

  return { inspection: { title, description, canonical, h1, mainCount, textLength }, errors };
};
