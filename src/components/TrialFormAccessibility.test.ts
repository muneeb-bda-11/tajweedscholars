import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const form = readFileSync(new URL("TrialForm.tsx", import.meta.url), "utf8");
const combobox = readFileSync(new URL("SearchCombobox.tsx", import.meta.url), "utf8");

for (const field of ["contactName", "guardianName", "whatsapp", "email", "consent"]) {
  assert.match(form, new RegExp(`id="${field}"[\\s\\S]{0,220}(?:required|aria-required)`), `${field} exposes required semantics`);
  assert.match(form, new RegExp(`id="${field}"[\\s\\S]{0,300}aria-invalid`), `${field} exposes invalid semantics`);
}
assert.match(form, /id="whatsapp"[\s\S]{0,500}aria-describedby={`whatsapp-help\$\{errors\.whatsapp \? " whatsapp-error" : ""\}`}/);
assert.match(combobox, /aria-required={required}/);
assert.match(combobox, /aria-invalid={Boolean\(error\)}/);
assert.match(combobox, /aria-describedby={error \? `\$\{id\}-error` : undefined}/);
assert.doesNotMatch(form, /onClick={copyReference} aria-live=/);
assert.match(form, /role="status" aria-live="polite">{copied \? "Reference copied to clipboard\."/);

console.log("Trial form required, invalid, error association, and copy status semantics passed");
