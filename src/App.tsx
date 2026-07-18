import React, { lazy, Suspense, useEffect } from "react";
import { RouterProvider, Route } from "./lib/router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { ProgramFinderProvider } from "./components/ProgramFinder";
import { MobileTrialBar } from "./components/home/MobileTrialBar";
import { PageMetadata } from "./components/PageMetadata";
import { RouteFallback } from "./components/RouteFallback";
import { prefetchPriorityRoutesWhenIdle } from "./lib/routeModules";

const FreeTrial = lazy(() => import("./pages/FreeTrial").then(m => ({ default: m.FreeTrial })));
const Pricing = lazy(() => import("./pages/Pricing").then(m => ({ default: m.Pricing })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
const Programs = lazy(() => import("./pages/Programs").then(m => ({ default: m.Programs })));
const ProgramPage = lazy(() => import("./pages/ProgramPage").then(m => ({ default: m.ProgramPage })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const WhyChooseUs = lazy(() => import("./pages/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const PolicyPage = lazy(() => import("./pages/PolicyPage").then(m => ({ default: m.PolicyPage })));
const NotFoundRoute = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFoundRoute })));

function AppRoutes() {
  useEffect(prefetchPriorityRoutesWhenIdle, []);
  return <Suspense fallback={<RouteFallback />}>
    <Route path="/" element={<Home />} /><Route path="/free-trial" element={<FreeTrial />} /><Route path="/pricing" element={<Pricing />} /><Route path="/contact" element={<Contact />} /><Route path="/programs" element={<Programs />} />
    <Route path="/kids-quran-classes" element={<ProgramPage />} /><Route path="/adult-quran-classes" element={<ProgramPage />} /><Route path="/tajweed-course" element={<ProgramPage />} /><Route path="/hifz-program" element={<ProgramPage />} /><Route path="/arabic-language" element={<ProgramPage />} /><Route path="/islamic-studies" element={<ProgramPage />} />
    <Route path="/about" element={<About />} /><Route path="/why-choose-us" element={<WhyChooseUs />} /><Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-and-conditions" element={<PolicyPage />} /><Route path="/payment-policy" element={<PolicyPage />} /><Route path="/refund-policy" element={<PolicyPage />} /><Route path="/reschedule-policy" element={<PolicyPage />} /><Route path="/child-safeguarding" element={<PolicyPage />} /><Route path="/recording-policy" element={<PolicyPage />} /><Route path="/complaints" element={<PolicyPage />} /><Route path="/acceptable-use" element={<PolicyPage />} />
    <NotFoundRoute />
  </Suspense>;
}

export default function App() { return <RouterProvider><ProgramFinderProvider><div className="flex min-h-screen flex-col bg-stone-50 font-sans text-stone-850 antialiased selection:bg-emerald-800 selection:text-stone-50"><Header /><main className="flex-grow"><AppRoutes /></main><PageMetadata /><Footer /><MobileTrialBar /></div></ProgramFinderProvider></RouterProvider>; }
