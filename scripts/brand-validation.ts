import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

export const BRAND_ASSETS = {
  faviconSvg: "/brand/favicon.svg",
  faviconPng: "/brand/favicon-48.png",
  appleTouchIcon: "/brand/apple-touch-icon.png",
  organizationLogo: "/brand/logo-mark-512.png",
} as const;

export const pngDimensions = (buffer: Buffer) => {
  assert.equal(buffer.subarray(1, 4).toString("ascii"), "PNG", "asset is a PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};

export const jsonLdEntities = (html: string): Array<Record<string, unknown>> =>
  [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      const value = JSON.parse(match[1]) as Record<string, unknown>;
      const graph = value["@graph"];
      return Array.isArray(graph) ? graph as Array<Record<string, unknown>> : [value];
    });

export const validateBrandAssets = async (distRoot: string) => {
  for (const asset of Object.values(BRAND_ASSETS)) await access(path.join(distRoot, asset.slice(1)));

  const favicon = pngDimensions(await readFile(path.join(distRoot, BRAND_ASSETS.faviconPng.slice(1))));
  assert.deepEqual(favicon, { width: 48, height: 48 }, "favicon PNG is square and at least 48px");

  const apple = pngDimensions(await readFile(path.join(distRoot, BRAND_ASSETS.appleTouchIcon.slice(1))));
  assert.deepEqual(apple, { width: 180, height: 180 }, "Apple touch icon is 180x180");

  const logo = pngDimensions(await readFile(path.join(distRoot, BRAND_ASSETS.organizationLogo.slice(1))));
  assert.equal(logo.width, logo.height, "Organization logo is square");
  assert.ok(logo.width >= 112, "Organization logo is at least 112px");
};
