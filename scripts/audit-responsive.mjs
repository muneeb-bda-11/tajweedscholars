import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { execFileSync, spawn } from "node:child_process";
import { relative, resolve } from "node:path";
import { createServer } from "node:http";

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const commands = process.platform === "win32" ? ["msedge.exe", "chrome.exe"] : ["chromium", "chromium-browser", "google-chrome", "microsoft-edge"];
  const locator = process.platform === "win32" ? "where.exe" : "which";
  for (const command of commands) {
    try { return execFileSync(locator, [command], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split(/\r?\n/)[0]; } catch {}
  }
  if (process.platform === "win32") {
    for (const hive of ["HKLM", "HKCU"]) for (const command of commands) {
      try {
        const key = `${hive}\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${command}`;
        const match = execFileSync("reg.exe", ["query", key, "/ve"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).match(/REG_SZ\s+(.+)$/m);
        if (match) return match[1].trim();
      } catch {}
    }
  }
  throw new Error("No supported Chromium browser found. Install Chrome/Chromium/Edge or set CHROME_PATH.");
}

const chromePath = findBrowser();
const origin = process.env.AUDIT_ORIGIN || "http://127.0.0.1:4173";
const artifactsRoot = resolve(".artifacts");
const outputDir = resolve(process.env.AUDIT_OUTPUT || ".artifacts/responsive-audit");
const outputRelative = relative(artifactsRoot, outputDir);
if (outputRelative.startsWith("..") || resolve(artifactsRoot, outputRelative) !== outputDir) throw new Error("AUDIT_OUTPUT must be inside .artifacts/.");
const routes = process.env.AUDIT_ROUTES?.split(",") || ["/", "/programs", "/free-trial", "/pricing", "/kids-quran-classes", "/adult-quran-classes", "/tajweed-course", "/hifz-program"];
// Warm lazy route chunks at desktop width before collecting narrow-screen results.
const widths = process.env.AUDIT_WIDTHS?.split(",").map(Number) || [1440, 320, 360, 390, 430, 768];
const screenshotWidths = new Set([320, 360, 390, 430, 768, 1024, 1440]);
const policyRoutes = ["/terms-and-conditions", "/payment-policy", "/refund-policy", "/reschedule-policy", "/child-safeguarding", "/recording-policy", "/complaints", "/acceptable-use"];
const routeSelectors = { "/": "#home-page", "/programs": "#programs-page", "/free-trial": "[aria-label='Free Trial form progress']", "/pricing": "#pricing-page", "/about": "#about-page", "/why-choose-us": "#why-choose-us-page", "/contact": "#contact-page", "/privacy-policy": "#privacy-policy-page", ...Object.fromEntries(policyRoutes.map((route) => [route, "#policy-page"])) };
const routeChunks = { "/programs": "/Programs-", "/free-trial": "/FreeTrial-", "/pricing": "/Pricing-", "/about": "/About-", "/why-choose-us": "/WhyChooseUs-", "/contact": "/Contact-", "/privacy-policy": "/PrivacyPolicy-", ...Object.fromEntries(policyRoutes.map((route) => [route, "/PolicyPage-"])) };
const port = 9333;

await mkdir(outputDir, { recursive: true });
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, origin).pathname;
    let file = resolve("dist", pathname === "/" ? "index.html" : `.${pathname}`);
    try { if ((await stat(file)).isDirectory()) file = resolve(file, "index.html"); } catch { file = resolve("dist", "index.html"); }
    const body = await readFile(file);
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream";
    response.writeHead(200, { "content-type": type }); response.end(body);
  } catch { response.writeHead(404); response.end("Not found"); }
});
if (!process.env.AUDIT_ORIGIN) await new Promise((resolveReady) => server.listen(4173, "127.0.0.1", resolveReady));
const profileDir = resolve(outputDir, `browser-profile-${Date.now()}`);
const chrome = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-gpu-sandbox", "--disable-software-rasterizer", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, "about:blank"], { stdio: ["ignore", "ignore", "inherit"] });

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
for (let attempt = 0; attempt < 40; attempt += 1) {
  try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break; } catch {}
  await delay(250);
}

