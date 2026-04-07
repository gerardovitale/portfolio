import { startTransition, useDeferredValue, useState } from "react";
import type { Project } from "../data/site";

type Props = {
  projects: Project[];
  searchPlaceholder: string;
};

export function ProjectFilters({ projects, searchPlaceholder }: Props) {
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

  return (
    <div className="filters-shell card">
      <div className="card-body stack">
        <div className="toolbar">
          <label className="search">
            <span className="sr-only">Search projects</span>
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
            aria-label="Project status filters"
          >
            {["all", "featured", "live", "exploration"].map((status) => (
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
                {status}
              </button>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="muted">
          Showing {visibleProjects.length} project
          {visibleProjects.length === 1 ? "" : "s"}.
        </p>

        <div className="grid">
          {visibleProjects.map((project) => (
            <article key={project.slug} className="project-card">
              <div className="project-meta">
                <span className="pill">{project.status}</span>
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
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel="noreferrer"
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
