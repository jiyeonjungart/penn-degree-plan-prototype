import { useRef, useState } from "react";
import { programToneClass, useCourseProgramTone } from "../courseProgram";
import { DND_MIME, type DragPayload } from "../data";
import { useCountsFor } from "./CountsForPopup";
import { usePlan } from "../planContext";

type CourseCardProps = {
  code: string;
  className?: string;
  showActions?: boolean;
  season?: "fall" | "spring" | "transfer";
  yearShort?: string;
  selected?: boolean;
  dragFrom?: DragPayload;
  onRemove?: () => void;
  onSearchClick?: () => void;
  searchable?: boolean;
  searchLabel?: string;
  semesterLabel?: string | null;
};

export function CourseCard({
  code,
  className = "",
  showActions = false,
  season,
  yearShort,
  selected = false,
  dragFrom,
  onRemove,
  onSearchClick,
  searchable = false,
  searchLabel,
  semesterLabel = null,
}: CourseCardProps) {
  const {
    setDragging,
    openInfo,
    closeInfo,
    openCountsFor,
    closeCountsFor,
    infoPanel,
    countsForPanel,
    courseIndex,
    semesters,
    dragging,
  } = usePlan();
  const wrapRef = useRef<HTMLDivElement>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const [didDrag, setDidDrag] = useState(false);
  const countsFor = useCountsFor(code);
  const programTone = useCourseProgramTone(code);
  const active =
    infoPanel?.code === code || countsForPanel?.code === code;
  const isDragRelated = dragging?.code === code;

  const resolvedSemesterLabel = (() => {
    if (semesterLabel) return semesterLabel;
    if (season && yearShort) {
      const seasonName =
        season === "fall" ? "Fall" : season === "spring" ? "Spring" : "Transfer";
      return season === "transfer"
        ? "AP & Transfer Credit"
        : `${seasonName} 20${yearShort}`;
    }
    const loc = courseIndex.get(code);
    if (loc?.kind === "semester" && loc.semesterId) {
      return semesters.find((s) => s.id === loc.semesterId)?.label ?? null;
    }
    return null;
  })();

  const showReview = () => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (infoPanel?.code === code) {
      closeInfo();
      return;
    }
    closeCountsFor();
    openInfo(code, rect, resolvedSemesterLabel);
  };

  const showCountsFor = () => {
    const rect =
      infoBtnRef.current?.getBoundingClientRect() ??
      wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (countsForPanel?.code === code) {
      closeCountsFor();
      return;
    }
    if (countsFor.currently.length > 0 || countsFor.couldAlso.length > 0) {
      openCountsFor(code, rect);
      return;
    }
    showReview();
  };

  if (searchable && !selected) {
    return (
      <button
        type="button"
        className={`search-chip ${isDragRelated ? "drag-related" : ""}`}
        onClick={onSearchClick}
      >
        <i className="fas fa-search fa-sm" />
        {searchLabel ?? code}
      </button>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={`course-card ${selected ? "selected" : ""} ${active ? "info-active" : ""} ${isDragRelated ? "drag-related" : ""} ${programToneClass(programTone)} ${className}`.trim()}
      draggable={Boolean(dragFrom)}
      role="button"
      tabIndex={0}
      onDragStart={(e) => {
        if (!dragFrom) return;
        e.dataTransfer.setData(DND_MIME, JSON.stringify(dragFrom));
        e.dataTransfer.effectAllowed = "move";
        setDidDrag(true);
        setDragging(dragFrom);
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
      <span className="course-code">{code}</span>
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
        {showActions && onRemove && (
          <button
            type="button"
            className="course-remove"
            aria-label={`Remove ${code}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ×
          </button>
        )}
      </span>
    </div>
  );
}
