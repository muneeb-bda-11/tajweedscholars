import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CountryFlag, PhoneCountrySelect, type PhoneCountryOption } from "./PhoneCountrySelect.tsx";

const options: PhoneCountryOption[] = [
  { code: "PK", name: "Pakistan" },
  { code: "CD", name: "Congo (Democratic Republic)" }
];

const pakistanFlag = renderToStaticMarkup(<CountryFlag country="PK" countryName="Pakistan" />);
const congoFlag = renderToStaticMarkup(<CountryFlag country="CD" countryName="Congo (Democratic Republic)" />);
assert.match(pakistanFlag, /<svg/);
assert.match(congoFlag, /<svg/);

const closed = renderToStaticMarkup(<PhoneCountrySelect country="PK" options={options} onChange={() => undefined} />);
const closedButtonContents = closed.match(/<button[^>]*>([\s\S]*?)<\/button>/)?.[1] || "";
const closedVisibleText = closedButtonContents.replace(/<[^>]+>/g, "").trim();
assert.equal(closedVisibleText, "");
assert.doesNotMatch(closedVisibleText, /PK|Pakistan|CD|Congo/);

const open = renderToStaticMarkup(<PhoneCountrySelect country="PK" options={options} onChange={() => undefined} initialOpen />);
assert.match(open, />Pakistan</);
assert.match(open, />Congo \(Democratic Republic\)</);

console.log("phone country SVG selector render tests passed");
