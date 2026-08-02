import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TrialProgress } from "./TrialForm.tsx";

const source = readFileSync(new URL("./TrialForm.tsx", import.meta.url), "utf8");
assert.match(source, /sticky top-\[75px\]/, "progress clears the 74px sticky site header and its 1px border");
assert.doesNotMatch(source, /sticky top-16/, "progress must not sit 10px behind the site header");

const expected = ["Learner details", "Contact details", "Availability"];
for (const step of [1, 2, 3] as const) {
  const markup = renderToStaticMarkup(<TrialProgress step={step} />);
  assert.match(markup, new RegExp(`Step ${step} of 3 — ${expected[step - 1]}`));
  assert.equal((markup.match(/data-progress-state="complete"/g) || []).length, step);
  assert.equal((markup.match(/data-progress-state="remaining"/g) || []).length, 3 - step);
  assert.match(markup, /aria-current="step"/);
  assert.match(markup, new RegExp(`role="progressbar"[^>]*aria-label="Step ${step} of 3 — ${expected[step - 1]}"`));
  assert.equal((markup.match(new RegExp(`Step ${step} of 3 — ${expected[step - 1]}`, "g")) || []).length, 2);
}

const allSteps = [1, 2, 3].map((step) => renderToStaticMarkup(<TrialProgress step={step as 1 | 2 | 3} />)).join("");
assert.doesNotMatch(allSteps, /1\. Learner|2\. Contact|3\. Availability| · /);
console.log("Trial progress indicator tests passed");
