import { startTransition, useDeferredValue, useState } from "react";
import type { Project, ProjectsSection } from "../data/site";
import type { Locale } from "../lib/locale";
import { localizeContentHref } from "../lib/routing";

type Props = {
  locale: Locale;
  projects: Project[];
  searchLabel: string;
  searchPlaceholder: string;
  statusToolbarLabel: string;
  statusLabels: ProjectsSection["interaction"]["statusLabels"];
  resultsPrefix: string;
  resultNounSingular: string;
  resultNounPlural: string;
};

const statusOrder: Array<keyof ProjectsSection["interaction"]["statusLabels"]> =
  ["all", "featured", "live", "exploration"];

export function ProjectFilters({
  locale,
  projects,
  searchLabel,
  searchPlaceholder,
  statusToolbarLabel,
  statusLabels,
  resultsPrefix,
  resultNounSingular,
  resultNounPlural,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | Project["status"]
  >("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const visibleProjects = projects.filter((project) => {
    const statusMatch =
      selectedStatus === "all" || project.status === selectedStatus;
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const queryMatch =
      normalizedQuery.length === 0 ||
      `${project.title} ${project.summary} ${project.tags.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery);

    return statusMatch && queryMatch;
  });

  const resultNoun =
    visibleProjects.length === 1 ? resultNounSingular : resultNounPlural;

  return (
    <div className="filters-shell card">
      <div className="card-body stack">
        <div className="toolbar">
          <label className="search">
            <span className="sr-only">{searchLabel}</span>
            <input
              type="search"
              name="project-search"
              value={query}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                startTransition(() => setQuery(nextValue));
              }}
              placeholder={searchPlaceholder}
            />
          </label>

          <div
            className="filter-group"
            role="toolbar"
            aria-label={statusToolbarLabel}
          >
            {statusOrder.map((status) => (
              <button
                key={status}
                type="button"
                className={
                  status === selectedStatus
                    ? "filter-chip is-active"
                    : "filter-chip"
                }
                onClick={() => {
                  startTransition(() =>
                    setSelectedStatus(status as "all" | Project["status"]),
                  );
                }}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="muted">
          {resultsPrefix} {visibleProjects.length} {resultNoun}.
        </p>

        <div className="grid">
          {visibleProjects.map((project) => (
            <article key={project.slug} className="project-card">
              <div className="project-meta">
                <span className="pill">{statusLabels[project.status]}</span>
                <span className="muted">{project.year}</span>
              </div>
              <h2>{project.title}</h2>
              <p className="muted">{project.summary}</p>
              <ul className="project-highlights">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="link-row">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    className="button-secondary"
                    href={localizeContentHref(
                      link.href,
                      locale,
                      link.localized,
                    )}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer noopener" : undefined}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
