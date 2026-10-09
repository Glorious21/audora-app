import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Tiny history-API router — enough for Audora's handful of routes
 * without pulling in react-router. Exposes `useRoute()` → { path, navigate }
 * and a <Link> component. Vite's dev server and the Express SPA fallback both
 * serve index.html for unknown paths, so deep links work.
 */
const RouteCtx = createContext({ path: "/", navigate: () => {} });

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (to === window.location.pathname) return;
    window.history[replace ? "replaceState" : "pushState"]({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, []);

  return <RouteCtx.Provider value={{ path, navigate }}>{children}</RouteCtx.Provider>;
}

export const useRoute = () => useContext(RouteCtx);

export function Link({ to, children, className, style, onClick, ...rest }) {
  const { navigate } = useRoute();
  return (
    <a
      href={to}
      className={className}
      style={style}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