const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(origin)}`, { method: "PUT" })).json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let requestId = 0;
const pending = new Map();
const consoleErrors = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Runtime.exceptionThrown") consoleErrors.push(message.params.exceptionDetails.text);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") consoleErrors.push(message.params.args.map((arg) => arg.value || arg.description).join(" "));
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

await send("Page.enable");
await send("Runtime.enable");
await delay(1500);
const results = [];
for (const width of widths) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
  for (const route of routes) {
    consoleErrors.length = 0;
    await send("Page.navigate", { url: `${origin}${route}` });
    await delay(750);
    const routeSelector = routeSelectors[route] || "[id^='program-page-']";
    const routeChunk = route === "/" ? undefined : routeChunks[route] || "/ProgramPage-";
    await send("Runtime.evaluate", { awaitPromise: true, expression: `new Promise((resolve) => {
      const started = Date.now(); const check = () => {
        const styled = [...document.styleSheets].some((sheet) => sheet.href?.includes('/assets/'));
        const chunkLoaded = ${JSON.stringify(routeChunk)} === undefined || performance.getEntriesByType('resource').some((entry) => entry.name.includes(${JSON.stringify(routeChunk)}));
        const loaded = chunkLoaded && document.querySelector(${JSON.stringify(routeSelector)}) && !document.querySelector('[aria-label="Loading page"]');
        if ((styled && loaded) || Date.now() - started > 20000) resolve(); else setTimeout(check, 50);
      }; check();
    })` });
    await delay(200);
    const evaluation = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
      const root = document.documentElement;
      const viewport = root.clientWidth;
      const candidates = [...document.querySelectorAll('*')].map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { tag: element.tagName.toLowerCase(), id: element.id, className: typeof element.className === 'string' ? element.className : '', left: Math.round(rect.left * 10) / 10, right: Math.round(rect.right * 10) / 10, width: Math.round(rect.width * 10) / 10, scrollWidth: element.scrollWidth, overflowX: style.overflowX, position: style.position, text: (element.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 90) };
      }).filter((item) => item.right > viewport + 0.5 || item.left < -0.5 || item.scrollWidth > item.width + 0.5);
      return { path: location.pathname, viewport, scrollWidth: root.scrollWidth, bodyScrollWidth: document.body.scrollWidth, candidates };
    })()` });
    const item = { width, route, ...evaluation.result.value, consoleErrors: [...consoleErrors] };
    results.push(item);
    if (route === "/free-trial") {
      const sticky = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
        const progress = document.querySelector('[aria-label="Free Trial form progress"]');
        const header = document.getElementById('app-header');
        const form = document.getElementById('trial-form-container');
        scrollTo(0, Math.max(0, form.getBoundingClientRect().top + scrollY - header.getBoundingClientRect().height));
        return new Promise((resolve) => setTimeout(() => {
          const progressRect = progress.getBoundingClientRect(), headerRect = header.getBoundingClientRect();
          const overlap = progressRect.bottom > headerRect.bottom
            ? Math.max(0, Math.round(headerRect.bottom - progressRect.top))
            : 0;
          resolve({ headerBottom: Math.round(headerRect.bottom), progressTop: Math.round(progressRect.top), overlap });
        }, 150));
      })()` , awaitPromise: true });
      item.stickyProgress = sticky.result.value;
      if (screenshotWidths.has(width)) {
        const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        await writeFile(`${outputDir}/free-trial-sticky-${width}.png`, Buffer.from(shot.data, "base64"));
      }
    }
    if (screenshotWidths.has(width)) {
      const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const routeName = route === "/" ? "home" : route.slice(1);
      await writeFile(`${outputDir}/${routeName}-${width}.png`, Buffer.from(shot.data, "base64"));
    }
  }
}
await writeFile(`${outputDir}/measurements.json`, JSON.stringify(results, null, 2));
for (const item of results) console.log(`${item.route.padEnd(22)} ${String(item.width).padStart(4)}px client=${item.viewport} scroll=${item.scrollWidth} suspects=${item.candidates.length}`);
const failures = results.flatMap((item) => {
  const reasons = [];
  if (item.scrollWidth > item.viewport || item.bodyScrollWidth > item.viewport) reasons.push(`document overflow (client=${item.viewport}, document=${item.scrollWidth}, body=${item.bodyScrollWidth})`);
  if (item.route === "/free-trial" && (!item.stickyProgress || item.stickyProgress.overlap > 0)) reasons.push(item.stickyProgress ? `sticky overlap (${item.stickyProgress.overlap}px)` : "sticky measurement unavailable");
  return reasons.map((reason) => `${item.route} at ${item.width}px: ${reason}`);
});
socket.close();
chrome.kill();
server.close();
if (failures.length) {
  console.error(`Responsive audit failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exitCode = 1;
}
