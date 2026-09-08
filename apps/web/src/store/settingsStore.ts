import { create } from "zustand";
import { getSetting, setSetting } from "../db/repository";

const LATEX_RENDERING_KEY = "latexRendering";

interface SettingsState {
  latexRendering: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLatexRendering: (value: boolean) => Promise<void>;
  toggleLatexRendering: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  latexRendering: true,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const latexRendering = await getSetting(LATEX_RENDERING_KEY, true);
    set({ latexRendering, hydrated: true });
  },

  setLatexRendering: async (value) => {
    set({ latexRendering: value });
    await setSetting(LATEX_RENDERING_KEY, value);
  },

  toggleLatexRendering: async () => {
    await get().setLatexRendering(!get().latexRendering);
  },
}));
