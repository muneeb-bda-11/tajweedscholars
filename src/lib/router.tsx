import React, { createContext, useContext, useEffect, useState } from "react";
import { PUBLIC_ROUTES } from "../config/metadata";
import { prefetchRoute } from "./routeModules";

interface RouterContextType { path: string; navigate: (to: string) => void; }
interface BrowserLocation { pathname: string; search: string; hash: string; }
export interface InitialRoute { path: string; replacement?: string; }
const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const resolveInitialRoute = ({ pathname, search, hash }: BrowserLocation): InitialRoute => {
  if (!hash.startsWith("#/")) return { path: pathname || "/" };
  const legacyTarget = hash.slice(1);
  if (legacyTarget.startsWith("//")) return { path: pathname || "/" };
  const queryIndex = legacyTarget.indexOf("?");
  const legacyPath = queryIndex >= 0 ? legacyTarget.slice(0, queryIndex) : legacyTarget;
  if (!PUBLIC_ROUTES.includes(legacyPath)) return { path: pathname || "/" };
  const legacySearch = queryIndex >= 0 ? legacyTarget.slice(queryIndex) : search;
  return { path: legacyPath, replacement: `${legacyPath}${legacySearch}` };
};

export const isInternalRoute = (to: string) => to.startsWith("/") && !to.startsWith("//");

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialRoute] = useState(() => resolveInitialRoute({ pathname: window.location.pathname, search: window.location.search, hash: window.location.hash }));
  const [path, setPath] = useState(initialRoute.path);

  useEffect(() => {
    if (initialRoute.replacement) window.history.replaceState(null, "", initialRoute.replacement);
  }, [initialRoute]);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (!isInternalRoute(to)) return;
    const target = new URL(to, window.location.origin);
    window.history.pushState(null, "", `${target.pathname}${target.search}`);
    setPath(target.pathname || "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useRouter must be used within a RouterProvider");
  return context;
};

interface RouteProps { path: string; element: React.ReactNode; }
export const Route: React.FC<RouteProps> = ({ path: routePath, element }) => {
  const { path } = useRouter();
  return routePath === "*" || path === routePath ? <>{element}</> : null;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { to: string; children: React.ReactNode; activeClassName?: string; }
export const Link: React.FC<LinkProps> = ({ to, children, className, activeClassName = "active-route", onClick, onPointerEnter, onFocus, ...props }) => {
  const { path, navigate } = useRouter();
  const targetPath = isInternalRoute(to) ? new URL(to, window.location.origin).pathname : to;
  const isActive = path === targetPath || (targetPath !== "/" && path.startsWith(targetPath));
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handleClick} onPointerEnter={(event) => { if (event.pointerType === "mouse") prefetchRoute(to); onPointerEnter?.(event); }} onFocus={(event) => { prefetchRoute(to); onFocus?.(event); }} className={`${className || ""} ${isActive ? activeClassName : ""}`} {...props}>{children}</a>;
};
