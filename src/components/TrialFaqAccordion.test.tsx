import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { nextOpenFaq, TrialFaqAccordion, type TrialFaq } from "./TrialFaqAccordion.tsx";

const faqs: TrialFaq[] = [
  ["Are all three trial classes free?", "Yes. All three trial classes are free."],
  ["Can I book trials for more than one learner?", "Yes. Submit one request per learner. After submitting, you can use “Add another learner” and your contact details will be kept."]
];
const closed = renderToStaticMarkup(<TrialFaqAccordion faqs={faqs} />);
assert.equal((closed.match(/aria-expanded="false"/g) || []).length, 2);
assert.doesNotMatch(closed, /role="region"/);
assert.match(closed, /Can I book trials for more than one learner/);
assert.doesNotMatch(closed, /Can my WhatsApp number be from another country/);
assert.equal(nextOpenFaq(null, 0), 0);
assert.equal(nextOpenFaq(0, 1), 1);
assert.equal(nextOpenFaq(1, 1), null);
console.log("trial FAQ accordion tests passed");
