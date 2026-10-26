import { useMemo, useRef } from "react";
import {
  DND_MIME,
  getStatColor,
  searchResults,
  type DragPayload,
} from "../data";
import { usePlan } from "../planContext";

function MetricTag({
  value,
  reverse = false,
}: {
  value: number | null;
  reverse?: boolean;
}) {
  if (value == null) {
    return <span style={{ color: "#b0b0b0" }}>—</span>;
  }
  const bg = getStatColor(value, reverse);
  return (
    <span className="tag" style={{ background: bg }}>
      {value.toFixed(1)}
    </span>
  );
}

export function SearchPanel() {
  const {
    searchQuery,
    setSearchQuery,
    setSearchOpen,
    setDragging,
    moveCourseToDock,
    showToast,
    dock,
    semesters,
    openInfo,
  } = usePlan();
  const hoverTimer = useRef<number | null>(null);

  const planned = useMemo(() => {
    const set = new Set<string>();
    for (const s of semesters) for (const c of s.courses) set.add(c.code);
    for (const d of dock) set.add(d);
    return set;
  }, [semesters, dock]);

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchResults.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className="panel panel-search">
      <header className="panel-header" style={{ fontSize: "1.25rem" }}>
        <div className="panel-header-title">Search</div>
        <button
          className="top-bar-btn icon-only"
          type="button"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <i className="fas fa-times" />
        </button>
      </header>
      <div className="panel-body search-body">
        <label className="search-input-wrap">
          <i className="fas fa-search fa-lg" />
          <input
            type="search"
            placeholder="Search for a course!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </label>

        <div className="search-table-head">
          <span>COURSE</span>
          <span>QUAL</span>
          <span>DIFF</span>
          <span className="search-head-add" />
        </div>

        <div className="search-results">
          {results.map((r) => {
            const used = planned.has(r.code);
            return (
              <div
                key={r.code}
                className={`search-row ${used ? "used" : ""}`}
                draggable
                role="button"
                tabIndex={0}
                onDragStart={(e) => {
                  const payload: DragPayload = {
                    from: "search",
                    code: r.code,
                  };
                  e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
                  e.dataTransfer.effectAllowed = "copyMove";
                  setDragging(payload);
                }}
                onDragEnd={() => setDragging(null)}
                onMouseEnter={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = window.setTimeout(() => {
                    openInfo(r.code, rect, null);
                  }, 200);
                }}
                onMouseLeave={() => {
                  if (hoverTimer.current) {
                    window.clearTimeout(hoverTimer.current);
                    hoverTimer.current = null;
                  }
                }}
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  openInfo(r.code, rect, null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    openInfo(r.code, rect, null);
                  }
                }}
              >
                <span className="search-row-course">
                  <strong>{r.code}</strong>
                  <small>{r.title}</small>
                </span>
                <span className="search-metric">
                  <MetricTag value={r.qual} />
                </span>
                <span className="search-metric">
                  <MetricTag value={r.diff} reverse />
                </span>
                <button
                  type="button"
                  className="search-add-btn"
                  aria-label={
                    used
                      ? `${r.code} is already in your plan`
                      : `Add ${r.code} to plan`
                  }
                  title={used ? "Already in plan" : "Add to dock"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (used) {
                      showToast(`${r.code} is already in your plan`);
                      return;
                    }
                    if (moveCourseToDock(r.code)) {
                      showToast(`Added ${r.code} to dock`);
                    }
                  }}
                >
                  <i
                    className={`fas ${used ? "fa-check" : "fa-plus"}`}
                    aria-hidden
                  />
                </button>
              </div>
            );
          })}
          {searchQuery && results.length === 0 && (
            <div className="search-empty">No courses found.</div>
          )}
          {!searchQuery && (
            <div className="search-empty">Search for a course!</div>
          )}
        </div>
      </div>
    </section>
  );
}
