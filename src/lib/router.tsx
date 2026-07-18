import React, { createContext, useContext, useState, useEffect } from "react";

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We use hash routing for absolute compatibility in container sandboxes and iframes.
  // Hash format: '#/' or '#/free-trial'
  const [path, setPath] = useState<string>(() => {
    const hash = window.location.hash;
    if (!hash) return "/";
    return hash.replace(/^#/, "") || "/";
  });

  const navigate = (to: string) => {
    // Clean potential duplicate hashes
    const cleanPath = to.startsWith("#") ? to.replace(/^#/, "") : to;
    window.location.hash = cleanPath;
    setPath(cleanPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const currentPath = hash.replace(/^#/, "") || "/";
      setPath(currentPath);
      window.scrollTo({ top: 0, behavior: "instant" });
    };

    window.addEventListener("hashchange", handleHashChange);
    
    // If no initial hash, set it to home
    if (!window.location.hash) {
      window.location.hash = "/";
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
};

interface RouteProps {
  path: string;
  element: React.ReactNode;
}

export const Route: React.FC<RouteProps> = ({ path: routePath, element }) => {
  const { path } = useRouter();
  
  // Exact match or sub-route prefix match depending on depth
  const isMatch = path === routePath || (routePath !== "/" && path.startsWith(routePath));
  
  if (isMatch) {
    return <>{element}</>;
  }
  
  return null;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  activeClassName?: string;
}

export const Link: React.FC<LinkProps> = ({ to, children, className, activeClassName = "active-route", ...props }) => {
  const { path, navigate } = useRouter();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
  };
  
  const isActive = path === to || (to !== "/" && path.startsWith(to));

  return (
    <a
      href={`#${to}`}
      onClick={handleClick}
      className={`${className || ""} ${isActive ? activeClassName : ""}`}
      {...props}
    >
      {children}
    </a>
  );
};
