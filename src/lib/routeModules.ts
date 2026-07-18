type RouteLoader = () => Promise<unknown>;

export const routeLoaders: Record<string, RouteLoader> = {
  "/free-trial": () => import("../pages/FreeTrial"),
  "/pricing": () => import("../pages/Pricing"),
  "/contact": () => import("../pages/Contact"),
  "/programs": () => import("../pages/Programs"),
  "/kids-quran-classes": () => import("../pages/ProgramPage"),
  "/adult-quran-classes": () => import("../pages/ProgramPage"),
  "/tajweed-course": () => import("../pages/ProgramPage"),
  "/hifz-program": () => import("../pages/ProgramPage"),
  "/arabic-language": () => import("../pages/ProgramPage"),
  "/islamic-studies": () => import("../pages/ProgramPage"),
  "/about": () => import("../pages/About"),
  "/why-choose-us": () => import("../pages/WhyChooseUs"),
  "/privacy-policy": () => import("../pages/PrivacyPolicy"),
  "/terms-and-conditions": () => import("../pages/PolicyPage"),
  "/payment-policy": () => import("../pages/PolicyPage"),
  "/refund-policy": () => import("../pages/PolicyPage"),
  "/reschedule-policy": () => import("../pages/PolicyPage"),
  "/child-safeguarding": () => import("../pages/PolicyPage"),
  "/recording-policy": () => import("../pages/PolicyPage"),
  "/complaints": () => import("../pages/PolicyPage"),
  "/acceptable-use": () => import("../pages/PolicyPage"),
  "*": () => import("../pages/NotFound"),
};

const requested = new Set<string>();
export function prefetchRoute(to: string) {
  const path = new URL(to, window.location.origin).pathname;
  const loader = routeLoaders[path];
  if (!loader || requested.has(path)) return;
  requested.add(path);
  void loader();
}

export function prefetchPriorityRoutesWhenIdle() {
  const run = () => ["/free-trial", "/programs", "/pricing"].forEach(prefetchRoute);
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 2500 });
  else globalThis.setTimeout(run, 1200);
}
