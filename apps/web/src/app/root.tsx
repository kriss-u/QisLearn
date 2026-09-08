import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/fira-code/400.css";
import "@fontsource/fira-code/500.css";
import { ApolloProvider } from "@apollo/client";
import { useEffect, useMemo, type PropsWithChildren, type ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, type MetaFunction } from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { Provider } from "../components/ui/provider";
import { getTracks } from "../content";
import { createApolloClient } from "../lib/apolloClient";
import { useProgressSync } from "../store/useProgressSync";
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

// Sitewide nav data (AppShell's sidebar) needed on every route, fetched once
// per request here rather than duplicated in each page's own loader.
export async function loader() {
  return { tracks: await getTracks() };
}

export function Layout({ children }: PropsWithChildren) {
  return (
    // next-themes sets class/style on <html> client-side (before paint, via
    // an injected script) to avoid a flash of the wrong theme — that's
    // expected to differ from the server-rendered markup, which doesn't
    // know the visitor's preference yet. suppressHydrationWarning tells
    // React that's intentional for this one element, not a real bug.
    <html lang="en" suppressHydrationWarning>
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

// useProgressSync() needs useApolloClient() from context, so its hydrate()
// call has to happen from a component rendered *inside* <ApolloProvider>,
// not from Root itself (Root creates that provider, it isn't wrapped by it).
function ProgressHydrator() {
  const { hydrate } = useProgressSync();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export default function Root(): ReactNode {
  const { tracks } = useLoaderData<typeof loader>();
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  // Fresh per request on the server, stable for the session in the browser
  // — see apolloClient.ts. This provider is for client-initiated hooks
  // (mutations, future interactive queries); page data still comes from
  // route loaders via useLoaderData, not from this client.
  const apolloClient = useMemo(() => createApolloClient(), []);

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  return (
    <ApolloProvider client={apolloClient}>
      <ProgressHydrator />
      <Provider>
        <AppShell tracks={tracks}>
          <Outlet />
        </AppShell>
      </Provider>
    </ApolloProvider>
  );
}
