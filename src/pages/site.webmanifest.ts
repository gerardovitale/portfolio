import type { APIRoute } from "astro";
import { getSiteData } from "../data/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const siteData = getSiteData();
  const manifest = {
    name: siteData.person.name,
    short_name: siteData.person.brandMark,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: siteData.theme.themeColor ?? siteData.theme.palette.accent,
    background_color: siteData.theme.palette.background,
    display: "standalone",
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "content-type": "application/manifest+json; charset=utf-8",
    },
  });
};
