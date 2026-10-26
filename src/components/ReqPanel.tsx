import { useRef, useState } from "react";
import { programToneClass, useCourseProgramTone } from "../courseProgram";
import { DND_MIME, type DragPayload } from "../data";
import { usePlan, type ReqLeafView } from "../planContext";
import { CourseCard } from "./CourseCard";
import { useCountsFor } from "./CountsForPopup";

function LeafProgress({ leaf }: { leaf: ReqLeafView }) {
  if (leaf.credits != null) {
    const cus = leaf.cus ?? 0;
    const label = leaf.credits > 1 ? "cus" : "cu";
    return (
      <span className="leaf-progress leaf-progress-cus">
        {cus} / {leaf.credits}
        <sub>{label}</sub>
      </span>
    );
  }
  return <span className="leaf-progress">{leaf.progress}</span>;
}

function SearchCondition({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="search-condition" onClick={onClick}>
      <span className="search-condition-label">
        <i className="fas fa-search fa-sm" />
        Search
      </span>
    </button>
  );
}

function OptionChip({ code }: { code: string }) {
  const {
    openSearch,
    openInfo,
    closeInfo,
    openCountsFor,
    closeCountsFor,
    infoPanel,
    countsForPanel,
    setDragging,
    getCourse,
    courseIndex,
    semesters,
  } = usePlan();
  const tone = useCourseProgramTone(code);
  const countsFor = useCountsFor(code);
  const [didDrag, setDidDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const active = infoPanel?.code === code || countsForPanel?.code === code;

  const semesterLabel = (() => {
    const loc = courseIndex.get(code);
    if (loc?.kind === "semester" && loc.semesterId) {
      return semesters.find((s) => s.id === loc.semesterId)?.label ?? null;
    }
    return null;
  })();

  const showReview = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) {
      openSearch(code);
      return;
    }
    if (infoPanel?.code === code) {
      closeInfo();
      return;
    }
    closeCountsFor();
    if (getCourse(code)) {
      openInfo(code, rect, semesterLabel);
    } else {
      openSearch(code);
    }
  };

  const showCountsFor = () => {
    const rect =
      infoBtnRef.current?.getBoundingClientRect() ??
      ref.current?.getBoundingClientRect();
    if (!rect) return;
    if (countsForPanel?.code === code) {
      closeCountsFor();
      return;
    }
    if (countsFor.currently.length > 0 || countsFor.couldAlso.length > 0) {
      closeInfo();
      openCountsFor(code, rect);
      return;
    }
    showReview();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`option-chip ${active ? "info-active" : ""} ${programToneClass(tone)}`.trim()}
      ref={ref}
      draggable
      onDragStart={(e) => {
        const payload: DragPayload = { from: "search", code };
        e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "copyMove";
        setDidDrag(true);
        setDragging(payload);
      }}
      onDragEnd={() => {
        setDragging(null);
        window.setTimeout(() => setDidDrag(false), 0);
      }}
      onClick={() => {
        if (didDrag) return;
        showReview();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showReview();
        }
      }}
    >
      <span className="option-chip-code">{code}</span>
      <span className="course-actions">
        <button
          ref={infoBtnRef}
          type="button"
          className="course-info"
          aria-label={`Info ${code}`}
          onClick={(e) => {
            e.stopPropagation();
            showCountsFor();
          }}
        >
          <i className="fas fa-info-circle" />
        </button>
      </span>
    </div>
  );
}

