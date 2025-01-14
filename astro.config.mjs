// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
// import AstroPWA from "@vite-pwa/astro";
import yaml from "@rollup/plugin-yaml";

// import netlify from "@astrojs/netlify";

import icon from "astro-icon";

import sitemap from "@astrojs/sitemap";

import removeOriginalImages from "./src/lib/integration";

import image from "@jcayzac/astro-image-service-ng";

import webmanifest from "astro-webmanifest";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://your-domain.com/",
  legacy: {
    collections: true,
  },
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    tailwind(),
    icon(),
    sitemap(),
    image({
      defaultFormat: "webp",
    }),
    removeOriginalImages(),
    webmanifest({
      /**
       * required
       **/
      name: "Film Photography Archive",
      /**
       * optional
       **/
      icon: "public/favicon.svg", // source for favicon & icons

      short_name: "Film Photography Archive",
      description: "Personal film photography archive",
      start_url: "/",
      theme_color: "#000000",
      background_color: "#000000",
      display: "standalone",
    }),
  ],

  vite: {
    plugins: [yaml()],
  },
});
