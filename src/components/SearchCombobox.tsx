import React, { useEffect, useId, useMemo, useRef, useState } from "react";

export type ComboboxOption = { value: string; label: string; group?: string; search?: string; leading?: React.ReactNode; trailing?: React.ReactNode };

export function HighlightedLabel({ label, query }: { label: string; query: string }) {
  const term = query.trim(), index = term ? label.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) : -1;
  if (index < 0) return <>{label}</>;
  return <span aria-label={label}><span aria-hidden="true">{label.slice(0, index)}<mark className="rounded-sm bg-amber-100 text-inherit">{label.slice(index, index + term.length)}</mark>{label.slice(index + term.length)}</span></span>;
}

export function SearchCombobox({ id, label, value, options, placeholder, error, onChange, onManualChange }: { id: string; label: string; value: string; options: ComboboxOption[]; placeholder: string; error?: string; onChange: (value: string) => void; onManualChange?: () => void }) {
  const listId = `${useId()}-list`, rootRef = useRef<HTMLDivElement>(null), buttonRef = useRef<HTMLButtonElement>(null), inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.value === value);
  const [open, setOpen] = useState(false), [query, setQuery] = useState(""), [active, setActive] = useState(0);
  const filtered = useMemo(() => { const term = query.trim().toLowerCase(); return term ? options.filter((o) => `${o.label} ${o.value} ${o.search || ""}`.toLowerCase().includes(term)) : options; }, [options, query]);
  const close = (returnFocus = false) => { setOpen(false); setQuery(""); if (returnFocus) requestAnimationFrame(() => buttonRef.current?.focus()); };
  const show = () => { setOpen(true); setActive(0); requestAnimationFrame(() => inputRef.current?.focus()); };
  const choose = (option: ComboboxOption) => { onManualChange?.(); onChange(option.value); close(true); };
  useEffect(() => { if (active >= filtered.length) setActive(0); }, [active, filtered.length]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) close(); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const searchName = id.toLowerCase().includes("timezone") ? "ts-timezone-filter" : "ts-country-filter";
  return <div ref={rootRef} className="relative">
    {label && <label id={`${id}-label`} className="text-sm font-bold">{label}</label>}
    <button ref={buttonRef} id={id} type="button" aria-labelledby={`${id}-label ${id}-summary`} aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => open ? close() : show()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); show(); } }} className={`mt-1.5 flex min-h-12 w-full items-center gap-2 rounded-lg border bg-white px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${error ? "border-red-500" : "border-stone-300"}`}>
      <span>{selected?.leading}</span><span id={`${id}-summary`} className={`min-w-0 flex-1 truncate ${selected ? "text-stone-800" : "text-stone-500"}`}>{selected?.label || placeholder}</span><span aria-hidden="true" className="text-stone-500">⌄</span>
    </button>
    {open && <div className="absolute left-0 top-full z-50 mt-1 w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl">
      <div className="sticky top-0 z-10 bg-white p-2"><input ref={inputRef} name={searchName} role="combobox" aria-label={placeholder} aria-expanded="true" aria-controls={listId} aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined} aria-autocomplete="list" autoComplete="off" autoCapitalize="none" spellCheck={false} value={query} placeholder={placeholder} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setActive((current) => Math.min(current + 1, filtered.length - 1)); } else if (event.key === "ArrowUp") { event.preventDefault(); setActive((current) => Math.max(current - 1, 0)); } else if (event.key === "Enter" && filtered[active]) { event.preventDefault(); choose(filtered[active]); } else if (event.key === "Escape") { event.preventDefault(); close(true); } }} className="min-h-11 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-700" /></div>
      <ul id={listId} role="listbox" className="max-h-[300px] overflow-y-auto overscroll-contain p-1">{filtered.length ? filtered.map((option, index) => <React.Fragment key={option.value}>{option.group && option.group !== filtered[index - 1]?.group && <li role="presentation" className="px-3 pb-1 pt-3 text-xs font-bold text-stone-500">{option.group}</li>}<li id={`${listId}-${index}`} role="option" aria-selected={option.value === value} onPointerMove={() => setActive(index)} onClick={() => choose(option)} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 text-sm ${active === index ? "bg-emerald-50 text-emerald-900" : "text-stone-700"}`}><span className="text-base">{option.leading}</span><span className="min-w-0 flex-1 truncate"><HighlightedLabel label={option.label} query={query} /></span><span className="text-xs text-stone-500">{option.trailing}</span></li></React.Fragment>) : <li className="px-3 py-3 text-sm text-stone-500">No matches found</li>}</ul>
    </div>}
    {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-red-700">{error}</p>}
  </div>;
}