function LeafRow({
  leaf,
  programId,
}: {
  leaf: ReqLeafView;
  programId: "degree" | "major";
}) {
  const { openSearch, removeFromSemester, courseIndex } = usePlan();
  const isOpenSearch = Boolean(leaf.allowSearch && leaf.options.length === 0);

  return (
    <div className={`leaf program-${programId}`}>
      <div className="leaf-main">
        <div className="leaf-title-row">
          <span className="leaf-title">{leaf.title}</span>
          <div className="leaf-status">
            {leaf.check && <i className="fas fa-check-circle" />}
            <LeafProgress leaf={leaf} />
          </div>
        </div>
        <div className="leaf-courses alternatives">
          {leaf.options.map((option) => {
            if (option.selected) {
              return (
                <CourseCard
                  key={option.code}
                  code={option.code}
                  selected
                  season={option.season}
                  yearShort={option.yearShort}
                  showActions
                  className="req-fulfilled compact"
                  dragFrom={{
                    from: "semester",
                    code: option.code,
                    semesterId: courseIndex.get(option.code)?.semesterId,
                  }}
                  onRemove={() => {
                    const loc = courseIndex.get(option.code);
                    if (loc?.kind === "semester" && loc.semesterId) {
                      removeFromSemester(option.code, loc.semesterId);
                    }
                  }}
                />
              );
            }

            return <OptionChip key={option.code} code={option.code} />;
          })}
          {isOpenSearch && (
            <SearchCondition onClick={() => openSearch("")} />
          )}
          {leaf.allowSearch && !leaf.check && leaf.options.length > 0 && (
            <button
              type="button"
              className="search-chip"
              onClick={() => openSearch("")}
            >
              <i className="fas fa-search fa-sm" />
              Search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type ProgramTab = {
  id: "degree" | "major";
  label: string;
  year?: string;
  progressPct: number;
};

function TabProgressRing({ value }: { value: number }) {
  const size = 28;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;

  return (
    <span className="req-program-tab-ring" aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="req-program-tab-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="req-program-tab-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="req-program-tab-ring-label">{clamped}</span>
    </span>
  );
}

export function ReqPanel() {
  const {
    requirements,
    degreeRequirements,
    majorProgressPct,
    degreeProgressPct,
    majorTitle,
    degreeTitle,
    reqEditMode,
    setReqEditMode,
  } = usePlan();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const degreeName = degreeTitle.replace(/ \d{4}$/, "");
  const degreeYear = degreeTitle.match(/\d{4}$/)?.[0];

  const programs: ProgramTab[] = [
    {
      id: "degree",
      label: degreeName,
      year: degreeYear,
      progressPct: degreeProgressPct,
    },
    {
      id: "major",
      label: majorTitle,
      year: degreeYear,
      progressPct: majorProgressPct,
    },
  ];

  const useTabs = programs.length > 1;
  const [activeProgramId, setActiveProgramId] =
    useState<ProgramTab["id"]>("major");
  const activeProgram =
    programs.find((p) => p.id === activeProgramId) ?? programs[0];

  const activeGroups =
    activeProgram.id === "degree" ? degreeRequirements : requirements;

  const renderRequirementGroups = (
    groups: typeof requirements,
    programId: "degree" | "major"
  ) =>
    groups.map((group) => {
      const collapseKey = `${programId}:${group.title}`;
      const showHeader = group.showHeader !== false;
      const isCollapsed = collapsed[collapseKey] ?? false;
      return (
        <div key={collapseKey} className={`rule program-${programId}`}>
          {showHeader && (
            <button
              className={`rule-header nested-rule program-${programId} ${useTabs ? "under-tabs" : ""}`}
              type="button"
              onClick={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [collapseKey]: !prev[collapseKey],
                }))
              }
            >
              <div
                className="rule-header-fill"
                style={{ width: `${group.progressPct}%` }}
              />
              <div className="rule-header-content rule-header-stacked">
                <span className="rule-header-text">
                  <span className="rule-header-name">{group.title}</span>
                  <span className="rule-header-pct">{group.progressPct}%</span>
                </span>
                <i
                  className={`fas fa-chevron-${isCollapsed ? "right" : "up"}`}
                />
              </div>
            </button>
          )}
          {(showHeader ? !isCollapsed : true) && (
            <div
              className={`rule-children ${showHeader ? "" : "rule-children-flush"}`}
            >
              {group.children.map((child) => (
                <LeafRow
                  key={child.title}
                  leaf={child}
                  programId={programId}
                />
              ))}
            </div>
          )}
        </div>
      );
    });

  return (
    <section className="panel panel-req">
      <header className="panel-header">
        <div className="panel-header-title">Requirements</div>
        <button
          className="top-bar-btn"
          type="button"
          onClick={() => setReqEditMode(!reqEditMode)}
        >
          <i
            className={`fas ${reqEditMode ? "fa-check" : "fa-pen-to-square"} top-bar-icon`}
          />
          {reqEditMode ? "Done" : "Edit"}
        </button>
      </header>
      <div className="panel-body req-body">
        <div className={`req-content ${useTabs && !reqEditMode ? "has-tabs" : ""}`}>
          {reqEditMode ? (
            <>
              <div className="degree-header is-editing">
                <div className="degree-header-fill" style={{ width: 0 }} />
                <div className="degree-header-text">
                  <strong>{degreeName}</strong>
                  <span className="degree-year">{degreeYear}</span>
                </div>
                <button
                  type="button"
                  className="degree-trash"
                  aria-label={`Remove ${degreeName}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
              <button type="button" className="add-degree-btn">
                <i className="fas fa-plus" />
                Add Degree
              </button>
            </>
          ) : useTabs ? (
            <>
              <div
                className="req-program-tabs"
                role="tablist"
                aria-label="Degree and majors"
              >
                {programs.map((program) => {
                  const selected = program.id === activeProgram.id;
                  const titleBits = [
                    program.label,
                    program.year,
                    `${program.progressPct}%`,
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <button
                      key={program.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      className={`req-program-tab program-${program.id} ${selected ? "is-active" : ""}`}
                      onClick={() => setActiveProgramId(program.id)}
                      title={titleBits}
                    >
                      <span className="req-program-tab-copy">
                        <span className="req-program-tab-name">{program.label}</span>
                        {program.year ? (
                          <span className="req-program-tab-meta">{program.year}</span>
                        ) : null}
                      </span>
                      <TabProgressRing value={program.progressPct} />
                    </button>
                  );
                })}
              </div>

              <div
                className={`req-program-panel program-${activeProgram.id}`}
                role="tabpanel"
              >
                {renderRequirementGroups(activeGroups, activeProgram.id)}
              </div>
            </>
          ) : (
            <>
              <div className="degree-header">
                <div
                  className="degree-header-fill"
                  style={{ width: `${degreeProgressPct}%` }}
                />
                <div className="degree-header-text">
                  <strong>{degreeName}</strong>
                  <span className="degree-year">{degreeYear}</span>
                </div>
                <i className="fas fa-chevron-down" />
              </div>
              {renderRequirementGroups(requirements, "major")}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
