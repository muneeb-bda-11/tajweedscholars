import assert from "node:assert/strict";
import test from "node:test";
import { inspectRouteHtml } from "./html-validation";

const valid = (body = "route-specific ".repeat(20)) => `<!doctype html><html><head><title>Route title</title><meta content="Route description" name="description"><link href="https://tajweedscholars.com/route" rel="canonical"></head><body><div id="root"><main><h1>Route heading</h1><p>${body}</p></main></div><script></script></body></html>`;
const expected = { title: "Route title", description: "Route description", canonical: "https://tajweedscholars.com/route" };

test("accepts complete route-specific HTML with reordered attributes", () => {
  const result = inspectRouteHtml(valid(), expected);
  assert.deepEqual(result.errors, []);
  assert.equal(result.inspection.mainCount, 1);
});

test("reports duplicate landmarks, bad canonicals, forbidden hosts, and SPA shells", () => {
  const html = valid("short").replace("</main>", "</main><main></main>").replace("tajweedscholars.com/route", "preview.vercel.app/route");
  const { errors } = inspectRouteHtml(html, expected);
  assert.ok(errors.some((error) => error.includes("main landmark")));
  assert.ok(errors.some((error) => error.includes("canonical mismatch")));
  assert.ok(errors.some((error) => error.includes("SPA shell")));
  assert.ok(errors.some((error) => error.includes("vercel.app")));
});

test("reports missing and duplicate metadata with useful counts", () => {
  const html = valid().replace("<title>Route title</title>", "<title>One</title><title>Two</title>").replace(/<meta content="Route description" name="description">/, "");
  const { errors } = inspectRouteHtml(html, expected);
  assert.ok(errors.includes("expected exactly one title, found 2"));
  assert.ok(errors.includes("expected exactly one meta description, found 0"));
});
