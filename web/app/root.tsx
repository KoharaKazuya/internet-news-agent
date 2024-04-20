import { type LinksFunction, type MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, type ReactNode } from "react";
import "sanitize.css";
import "sanitize.css/assets.css";
import "sanitize.css/forms.css";
import "sanitize.css/reduce-motion.css";
import "sanitize.css/typography.css";
import AuthGuard from "~/components/AuthGuard";
import ErrorCard from "~/components/ErrorCard";
import NavigationMenu from "~/components/NavigationMenu/NavigationMenu";
import SplashScreen from "~/components/SplashScreen/SplashScreen";
import globalStyles from "./global.css?raw";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export const meta: MetaFunction = () => {
  return [
    { title: "Internet News Agent" },
    { name: "theme-color", content: "#333" },
  ];
};

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/icon192.png",
    type: "image/png",
    sizes: "192x192",
  },
  {
    rel: "manifest",
    href: "/manifest.webmanifest",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <Meta />
        <Links />
        <style>{globalStyles}</style>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return <SplashScreen />;
}

export function ErrorBoundary() {
  return <ErrorCard />;
}

const Notifier = lazy(() => import("~/components/Notifier"));

export default function App() {
  return (
    <AuthGuard>
      <Suspense>
        <Notifier />
      </Suspense>
      <NavigationMenu />
      <Outlet />
    </AuthGuard>
  );
}
