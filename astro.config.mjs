import { defineConfig } from "astro/config";
import { readFileSync } from "node:fs";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { parse } from "yaml";

function getConfiguredSiteUrl() {
  const configUrl = new URL("./site.config.en.yml", import.meta.url);
  const rawConfig = readFileSync(configUrl, "utf8");
  const parsedConfig = parse(rawConfig);
  const envSiteUrl = process.env.PUBLIC_SITE_URL?.trim();
  const configuredSiteUrl =
    parsedConfig &&
    typeof parsedConfig === "object" &&
    parsedConfig.seo &&
    typeof parsedConfig.seo === "object"
      ? parsedConfig.seo.siteUrl?.trim()
      : undefined;

  return envSiteUrl || configuredSiteUrl || "https://portfolio.example.com";
}

const site = getConfiguredSiteUrl();

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
