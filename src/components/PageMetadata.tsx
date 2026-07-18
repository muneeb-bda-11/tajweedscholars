import { useEffect } from "react";
import { CANONICAL_BASE, PAGE_METADATA } from "../config/metadata";
import { useRouter } from "../lib/router";

const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export const PageMetadata = () => {
  const { path } = useRouter();
  useEffect(() => {
    const metadata = PAGE_METADATA[path] || { title: "Page Not Found | Tajweed Scholars", description: "The requested Tajweed Scholars page could not be found." };
    const canonicalUrl = `${CANONICAL_BASE}${path === "/" ? "" : path}`;
    document.title = metadata.title;
    setMeta('meta[name="description"]', "name", "description", metadata.description);
    setMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
    setMeta('meta[property="og:description"]', "property", "og:description", metadata.description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
  }, [path]);
  return null;
};
