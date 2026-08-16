import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "semibold",
    borderRadius: "l3",
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
          "radial-gradient(circle at 12% -10%, {colors.quantum.100} 0%, transparent 45%), radial-gradient(circle at 100% 0%, {colors.ember.50} 0%, transparent 40%)",
        _dark:
          "radial-gradient(circle at 12% -10%, {colors.quantum.950} 0%, transparent 45%), radial-gradient(circle at 100% 0%, {colors.ember.900/15} 0%, transparent 40%)",
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
        // Primary brand hue: deep teal/cyan ("quantum blue").
        quantum: {
          50: { value: "#ecfeff" },
          100: { value: "#cffafe" },
          200: { value: "#a5f3fc" },
          300: { value: "#67e8f9" },
          400: { value: "#22d3ee" },
          500: { value: "#06b6d4" },
          600: { value: "#0e8fa8" },
          700: { value: "#0c7488" },
          800: { value: "#105e6e" },
          900: { value: "#134e5c" },
          950: { value: "#08272e" },
        },
        // Secondary accent: warm ember/copper, used sparingly for contrast.
        ember: {
          50: { value: "#fff4ed" },
          100: { value: "#ffe4d3" },
          200: { value: "#ffc4a3" },
          300: { value: "#ff9d69" },
          400: { value: "#fb7a3c" },
          500: { value: "#f2591a" },
          600: { value: "#d43f0f" },
          700: { value: "#af2f10" },
          800: { value: "#8c2814" },
          900: { value: "#722413" },
          950: { value: "#3d0f07" },
        },
      },
      fonts: {
        heading: { value: "'IBM Plex Sans', system-ui, sans-serif" },
        body: { value: "'IBM Plex Sans', system-ui, sans-serif" },
        mono: { value: "'Fira Code', ui-monospace, monospace" },
      },
      shadows: {
        glow: {
          value: "0 0 0 1px {colors.quantum.500/40}, 0 8px 24px -8px {colors.quantum.500/50}",
        },
      },
    },
    semanticTokens: {
      colors: {
        quantum: {
          solid: { value: "{colors.quantum.600}" },
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.quantum.700}", _dark: "{colors.quantum.300}" } },
          muted: { value: { _light: "{colors.quantum.100}", _dark: "{colors.quantum.950}" } },
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
          DEFAULT: { value: { _light: "white", _dark: "#081113" } },
          subtle: { value: { _light: "{colors.gray.50}", _dark: "#0b1518" } },
          muted: { value: { _light: "{colors.gray.100}", _dark: "#101c1f" } },
          panel: { value: { _light: "white", _dark: "#0e1a1d" } },
        },
        border: {
          DEFAULT: { value: { _light: "{colors.gray.200}", _dark: "#1c2c30" } },
          muted: { value: { _light: "{colors.gray.100}", _dark: "#152225" } },
          subtle: { value: { _light: "{colors.gray.50}", _dark: "#101a1c" } },
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
