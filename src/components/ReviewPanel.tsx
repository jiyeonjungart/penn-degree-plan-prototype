import { useEffect, useRef, useState } from "react";
import { type Course } from "../data";
import { usePlan } from "../planContext";

type Props = {
  course: Course;
  semesterLabel?: string | null;
  position: { top: number; left: number };
  onClose: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;
};

function ratingClass(value: number | null, reverse = false): string {
  if (value == null || Number.isNaN(value)) return "rating-na";
  if (value < 2) return reverse ? "rating-good" : "rating-bad";
  if (value < 3) return "rating-okay";
  return reverse ? "rating-bad" : "rating-good";
}

function numOrNA(num: number | null) {
  if (num == null || Number.isNaN(num)) return "N/A";
  return num.toFixed(1);
}

export function ReviewPanel({
  course,
  semesterLabel,
  position,
  onClose,
  panelRef,
}: Props) {
  const { semesters, moveCourseToSemester, showToast } = usePlan();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pcrUrl = `https://penncoursereview.com/course/${course.code.replace(" ", "-")}`;

  const yearPlacements = semesters
    .filter((s) => s.courses.some((c) => c.code === course.code))
    .map((s) => s.label);

  const matchedSemester = semesterLabel
    ? semesters.find((s) => s.label === semesterLabel)
    : yearPlacements.length === 1
      ? semesters.find((s) => s.label === yearPlacements[0])
      : undefined;

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current?.contains(e.target as Node)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  const addToSemester = (semesterId: string, label: string) => {
    moveCourseToSemester(course.code, semesterId, {
      from: "search",
      code: course.code,
    });
    showToast(`Added ${course.code} to ${label}`);
    setPickerOpen(false);
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="review-panel"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="review-panel-inner box">
        <div className="review-course">
          <div className="review-title-row">
            <div className="title">{course.code}</div>
            <a
              className="pcr-link btn-action"
              href={pcrUrl}
              target="_blank"
              rel="noreferrer"
              title="View in Penn Course Review"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fas fa-link fa-xs" />
              <span>view in PCR</span>
            </a>
          </div>
          <p className="subtitle">{course.title}</p>
          {yearPlacements.length > 0 && (
            <div className="review-live">
              {yearPlacements.map((label) => (
                <span key={label} className="badge badge-success">
                  {label}
                </span>
              ))}
            </div>
          )}
          <div className="review-add-row" ref={pickerRef}>
            <button
              type="button"
              className="review-add-btn"
              aria-expanded={pickerOpen}
              onClick={(e) => {
                e.stopPropagation();
                if (matchedSemester && !pickerOpen) {
                  addToSemester(matchedSemester.id, matchedSemester.label);
                  return;
                }
                setPickerOpen((v) => !v);
              }}
            >
              <i className="fas fa-plus" aria-hidden />
              {matchedSemester
                ? `Add to ${matchedSemester.label}`
                : "Add to plan"}
            </button>
            <button
              type="button"
              className="review-add-other"
              aria-label="Choose semester"
              onClick={(e) => {
                e.stopPropagation();
                setPickerOpen((v) => !v);
              }}
            >
              <i className="fas fa-chevron-down" aria-hidden />
            </button>
            {pickerOpen && (
              <div className="review-semester-menu" role="listbox">
                {semesters.map((sem) => {
                  const already = sem.courses.some((c) => c.code === course.code);
                  return (
                    <button
                      key={sem.id}
                      type="button"
                      role="option"
                      className={already ? "is-present" : ""}
                      disabled={already}
                      onClick={() => {
                        if (already) return;
                        addToSemester(sem.id, sem.label);
                      }}
                    >
                      <span>{sem.label}</span>
                      {already && <span className="muted">Added</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="scoredesc">
          <p className="title">Average</p>
        </div>
        <div className="scoreboxrow">
          <div className={`scorebox ${ratingClass(course.cq)}`}>
            <p className="num">{numOrNA(course.cq)}</p>
            <p className="desc">Course</p>
          </div>
          <div className={`scorebox ${ratingClass(course.iq)}`}>
            <p className="num">{numOrNA(course.iq)}</p>
            <p className="desc">Instructor</p>
          </div>
          <div className={`scorebox ${ratingClass(course.diff, true)}`}>
            <p className="num">{numOrNA(course.diff)}</p>
            <p className="desc">Difficulty</p>
          </div>
          <div className={`scorebox ${ratingClass(course.work, true)}`}>
            <p className="num">{numOrNA(course.work)}</p>
            <p className="desc">Work</p>
          </div>
        </div>

        {course.description && (
          <p className="review-description desc">{course.description}</p>
        )}
      </div>
    </div>
  );
}
