import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const site = process.env.PUBLIC_SITE_URL ?? "https://portfolio.example.com";

export default defineConfig({
  site,
  output: "static",
  integrations: [react(), sitemap()],
  scopedStyleStrategy: "where",
  vite: {
    server: {
      host: true,
    },
  },
});
