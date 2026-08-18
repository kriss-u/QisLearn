import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/fira-code/400.css";
import "@fontsource/fira-code/500.css";
import { useEffect, type PropsWithChildren, type ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, type MetaFunction } from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { Provider } from "../components/ui/provider";
import { useProgressStore } from "../store/progressStore";
import { useSettingsStore } from "../store/settingsStore";
import { buildPageMeta } from "../lib/seo";
import "../index.css";

// Every route below defines its own complete meta() (title through JSON-LD), which
// replaces this rather than merging with it — this only covers unmatched/error routes.
export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "QisLearn — Learn Quantum Computing with Qiskit",
    description:
      "Interactive, browser-based lessons for learning quantum computing with Qiskit — circuits, the Bloch sphere, statevectors, and hands-on code exercises. No backend, no install, runs entirely in your browser.",
    path: "/",
  });

export function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#081113" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root(): ReactNode {
  const hydrate = useProgressStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    hydrateSettings();
  }, [hydrate, hydrateSettings]);

  return (
    <Provider>
      <AppShell>
        <Outlet />
      </AppShell>
    </Provider>
  );
}
