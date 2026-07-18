import { useEffect, useId, type RefObject } from "react";

const OPEN_EVENT = "tajweed-overlay-open";

export function useDismissibleOverlay({ open, onClose, rootRef, triggerRef, restoreFocus = true }: { open: boolean; onClose: () => void; rootRef: RefObject<HTMLElement | null>; triggerRef?: RefObject<HTMLElement | null>; restoreFocus?: boolean }) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (focus = false) => { onClose(); if (focus && restoreFocus) requestAnimationFrame(() => triggerRef?.current?.focus()); };
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) close(); };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); } };
    const another = (event: Event) => { if ((event as CustomEvent<string>).detail !== id) close(); };
    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    document.addEventListener(OPEN_EVENT, another);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", key); document.removeEventListener(OPEN_EVENT, another); };
  }, [id, onClose, open, restoreFocus, rootRef, triggerRef]);
}
