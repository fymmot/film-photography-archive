import type { Config } from "tailwindcss";

import typography from "@tailwindcss/typography";
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      screens: {
        xs: "23.4375rem",
      },
    },
    fontFamily: {
      mono: ["Courier Prime", "Courier", "monospace"],
    },
  },

  plugins: [typography],
} as Config;
