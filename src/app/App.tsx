import { Skeleton } from "@chakra-ui/react";
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { useProgressStore } from "../store/progressStore";
import { useSettingsStore } from "../store/settingsStore";

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const LessonPage = lazy(() => import("./pages/LessonPage").then((m) => ({ default: m.LessonPage })));

export function App() {
  const hydrate = useProgressStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    hydrateSettings();
  }, [hydrate, hydrateSettings]);

  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<Skeleton h="60vh" rounded="md" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  );
}
