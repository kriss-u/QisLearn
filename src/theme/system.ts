import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "semibold",
    borderRadius: "l2",
    transition: "transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
    _active: { transform: "scale(0.97)" },
  },
});

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "bg",
      colorPalette: "quantum",
      scrollBehavior: "smooth",
    },
    body: {
      backgroundImage: {
        _light:
          "radial-gradient(circle at 12% -10%, {colors.quantum.100/25} 0%, transparent 45%), radial-gradient(circle at 100% 0%, {colors.violetAccent.100/20} 0%, transparent 40%)",
        _dark:
          "radial-gradient(circle at 12% -10%, {colors.quantum.900/18} 0%, transparent 45%), radial-gradient(circle at 100% 0%, {colors.violetAccent.900/12} 0%, transparent 40%)",
      },
      backgroundAttachment: "fixed",
    },
    "::selection": {
      bg: "colorPalette.muted",
      color: "colorPalette.fg",
    },
    "h1, h2, h3, h4, h5, h6": {
      letterSpacing: "-0.02em",
    },
    ".katex": {
      fontSize: "1.05em",
    },
  },
  theme: {
    tokens: {
      colors: {
        // Neutral scale (Tailwind "zinc") — backs bg/border only, not the brand color.
        neutral: {
          50: { value: "#fafafa" },
          100: { value: "#f4f4f5" },
          200: { value: "#e4e4e7" },
          300: { value: "#d4d4d8" },
          400: { value: "#a1a1aa" },
          500: { value: "#71717a" },
          600: { value: "#52525b" },
          700: { value: "#3f3f46" },
          800: { value: "#27272a" },
          900: { value: "#18181b" },
          950: { value: "#09090b" },
        },
        // Primary brand hue (Tailwind "indigo") — matches krishnaupadhyay.com.np.
        quantum: {
          50: { value: "#eef2ff" },
          100: { value: "#e0e7ff" },
          200: { value: "#c7d2fe" },
          300: { value: "#a5b4fc" },
          400: { value: "#818cf8" },
          500: { value: "#6366f1" },
          600: { value: "#4f46e5" },
          700: { value: "#4338ca" },
          800: { value: "#3730a3" },
          900: { value: "#312e81" },
          950: { value: "#1e1b4b" },
        },
        // Gradient partner for the brand hue (Tailwind "violet") — same site, indigo→violet accent gradient.
        violetAccent: {
          50: { value: "#f5f3ff" },
          100: { value: "#ede9fe" },
          200: { value: "#ddd6fe" },
          300: { value: "#c4b5fd" },
          400: { value: "#a78bfa" },
          500: { value: "#8b5cf6" },
          600: { value: "#7c3aed" },
          700: { value: "#6d28d9" },
          800: { value: "#5b21b6" },
          900: { value: "#4c1d95" },
          950: { value: "#2e1065" },
        },
        // Secondary accent, used sparingly for status/contrast (Tailwind "amber").
        ember: {
          50: { value: "#fffbeb" },
          100: { value: "#fef3c7" },
          200: { value: "#fde68a" },
          300: { value: "#fcd34d" },
          400: { value: "#fbbf24" },
          500: { value: "#f59e0b" },
          600: { value: "#d97706" },
          700: { value: "#b45309" },
          800: { value: "#92400e" },
          900: { value: "#78350f" },
          950: { value: "#451a03" },
        },
      },
      fonts: {
        heading: { value: "'IBM Plex Sans', system-ui, sans-serif" },
        body: { value: "'IBM Plex Sans', system-ui, sans-serif" },
        mono: { value: "'Fira Code', ui-monospace, monospace" },
      },
      shadows: {
        glow: {
          value: "0 0 0 1px {colors.quantum.500/25}, 0 8px 28px -8px {colors.violetAccent.500/35}",
        },
        glass: {
          value: "0 1px 1px {colors.neutral.900/5}, 0 8px 24px -12px {colors.neutral.900/25}",
        },
      },
    },
    semanticTokens: {
      colors: {
        quantum: {
          solid: { value: { _light: "{colors.quantum.600}", _dark: "{colors.quantum.500}" } },
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.quantum.700}", _dark: "{colors.quantum.300}" } },
          muted: { value: { _light: "{colors.quantum.100}", _dark: "{colors.quantum.900}" } },
          subtle: { value: { _light: "{colors.quantum.50}", _dark: "{colors.quantum.950}" } },
          emphasized: { value: { _light: "{colors.quantum.300}", _dark: "{colors.quantum.700}" } },
          focusRing: { value: "{colors.quantum.500}" },
        },
        ember: {
          solid: { value: "{colors.ember.600}" },
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.ember.700}", _dark: "{colors.ember.300}" } },
          muted: { value: { _light: "{colors.ember.100}", _dark: "{colors.ember.900}" } },
          subtle: { value: { _light: "{colors.ember.50}", _dark: "{colors.ember.950}" } },
          emphasized: { value: { _light: "{colors.ember.300}", _dark: "{colors.ember.700}" } },
        },
        bg: {
          DEFAULT: { value: { _light: "white", _dark: "{colors.neutral.950}" } },
          subtle: { value: { _light: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
          muted: { value: { _light: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
          panel: { value: { _light: "white", _dark: "{colors.neutral.900}" } },
          glass: { value: { _light: "{colors.white/70}", _dark: "{colors.neutral.900/55}" } },
        },
        border: {
          DEFAULT: { value: { _light: "{colors.neutral.200}", _dark: "{colors.neutral.800}" } },
          muted: { value: { _light: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
          subtle: { value: { _light: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
          glass: { value: { _light: "{colors.white/60}", _dark: "{colors.neutral.50/8}" } },
        },
      },
      radii: {
        l1: { value: "{radii.sm}" },
        l2: { value: "{radii.lg}" },
        l3: { value: "{radii.xl}" },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
