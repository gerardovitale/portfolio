import type { APIRoute } from "astro";
import { defaultSiteUrl } from "../lib/meta";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${defaultSiteUrl}/sitemap-index.xml`,
    ].join("\n"),
    {
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    },
  );
