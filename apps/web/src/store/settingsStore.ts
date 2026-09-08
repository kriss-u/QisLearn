import { create } from "zustand";

const LATEX_RENDERING_KEY = "qislearn:latexRendering";

interface SettingsState {
  latexRendering: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLatexRendering: (value: boolean) => Promise<void>;
  toggleLatexRendering: () => Promise<void>;
}

// A display preference, not server-side user data — stays in localStorage
// (per-browser, like it always was) rather than moving to Postgres with the
// rest of the Dexie-backed state. hydrate()/hydrated stay async-shaped for
// parity with the old Dexie-backed version and so root.tsx's call site
// doesn't need to change.
export const useSettingsStore = create<SettingsState>((set, get) => ({
  latexRendering: true,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    let latexRendering = true;
    try {
      const raw = window.localStorage.getItem(LATEX_RENDERING_KEY);
      if (raw !== null) latexRendering = raw === "true";
    } catch {
      // localStorage unavailable (private mode, blocked) — fall back to the default.
    }
    set({ latexRendering, hydrated: true });
  },

  setLatexRendering: async (value) => {
    set({ latexRendering: value });
    try {
      window.localStorage.setItem(LATEX_RENDERING_KEY, String(value));
    } catch {
      // Ignore — see hydrate() above.
    }
  },

  toggleLatexRendering: async () => {
    await get().setLatexRendering(!get().latexRendering);
  },
}));
