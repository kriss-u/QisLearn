import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/fira-code/400.css";
import "@fontsource/fira-code/500.css";
import { ApolloProvider } from "@apollo/client";
import { useEffect, useMemo, type PropsWithChildren, type ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { Provider } from "../components/ui/provider";
import { getCourseGroups } from "../content";
import { createApolloClient } from "../lib/apolloClient";
import { useProgressSync } from "../store/useProgressSync";
import { useSettingsStore } from "../store/settingsStore";
import { buildPageMeta } from "../lib/seo";
import "../index.css";

// Every route below defines its own complete meta() (title through JSON-LD), which
// replaces this rather than merging with it — this only covers unmatched/error routes.
export const meta: MetaFunction = () =>
  buildPageMeta({
    title: "QisLearn",
    description: "Interactive, browser-based courses — no install required.",
    path: "/",
  });

// Sitewide nav data (AppShell's sidebar) needed on every route, fetched once
// per request here rather than duplicated in each page's own loader. This
// wraps every route including /login itself, so it must never hard-fail a
// signed-out visitor the way HomePage/LessonPage's own loaders do — an
// empty sidebar for a logged-out visitor is fine, a redirect loop is not.
export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("cookie") ?? undefined;
  const courses = await getCourseGroups(cookie).catch(() => []);
  return { courses };
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
  const { courses } = useLoaderData<typeof loader>();
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  // Fresh per request on the server, stable for the session in the browser
  // — see apolloClient.ts. This provider is for client-initiated hooks
  // (mutations, future interactive queries); page data still comes from
  // route loaders via useLoaderData, not from this client.
  const apolloClient = useMemo(() => createApolloClient(), []);
  // /admin gets its own shell (AdminLayout -> AdminShell), not the student
  // AppShell's sidebar/nav — route id comes from the file path relative to
  // app/ that routes.ts points "admin" at.
  const matches = useMatches();
  const isAdmin = matches.some((m) => m.id.includes("pages/admin/AdminLayout"));
  // Login/signup, the course-selection screen, and the home dashboard are
  // their own standalone screens, not the learning app's sidebar shell —
  // the sidebar only makes sense once you're actually inside a course
  // (CourseHomePage, LessonPage), not on the "which course" landing page
  // itself. Profile intentionally keeps the normal shell.
  const isBareScreen = matches.some(
    (m) =>
      m.id.includes("pages/LoginPage") ||
      m.id.includes("pages/SignupPage") ||
      m.id.includes("pages/CoursesPage") ||
      m.id.includes("pages/HomePage"),
  );

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  return (
    <ApolloProvider client={apolloClient}>
      <ProgressHydrator />
      <Provider>
        {isAdmin || isBareScreen ? (
          <Outlet />
        ) : (
          <AppShell courses={courses}>
            <Outlet />
          </AppShell>
        )}
      </Provider>
    </ApolloProvider>
  );
}
