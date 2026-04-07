import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectFilters } from "./ProjectFilters";
import { siteData } from "../data/site";

describe("ProjectFilters", () => {
  it("filters projects by status and search text", async () => {
    const user = userEvent.setup();

    render(<ProjectFilters projects={siteData.projects} />);

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
