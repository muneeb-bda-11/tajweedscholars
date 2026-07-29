import React, { createElement, StrictMode, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import App from "../src/App";
import { Home } from "../src/pages/Home";
import { Programs } from "../src/pages/Programs";
import { ProgramPage } from "../src/pages/ProgramPage";
import { Pricing } from "../src/pages/Pricing";
import { FreeTrial } from "../src/pages/FreeTrial";
import { About } from "../src/pages/About";
import { WhyChooseUs } from "../src/pages/WhyChooseUs";
import { Contact } from "../src/pages/Contact";
import { PrivacyPolicy } from "../src/pages/PrivacyPolicy";
import { PolicyPage } from "../src/pages/PolicyPage";
import { canonicalUrlFor, PAGE_METADATA, PUBLIC_ROUTES, SITE_NAME, SOCIAL_IMAGE_URL } from "../src/config/metadata";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const template = await readFile(path.join(distRoot, "index.html"), "utf8");

const componentFor = (route: string): ComponentType => {
  if (route === "/") return Home;
  if (route === "/programs") return Programs;
  if (["/kids-quran-classes", "/adult-quran-classes", "/tajweed-course", "/hifz-program", "/arabic-language", "/islamic-studies"].includes(route)) return ProgramPage;
  if (route === "/pricing") return Pricing;
  if (route === "/free-trial") return FreeTrial;
  if (route === "/about") return About;
  if (route === "/why-choose-us") return WhyChooseUs;
  if (route === "/contact") return Contact;
  if (route === "/privacy-policy") return PrivacyPolicy;
  return PolicyPage;
};

const escapeAttribute = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${canonicalUrlFor("/")}#organization`,
      name: SITE_NAME,
      url: canonicalUrlFor("/"),
      logo: `${canonicalUrlFor("/")}brand/logo-horizontal.png`,
      email: "info@tajweedscholars.com",
    },
    {
      "@type": "WebSite",
      "@id": `${canonicalUrlFor("/")}#website`,
      name: SITE_NAME,
      url: canonicalUrlFor("/"),
      publisher: { "@id": `${canonicalUrlFor("/")}#organization` },
    },
  ],
};

const headFor = (route: string) => {
  const metadata = PAGE_METADATA[route];
  const canonical = canonicalUrlFor(route);
  const jsonLd = route === "/"
    ? `\n    <script type="application/ld+json">${JSON.stringify(homeStructuredData).replaceAll("<", "\\u003c")}</script>`
    : "";
  return `
    <title>${escapeAttribute(metadata.title)}</title>
    <meta name="description" content="${escapeAttribute(metadata.description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeAttribute(metadata.title)}" />
    <meta property="og:description" content="${escapeAttribute(metadata.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SOCIAL_IMAGE_URL}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttribute(metadata.title)}" />
    <meta name="twitter:description" content="${escapeAttribute(metadata.description)}" />
    <meta name="twitter:image" content="${SOCIAL_IMAGE_URL}" />${jsonLd}`;
};

const stripTemplateSeo = (html: string) => html
  .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
  .replace(/\s*<meta\s+(?:name|property)="(?:description|keywords|og:[^"]+|twitter:[^"]+)"[^>]*\/?>/gi, "")
  .replace(/\s*<link\s+rel="canonical"[^>]*\/?>/gi, "")
  .replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

for (const route of PUBLIC_ROUTES) {
  const Page = componentFor(route);
  const routeElement = createElement(Page);
  const body = renderToString(<StrictMode><App initialPath={route} initialRouteElement={routeElement} /></StrictMode>);
  const html = stripTemplateSeo(template)
    .replace("</head>", `${headFor(route)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const outputDirectory = route === "/" ? distRoot : path.join(distRoot, route.slice(1));
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "index.html"), html, "utf8");
}

console.log(`Prerendered ${PUBLIC_ROUTES.length} public routes.`);
