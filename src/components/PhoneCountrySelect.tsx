import React, { useId, useRef, useState } from "react";
import flags from "react-phone-number-input/flags";
import { getCountryCallingCode, type Country } from "react-phone-number-input";
import { ChevronDown, Globe2 } from "lucide-react";

export type PhoneCountryOption = { code: Country; name: string };

export function CountryFlag({ country, countryName }: { country?: Country; countryName: string }) {
  if (!country) return <Globe2 aria-hidden="true" className="h-5 w-5 text-stone-500" />;
  const Flag = flags[country];
  if (!Flag) return <Globe2 aria-hidden="true" className="h-5 w-5 text-stone-500" />;
  return <span className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm border border-stone-200 [&>svg]:h-full [&>svg]:w-full" title={countryName}><Flag title="" /></span>;
}

export function PhoneCountrySelect({ country, options, onChange, initialOpen = false }: { country?: Country; options: PhoneCountryOption[]; onChange: (country: Country) => void; initialOpen?: boolean }) {
  const listId = `${useId()}-phone-countries`, buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(initialOpen), [active, setActive] = useState(Math.max(0, options.findIndex((option) => option.code === country)));
  const selectedName = options.find((option) => option.code === country)?.name || "none selected";
  const choose = (next: Country) => { onChange(next); setOpen(false); requestAnimationFrame(() => buttonRef.current?.focus()); };
  return <div className="relative h-12 w-[68px] shrink-0">
    <button ref={buttonRef} type="button" aria-label={`Change WhatsApp country, currently ${selectedName}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((value) => !value)} onBlur={() => setTimeout(() => setOpen(false), 120)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive((value) => Math.min(value + 1, options.length - 1)); } else if (event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((value) => Math.max(value - 1, 0)); } else if (event.key === "Enter" && open) { event.preventDefault(); choose(options[active].code); } else if (event.key === "Escape") { setOpen(false); } }} className="flex h-12 w-[68px] items-center justify-center gap-2 rounded-l-lg bg-transparent text-stone-700 outline-none">
      <CountryFlag country={country} countryName={selectedName} />
      <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
    </button>
    {open && <ul id={listId} role="listbox" className="absolute left-0 z-50 mt-1 max-h-72 w-[min(18rem,calc(100vw-2rem))] overflow-auto rounded-lg border border-stone-200 bg-white p-1 shadow-lg">{options.map((option, index) => <li key={option.code} role="option" aria-selected={option.code === country} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(option.code)} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-sm ${active === index ? "bg-emerald-50 text-emerald-900" : "text-stone-700"}`}><CountryFlag country={option.code} countryName={option.name} /><span className="min-w-0 flex-1">{option.name}</span><span className="shrink-0 text-xs text-stone-500">+{getCountryCallingCode(option.code)}</span></li>)}</ul>}
  </div>;
}
