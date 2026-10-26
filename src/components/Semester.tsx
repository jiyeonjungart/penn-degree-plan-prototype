import { useEffect, useState } from "react";
import {
  avg,
  DND_MIME,
  type Course,
  type DragPayload,
  type Semester as SemesterType,
} from "../data";
import { usePlan } from "../planContext";
import { CourseCard } from "./CourseCard";
import { Stats } from "./Stats";

type Props = {
  semester: SemesterType;
};

/** When collapsed, show courses totaling up to this many CUs */
const COLLAPSED_CU_LIMIT = 5;

function coursesWithinCuLimit(courses: Course[], limit: number): Course[] {
  const shown: Course[] = [];
  let sum = 0;
  for (const course of courses) {
    const next = sum + (course.credits || 0);
    if (shown.length > 0 && next > limit) break;
    shown.push(course);
    sum = next;
    if (sum >= limit) break;
  }
  return shown;
}

export function Semester({ semester }: Props) {
  const {
    showStats,
    editMode,
    dropTarget,
    setDropTarget,
    setDragging,
    moveCourseToSemester,
    removeFromSemester,
    removeSemester,
    openSearch,
  } = usePlan();

  const isTransfer = semester.season === "transfer";
  const cus = semester.courses.reduce((sum, c) => sum + c.credits, 0);
  const cq = avg(semester.courses, "cq");
  const iq = avg(semester.courses, "iq");
  const diff = avg(semester.courses, "diff");
  const work = avg(semester.courses, "work");
  const isOver = dropTarget === semester.id;
  const isEmpty = semester.courses.length === 0;

  const previewCourses = coursesWithinCuLimit(
    semester.courses,
    COLLAPSED_CU_LIMIT
  );
  const canCollapseCourses = previewCourses.length < semester.courses.length;
  const [coursesCollapsed, setCoursesCollapsed] = useState(canCollapseCourses);
  /** Transfer strip starts collapsed */
  const [panelCollapsed, setPanelCollapsed] = useState(isTransfer);

  useEffect(() => {
    if (isTransfer) return;
    if (canCollapseCourses) setCoursesCollapsed(true);
    else setCoursesCollapsed(false);
  }, [canCollapseCourses, semester.id, isTransfer]);

  const visibleCourses =
    coursesCollapsed && canCollapseCourses
      ? previewCourses
      : semester.courses;
  const hiddenCount = semester.courses.length - visibleCourses.length;
  const hiddenCus = semester.courses
    .slice(visibleCourses.length)
    .reduce((sum, c) => sum + c.credits, 0);

  const showCollapseToggle = isTransfer || canCollapseCourses;
  const isCollapsedView = isTransfer
    ? panelCollapsed
    : coursesCollapsed && canCollapseCourses;

  const toggleCollapse = () => {
    if (isTransfer) setPanelCollapsed((v) => !v);
    else setCoursesCollapsed((v) => !v);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(semester.id);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return;
    const payload = JSON.parse(raw) as DragPayload;
    moveCourseToSemester(payload.code, semester.id, payload);
    setDragging(null);
    if (isTransfer) setPanelCollapsed(false);
  };

  return (
    <article
      className={`semester ${semester.status} ${isOver ? "drop-over" : ""} ${showStats && !(isTransfer && panelCollapsed) ? "with-stats" : ""} ${isCollapsedView ? "is-collapsed" : ""} ${isTransfer ? "semester-transfer" : ""} ${isTransfer && panelCollapsed ? "is-panel-collapsed" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={() =>
        setDropTarget(dropTarget === semester.id ? null : dropTarget)
      }
      onDrop={onDrop}
    >
      <header className="semester-header">
        <button
          type="button"
          className={`semester-title-btn ${isTransfer ? "is-toggle" : ""}`}
          onClick={isTransfer ? toggleCollapse : undefined}
          aria-expanded={isTransfer ? !panelCollapsed : undefined}
        >
          <span>{semester.label}</span>
          {isTransfer && (
            <i
              className={`fas ${panelCollapsed ? "fa-chevron-down" : "fa-chevron-up"}`}
              aria-hidden
            />
          )}
        </button>
        <div className="semester-header-actions">
          {isTransfer && panelCollapsed && (
            <span className="semester-collapsed-cus">
              {Number.isInteger(cus) ? cus : cus.toFixed(1)} CUs
            </span>
          )}
          {!isTransfer && showCollapseToggle && (
            <button
              type="button"
              className="semester-collapse"
              aria-expanded={!coursesCollapsed}
              aria-label={
                coursesCollapsed
                  ? `Expand ${semester.label}`
                  : `Collapse ${semester.label}`
              }
              onClick={toggleCollapse}
            >
              <i
                className={`fas ${coursesCollapsed ? "fa-chevron-down" : "fa-chevron-up"}`}
                aria-hidden
              />
            </button>
          )}
          {editMode && !isTransfer && (
            <button
              type="button"
              className="semester-trash"
              aria-label={`Remove ${semester.label}`}
              onClick={() => removeSemester(semester.id)}
            >
              <i className="fas fa-trash" />
            </button>
          )}
        </div>
      </header>

      {!(isTransfer && panelCollapsed) && (
        <>
          <div className="semester-content">
            {showStats && <Stats cq={cq} iq={iq} diff={diff} work={work} />}

            <div
              className={`courses ${isEmpty ? "is-empty" : ""}`}
            >
              {isEmpty ? (
                <button
                  type="button"
                  className="semester-add-course"
                  onClick={() => openSearch("")}
                >
                  + Add Course
                </button>
              ) : (
                <>
                  {visibleCourses.map((course) => (
                    <CourseCard
                      key={course.code}
                      code={course.code}
                      showActions
                      className="planned"
                      dragFrom={{
                        from: "semester",
                        code: course.code,
                        semesterId: semester.id,
                      }}
                      onRemove={() =>
                        removeFromSemester(course.code, semester.id)
                      }
                    />
                  ))}
                  {!isTransfer && canCollapseCourses && coursesCollapsed && hiddenCount > 0 && (
                    <button
                      type="button"
                      className="semester-show-more"
                      onClick={() => setCoursesCollapsed(false)}
                    >
                      +{hiddenCount} more ·{" "}
                      {Number.isInteger(hiddenCus)
                        ? hiddenCus
                        : hiddenCus.toFixed(1)}{" "}
                      CUs
                    </button>
                  )}
                  {!isTransfer && canCollapseCourses && !coursesCollapsed && (
                    <button
                      type="button"
                      className="semester-show-more"
                      onClick={() => setCoursesCollapsed(true)}
                    >
                      Show less
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <footer className="semester-footer">
            <strong>{Number.isInteger(cus) ? cus : cus.toFixed(1)}</strong>
            <span>CUs</span>
          </footer>
        </>
      )}
    </article>
  );
}
