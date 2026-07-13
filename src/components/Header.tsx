import React, { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "../lib/router";
import { SITE_CONFIG, NAVIGATION_LINKS } from "../config/site";
import { Icon } from "./Icon";
import { motion, AnimatePresence } from "motion/react";

export const Header: React.FC = () => {
  const { path, navigate } = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Track scroll position for styling changes
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [path]);

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 bg-white border-b border-stone-200/50 flex items-center h-20 shrink-0 ${
          isScrolled ? "shadow-sm" : ""
        }`}
        id="app-header"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo area */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg p-1"
                aria-label="Tajweed Scholars Home"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-100 shadow-md">
                  <Icon name="BookOpen" className="text-amber-100" size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-xl font-bold tracking-tight text-emerald-950 leading-tight">
                    {SITE_CONFIG.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-medium">
                    Online Quran Academy
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium" aria-label="Desktop menu">
              <Link
                to="/"
                className="text-stone-700 hover:text-emerald-800 transition-colors py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md px-1"
              >
                Home
              </Link>

              {/* Programs Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onKeyDown={handleDropdownKeyDown}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-controls="programs-dropdown-menu"
                  className="flex items-center gap-1 text-stone-700 hover:text-emerald-800 transition-colors py-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md px-1"
                >
                  Programs
                  <Icon
                    name={isDropdownOpen ? "ChevronUp" : "ChevronDown"}
                    className="text-stone-400"
                    size={16}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      id="programs-dropdown-menu"
                      className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl bg-stone-50 border border-stone-200 shadow-xl p-2 z-50"
                      role="menu"
                    >
                      <div className="grid gap-1">
                        {NAVIGATION_LINKS.programs.map((prog) => {
                          const isActive = path === prog.path;
                          return (
                            <Link
                              key={prog.path}
                              to={prog.path}
                              role="menuitem"
                              className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-950 font-semibold"
                                  : "text-stone-700 hover:bg-stone-100 hover:text-emerald-900"
                              } focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700`}
                            >
                              <div
                                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                  isActive ? "bg-emerald-800 text-amber-50" : "bg-emerald-50 text-emerald-800"
                                }`}
                              >
                                <Icon
                                  name={
                                    prog.path.includes("kids")
                                      ? "Baby"
                                      : prog.path.includes("adult")
                                      ? "GraduationCap"
                                      : prog.path.includes("tajweed")
                                      ? "BookOpen"
                                      : prog.path.includes("hifz")
                                      ? "Bookmark"
                                      : prog.path.includes("arabic")
                                      ? "Languages"
                                      : "HeartHandshake"
                                  }
                                  size={16}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm">{prog.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/pricing"
                className="text-stone-700 hover:text-emerald-800 transition-colors py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md px-1"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-stone-700 hover:text-emerald-800 transition-colors py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md px-1"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-stone-700 hover:text-emerald-800 transition-colors py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md px-1"
              >
                Contact
              </Link>
            </nav>

            {/* Book CTA Button Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={() => navigate("/free-trial")}
                id="header-cta-button"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md text-sm font-semibold text-stone-50 bg-emerald-800 hover:bg-emerald-900 shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                Book 3 Free Trial Classes
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle Navigation Menu"
                id="mobile-menu-toggle"
                className="p-2 text-stone-700 hover:text-emerald-800 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={26} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              ref={mobileMenuRef}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-stone-50 border-l border-stone-200 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto lg:hidden"
              aria-label="Mobile menu"
            >
              <div>
                {/* Header inside Mobile Drawer */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
                  <span className="font-display font-bold text-lg text-emerald-950">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                    id="mobile-menu-close"
                    className="p-1 text-stone-500 hover:text-emerald-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>

                {/* Primary links */}
                <nav className="flex flex-col gap-4 text-base font-semibold" aria-label="Mobile Navigation Links">
                  <Link
                    to="/"
                    className="text-stone-800 hover:text-emerald-800 py-1 border-b border-stone-100 focus:outline-none"
                  >
                    Home
                  </Link>
                  <Link
                    to="/pricing"
                    className="text-stone-800 hover:text-emerald-800 py-1 border-b border-stone-100 focus:outline-none"
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/about"
                    className="text-stone-800 hover:text-emerald-800 py-1 border-b border-stone-100 focus:outline-none"
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="text-stone-800 hover:text-emerald-800 py-1 border-b border-stone-100 focus:outline-none"
                  >
                    Contact
                  </Link>

                  {/* Programs List */}
                  <div className="mt-4">
                    <h3 className="text-xs uppercase tracking-wider text-emerald-800 font-bold mb-3">
                      Our Programs
                    </h3>
                    <div className="grid gap-2 pl-2">
                      {NAVIGATION_LINKS.programs.map((prog) => (
                        <Link
                          key={prog.path}
                          to={prog.path}
                          className="flex items-center gap-2.5 py-1.5 text-stone-600 hover:text-emerald-800 text-sm focus:outline-none"
                        >
                          <Icon name="BookOpen" className="text-emerald-700/60" size={14} />
                          {prog.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>

              {/* Bottom Drawer CTA */}
              <div className="mt-8 pt-6 border-t border-stone-200">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/free-trial");
                  }}
                  id="mobile-menu-cta-button"
                  className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md text-base font-bold text-stone-50 bg-emerald-800 hover:bg-emerald-900 shadow-md transition-colors"
                >
                  Book 3 Free Trial Classes
                </button>
                <p className="text-[11px] text-stone-400 text-center mt-3 font-medium">
                  3 fully free classes • No card details required
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
