import { execFileSync } from "node:child_process";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:18081";

const routes = [
  "/",
  "/projects",
  "/projects/",
  "/experience",
  "/experience/",
  "/interests",
  "/interests/",
  "/es",
  "/es/projects",
  "/es/projects/",
  "/es/experience",
  "/es/experience/",
  "/es/interests",
  "/es/interests/",
];

async function assertRoute(route) {
  const headers = execFileSync("curl", ["-I", "-sS", `${baseUrl}${route}`], {
    encoding: "utf8",
  });
  const [statusLine, ...headerLines] = headers.trim().split("\n");
  const status = Number(statusLine.split(/\s+/, 3)[1]);
  const location = headerLines
    .find((line) => line.toLowerCase().startsWith("location:"))
    ?.slice("location:".length)
    .trim();

  if (status !== 200) {
    throw new Error(`Expected 200 for ${route}, got ${status}`);
  }

  if (location && /:8081(?:\/|$)/i.test(location)) {
    throw new Error(
      `Unexpected internal port leaked in redirect headers for ${route}: ${location}`,
    );
  }
}

for (const route of routes) {
  await assertRoute(route);
}

const homeHtml = execFileSync("curl", ["-sS", `${baseUrl}/`], {
  encoding: "utf8",
});

for (const href of [
  'href="/projects"',
  'href="/experience"',
  'href="/interests"',
  'href="/es"',
]) {
  if (!homeHtml.includes(href)) {
    throw new Error(`Expected homepage HTML to include ${href}`);
  }
}

if (/href="https?:\/\/[^"]*:8081/i.test(homeHtml)) {
  throw new Error("Unexpected absolute href leaking :8081 in homepage HTML");
}
