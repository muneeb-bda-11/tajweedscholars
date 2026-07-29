import {StrictMode} from 'react';
import {createElement, type ReactNode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import {Home} from './pages/Home';
import {resolveInitialRoute} from './lib/router';
import './index.css';

async function loadInitialRoute(path: string): Promise<ReactNode> {
  if (path === "/") return createElement(Home);
  if (path === "/programs") return createElement((await import("./pages/Programs")).Programs);
  if (["/kids-quran-classes", "/adult-quran-classes", "/tajweed-course", "/hifz-program", "/arabic-language", "/islamic-studies"].includes(path)) return createElement((await import("./pages/ProgramPage")).ProgramPage);
  if (path === "/pricing") return createElement((await import("./pages/Pricing")).Pricing);
  if (path === "/free-trial") return createElement((await import("./pages/FreeTrial")).FreeTrial);
  if (path === "/about") return createElement((await import("./pages/About")).About);
  if (path === "/why-choose-us") return createElement((await import("./pages/WhyChooseUs")).WhyChooseUs);
  if (path === "/contact") return createElement((await import("./pages/Contact")).Contact);
  if (path === "/privacy-policy") return createElement((await import("./pages/PrivacyPolicy")).PrivacyPolicy);
  if (["/terms-and-conditions", "/payment-policy", "/refund-policy", "/reschedule-policy", "/child-safeguarding", "/recording-policy", "/complaints", "/acceptable-use"].includes(path)) return createElement((await import("./pages/PolicyPage")).PolicyPage);
  return createElement((await import("./pages/NotFound")).NotFoundRoute);
}

async function bootstrap() {
  const path = window.location.pathname || "/";
  const legacyRoute = resolveInitialRoute({ pathname: path, search: window.location.search, hash: window.location.hash });
  const initialRouteElement = await loadInitialRoute(path);
  hydrateRoot(document.getElementById('root')!, <StrictMode><App initialPath={path} initialRouteElement={initialRouteElement} /></StrictMode>);
  if (legacyRoute.replacement) window.requestAnimationFrame(() => {
    window.history.replaceState(null, "", legacyRoute.replacement);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}

void bootstrap();
