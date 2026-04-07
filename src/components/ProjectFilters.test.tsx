import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectFilters } from "./ProjectFilters";
import type { Project } from "../data/site";

const sampleProjects: Project[] = [
  {
    slug: "zen-portfolio",
    title: "Zen Python Portfolio",
    summary: "Editorial portfolio system",
    status: "featured",
    year: "2026",
    tags: ["Astro", "TypeScript"],
    highlights: ["Converted design concepts", "Shipped static deployment"],
    links: [{ label: "View project", href: "/projects", external: false }],
  },
  {
    slug: "trip-optimizer",
    title: "Trip Planner and Optimizer",
    summary: "Route planning product concept",
    status: "live",
    year: "2026",
    tags: ["Maps", "Optimization"],
    highlights: ["Balanced dense information", "Improved comparison flows"],
    links: [{ label: "View project", href: "/projects", external: false }],
  },
  {
    slug: "pipeline-observatory",
    title: "Pipeline Observatory",
    summary: "Operational pipeline tracking",
    status: "exploration",
    year: "2025",
    tags: ["Observability", "Operations"],
    highlights: ["Centered triage", "Made failure states obvious"],
    links: [{ label: "View project", href: "/projects", external: false }],
  },
];

describe("ProjectFilters", () => {
  it("filters projects by status and search text", async () => {
    const user = userEvent.setup();

    render(
      <ProjectFilters
        projects={sampleProjects}
        searchPlaceholder="Search by title, stack, or summary"
      />,
    );

    expect(screen.getByText("Zen Python Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Trip Planner and Optimizer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "featured" }));

    expect(screen.getByText("Zen Python Portfolio")).toBeInTheDocument();
    expect(
      screen.queryByText("Trip Planner and Optimizer"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "all" }));
    await user.type(
      screen.getByRole("searchbox", { name: /search projects/i }),
      "observatory",
    );

    expect(screen.getByText("Pipeline Observatory")).toBeInTheDocument();
    expect(screen.queryByText("Zen Python Portfolio")).not.toBeInTheDocument();
  });
});
