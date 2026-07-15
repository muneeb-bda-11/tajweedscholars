import React, { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { NAVIGATION_LINKS } from "../config/site";
import { Icon } from "./Icon";

export const Header: React.FC = () => {
  const { path, navigate } = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      if (wasOpen.current) toggleRef.current?.focus();
      wasOpen.current = false;
      return;
    }

    wasOpen.current = true;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const items = menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [path]);

  return (
    <>
      <header
        id="app-header"
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow ${
          isScrolled ? "border-stone-200 shadow-sm" : "border-stone-200/70"
        }`}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:h-20 lg:px-8">
          <Link
            to="/"
            aria-label="Tajweed Scholars home"
            className="flex min-h-10 shrink-0 items-center rounded-lg"
          >
            <img
              src="/brand/logo-horizontal.svg"
              alt="Tajweed Scholars"
              width="1600"
              height="400"
              className="h-auto w-[205px] max-w-[calc(100vw-4.75rem)] object-contain min-[390px]:w-[225px] sm:w-[235px] lg:w-[270px]"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-[15px] font-semibold text-stone-700 xl:gap-7 lg:flex" aria-label="Main navigation">
            <Link to="/" className="flex min-h-11 items-center rounded-md hover:text-emerald-800">Home</Link>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((open) => !open)}
                aria-expanded={isDropdownOpen}
                aria-controls="programs-menu"
                className="flex min-h-11 items-center gap-1.5 rounded-md hover:text-emerald-800"
              >
                Programs
                <Icon name="ChevronDown" size={15} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div
                  id="programs-menu"
                  className="absolute left-1/2 top-full w-72 -translate-x-1/2 rounded-xl border border-stone-200 bg-stone-50 p-2 shadow-xl"
                >
                  {NAVIGATION_LINKS.programs.map((program) => (
                    <Link
                      key={program.path}
                      to={program.path}
                      className="flex min-h-11 items-center rounded-lg px-3 text-sm text-stone-700 hover:bg-stone-100 hover:text-emerald-800"
                    >
                      {program.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/pricing" className="flex min-h-11 items-center rounded-md hover:text-emerald-800">Pricing</Link>
            <Link to="/about" className="flex min-h-11 items-center rounded-md hover:text-emerald-800">About</Link>
            <Link to="/contact" className="flex min-h-11 items-center rounded-md hover:text-emerald-800">Contact</Link>
          </nav>

          <button
            type="button"
            onClick={() => navigate("/free-trial")}
            className="hidden min-h-11 items-center justify-center rounded-lg bg-emerald-800 px-5 text-sm font-bold text-stone-50 shadow-sm transition-colors hover:bg-emerald-900 lg:inline-flex"
          >
            Book 3 Free Trial Classes
          </button>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Open navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-emerald-800 hover:bg-emerald-50 lg:hidden"
          >
            <Icon name="Menu" size={25} />
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full bg-stone-950/45"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute right-0 top-0 flex h-full w-[min(88vw,22rem)] flex-col overflow-y-auto bg-stone-50 px-6 py-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-5">
              <span className="font-display text-2xl font-bold text-emerald-950">Explore</span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-stone-100"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <nav className="mt-6 flex flex-col text-base font-semibold text-stone-800" aria-label="Mobile navigation">
              {NAVIGATION_LINKS.main.map((link) => (
                <Link key={link.path} to={link.path} className="flex min-h-12 items-center border-b border-stone-200/70 hover:text-emerald-800">
                  {link.label}
                </Link>
              ))}
              <p className="mb-2 mt-7 text-xs font-bold text-emerald-800">Programs</p>
              {NAVIGATION_LINKS.programs.map((program) => (
                <Link key={program.path} to={program.path} className="flex min-h-11 items-center text-sm text-stone-600 hover:text-emerald-800">
                  {program.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => navigate("/free-trial")}
              className="mt-8 min-h-12 rounded-lg bg-emerald-800 px-4 text-sm font-bold text-stone-50 hover:bg-emerald-900"
            >
              Book 3 Free Trial Classes
            </button>
          </div>
        </div>
      )}
    </>
  );
};
