import assert from "node:assert/strict"; import { readFileSync } from "node:fs"; import { PRICING } from "../config/site"; import { PROGRAM_FAQS, PROGRAM_VISUALS, PRICING_FAQS, CONTACT_FAQS } from "../config/pageContent";
assert.deepEqual(Object.keys(PRICING.currencies),["USD","GBP","CAD","AUD"]); assert.equal(JSON.stringify(PRICING).includes("EUR"),false);
assert.deepEqual(PRICING.currencies.USD.rates,[40,50,60,70,80,45,55]); assert.deepEqual(PRICING.currencies.GBP.rates,[30,40,45,50,60,35,45]); assert.deepEqual(PRICING.currencies.CAD.rates,[55,70,85,100,115,65,80]); assert.deepEqual(PRICING.currencies.AUD.rates,[60,75,90,100,115,65,80]); assert.deepEqual(PRICING.localeCurrencies,{US:"USD",GB:"GBP",CA:"CAD",AU:"AUD"});
assert.equal(Object.keys(PROGRAM_VISUALS).length,6); assert.equal(Object.keys(PROGRAM_FAQS).length,6); assert.equal(PRICING_FAQS.length,7); assert.equal(CONTACT_FAQS.length,4);
const header=readFileSync(new URL("../components/Header.tsx",import.meta.url),"utf8"); for(const text of ["mobile-programs","mobile-policies","aria-expanded","Book 3 Free Trial Classes"]) assert.match(header,new RegExp(text));
const program=readFileSync(new URL("../pages/ProgramPage.tsx",import.meta.url),"utf8"); assert.match(program,/PROGRAM_VISUALS/); assert.doesNotMatch(program,/bg-emerald-950/);
console.log("Remaining launch polish configuration and presentation tests passed");
