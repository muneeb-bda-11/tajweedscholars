/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RouterProvider, Route } from "./lib/router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { FreeTrial } from "./pages/FreeTrial";
import { Pricing } from "./pages/Pricing";
import { Contact } from "./pages/Contact";
import { ProgramPage } from "./pages/ProgramPage";
import { About } from "./pages/About";
import { WhyChooseUs } from "./pages/WhyChooseUs";
import { PolicyUnavailable } from "./pages/PolicyUnavailable";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { Programs } from "./pages/Programs";
import { ProgramFinderProvider } from "./components/ProgramFinder";
import { MobileTrialBar } from "./components/home/MobileTrialBar";

export default function App() {
  return (
    <RouterProvider>
      <ProgramFinderProvider><div className="min-h-screen flex flex-col bg-stone-50 text-stone-850 selection:bg-emerald-800 selection:text-stone-50 font-sans antialiased">
        {/* Sticky Global Navigation Header */}
        <Header />

        {/* Core Main Page Contents */}
        <main className="flex-grow">
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/free-trial" element={<FreeTrial />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/programs" element={<Programs />} />

          <Route path="/kids-quran-classes" element={<ProgramPage />} />
          <Route path="/adult-quran-classes" element={<ProgramPage />} />
          <Route path="/tajweed-course" element={<ProgramPage />} />
          <Route path="/hifz-program" element={<ProgramPage />} />
          <Route path="/arabic-language" element={<ProgramPage />} />
          <Route path="/islamic-studies" element={<ProgramPage />} />

          <Route path="/about" element={<About />} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<PolicyUnavailable />} />
          <Route path="/payment-policy" element={<PolicyUnavailable />} />
          <Route path="/refund-policy" element={<PolicyUnavailable />} />
          <Route path="/reschedule-policy" element={<PolicyUnavailable />} />
        </main>

        {/* Global Informative Academy Footer */}
        <Footer />
        <MobileTrialBar />
      </div></ProgramFinderProvider>
    </RouterProvider>
  );
}
