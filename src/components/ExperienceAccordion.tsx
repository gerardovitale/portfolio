import { startTransition, useState } from "react";
import type { ExperienceEntry } from "../data/site";
import { makeExperienceEntryId } from "../lib/routing";

type Props = {
  entries: ExperienceEntry[];
};

export function ExperienceAccordion({ entries }: Props) {
  const [activeEntryId, setActiveEntryId] = useState(
    entries[0] ? makeExperienceEntryId(entries[0], 0) : "",
  );

  return (
    <div className="experience-accordion">
      {entries.map((entry, index) => {
        const panelId = makeExperienceEntryId(entry, index);
        const isOpen = panelId === activeEntryId;

        return (
          <article key={panelId} className="card">
            <button
              type="button"
              className="experience-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => {
                startTransition(() => setActiveEntryId(isOpen ? "" : panelId));
              }}
            >
              <span>
                <span className="eyebrow">{entry.period}</span>
                <strong>{entry.role}</strong>
              </span>
              <span className="muted">{entry.company}</span>
            </button>

            <div id={panelId} hidden={!isOpen} className="experience-panel">
              <div className="card-body stack">
                <p className="muted">
                  {entry.location} · {entry.summary}
                </p>
                <ul className="project-highlights">
                  {entry.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
