import assert from "node:assert/strict";
import test from "node:test";
import { jsonLdEntities, pngDimensions } from "./brand-validation";

test("PNG dimensions are read from the IHDR header", () => {
  const buffer = Buffer.alloc(24);
  buffer.write("PNG", 1, "ascii");
  buffer.writeUInt32BE(180, 16);
  buffer.writeUInt32BE(180, 20);
  assert.deepEqual(pngDimensions(buffer), { width: 180, height: 180 });
});

test("JSON-LD graph entities are flattened for duplicate checks", () => {
  const html = '<script type="application/ld+json">{"@graph":[{"@type":"WebSite"},{"@type":"Organization"}]}</script>';
  assert.deepEqual(jsonLdEntities(html).map((entity) => entity["@type"]), ["WebSite", "Organization"]);
});
