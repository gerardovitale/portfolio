import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { ExperienceAccordion } from "./ExperienceAccordion";

const duplicateEmployerEntries = [
  {
    company: "Acme",
    role: "Senior Data Engineer",
    period: "2024 - Present",
    location: "Remote",
    summary: "Current role",
    achievements: ["Built release checks", "Improved observability"],
  },
  {
    company: "Acme",
    role: "Data Engineer",
    period: "2022 - 2024",
    location: "Remote",
    summary: "Previous role",
    achievements: ["Shipped pipelines", "Improved tooling"],
  },
];

describe("ExperienceAccordion", () => {
  it("renders all panels open in server markup as a no-js fallback", () => {
    const markup = renderToStaticMarkup(
      <ExperienceAccordion entries={duplicateEmployerEntries} />,
    );

    expect(markup).not.toContain("hidden");
  });

  it("opens only the selected duplicate-employer entry", async () => {
    const user = userEvent.setup();

    render(<ExperienceAccordion entries={duplicateEmployerEntries} />);

    const buttons = screen.getAllByRole("button");
    const [firstButton, secondButton] = buttons;
    const firstPanel = document.getElementById(
      firstButton.getAttribute("aria-controls") ?? "",
    );
    const secondPanel = document.getElementById(
      secondButton.getAttribute("aria-controls") ?? "",
    );

    expect(firstPanel).not.toBeNull();
    expect(secondPanel).not.toBeNull();
    expect(firstPanel?.id).not.toBe(secondPanel?.id);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(secondButton).toHaveAttribute("aria-expanded", "false");

    await user.click(secondButton);

    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(secondButton).toHaveAttribute("aria-expanded", "true");
  });
});
