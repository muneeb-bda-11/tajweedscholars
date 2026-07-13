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
import { PlaceholderPage } from "./pages/PlaceholderPage";

export default function App() {
  return (
    <RouterProvider>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-850 selection:bg-emerald-800 selection:text-stone-50 font-sans antialiased">
        {/* Sticky Global Navigation Header */}
        <Header />

        {/* Core Main Page Contents */}
        <main className="flex-grow">
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/free-trial" element={<FreeTrial />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />

          {/* Programs Placeholders */}
          <Route path="/programs/kids-classes" element={<PlaceholderPage />} />
          <Route path="/programs/adult-classes" element={<PlaceholderPage />} />
          <Route path="/programs/tajweed-course" element={<PlaceholderPage />} />
          <Route path="/programs/hifz-program" element={<PlaceholderPage />} />
          <Route path="/programs/arabic-language" element={<PlaceholderPage />} />
          <Route path="/programs/islamic-studies" element={<PlaceholderPage />} />

          {/* Company & Support Placeholders */}
          <Route path="/about" element={<PlaceholderPage />} />
          <Route path="/why-choose-us" element={<PlaceholderPage />} />

          {/* Policies Placeholders */}
          <Route path="/policies/privacy-policy" element={<PlaceholderPage />} />
          <Route path="/policies/terms-and-conditions" element={<PlaceholderPage />} />
          <Route path="/policies/payment-policy" element={<PlaceholderPage />} />
          <Route path="/policies/refund-policy" element={<PlaceholderPage />} />
          <Route path="/policies/reschedule-policy" element={<PlaceholderPage />} />
        </main>

        {/* Global Informative Academy Footer */}
        <Footer />
      </div>
    </RouterProvider>
  );
}
