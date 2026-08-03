import { createBrowserRouter, type RouteObject } from "react-router-dom";
import type { ComponentType } from "react";

type PageModule = {
  default: ComponentType;
};

const pages = import.meta.glob<PageModule>("./pages/**/page.tsx");

const appRoutes: RouteObject[] = [];
const standaloneRoutes: RouteObject[] = [];

const createLazyRoute = (loadPage: () => Promise<PageModule>) => async () => {
  const page = await loadPage();

  return { Component: page.default };
};

for (const [path, loadPage] of Object.entries(pages)) {
  const lazy = createLazyRoute(loadPage);

  // 1. Convert file path to route
  let routePath = path
    .replace("./pages", "")
    .replace("/page.tsx", "");

  const isStandalone = routePath.includes("/standalone/");

  routePath = routePath
    .replace("/standalone", "")
    .replace("/app", "")
    .replace(/^\/(project|global)(?=\/|$)/, ""); // strip group segment (project/global)

  const normalizePath = routePath.length === 0 ? "/" : routePath;

  // 2. Preview is the default route inside AppLayout, while remaining available at /preview.
  const isDefaultAppRoute = !isStandalone && normalizePath === "/preview";

  if (isDefaultAppRoute) {
    appRoutes.push({ index: true, lazy });
  }

  const route: RouteObject = { path: normalizePath, lazy };

  // 3. Classification
  if (isStandalone) {
    standaloneRoutes.push(route);
  } else {
    appRoutes.push(route);
  }
}

export const Router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const layout = await import("./pages/app/layout/AppLayout");

      return { Component: layout.default };
    },
    children: appRoutes,
  },
  {
    lazy: async () => {
      const layout = await import("./pages/standalone/layout/AppLayout");

      return { Component: layout.default };
    },
    children: standaloneRoutes,
  }
]);
