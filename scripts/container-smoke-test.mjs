import { execFileSync } from "node:child_process";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:18081";

const routes = [
  { route: "/", status: 200 },
  { route: "/es", status: 200 },
  { route: "/projects", status: 301, location: "/#projects" },
  { route: "/projects/", status: 301, location: "/#projects" },
  { route: "/experience", status: 301, location: "/#experience" },
  { route: "/experience/", status: 301, location: "/#experience" },
  { route: "/interests", status: 301, location: "/#interests" },
  { route: "/interests/", status: 301, location: "/#interests" },
  { route: "/es/projects", status: 301, location: "/es#projects" },
  { route: "/es/projects/", status: 301, location: "/es#projects" },
  { route: "/es/experience", status: 301, location: "/es#experience" },
  { route: "/es/experience/", status: 301, location: "/es#experience" },
  { route: "/es/interests", status: 301, location: "/es#interests" },
  { route: "/es/interests/", status: 301, location: "/es#interests" },
];

async function assertRoute({
  route,
  status: expectedStatus,
  location: expectedLocation,
}) {
  const headers = execFileSync("curl", ["-I", "-sS", `${baseUrl}${route}`], {
    encoding: "utf8",
  });
  const [statusLine, ...headerLines] = headers.trim().split("\n");
  const status = Number(statusLine.split(/\s+/, 3)[1]);
  const location = headerLines
    .find((line) => line.toLowerCase().startsWith("location:"))
    ?.slice("location:".length)
    .trim();

  if (status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} for ${route}, got ${status}`);
  }

  if (expectedLocation && location !== expectedLocation) {
    throw new Error(
      `Expected redirect for ${route} to ${expectedLocation}, got ${location ?? "none"}`,
    );
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
  'href="/#home"',
  'href="/#projects"',
  'href="/#experience"',
  'href="/#interests"',
  'href="/es"',
]) {
  if (!homeHtml.includes(href)) {
    throw new Error(`Expected homepage HTML to include ${href}`);
  }
}

if (/href="https?:\/\/[^"]*:8081/i.test(homeHtml)) {
  throw new Error("Unexpected absolute href leaking :8081 in homepage HTML");
}
