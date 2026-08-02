import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RouterProvider } from "../lib/router";
import { MobileTrialBar } from "./home/MobileTrialBar";

const renderBar = (path: string) => renderToStaticMarkup(
  React.createElement(RouterProvider, { initialPath: path }, React.createElement(MobileTrialBar)),
);

assert.doesNotMatch(renderBar("/free-trial"), /mobile-trial-bar/);
for (const path of ["/", "/programs", "/pricing"]) {
  assert.match(renderBar(path), /mobile-trial-bar/, `${path} retains the global mobile trial bar`);
}

console.log("Mobile trial bar route visibility tests passed");
