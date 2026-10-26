import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CourseCard } from "./CourseCard";
import { usePlan } from "../planContext";
import { DND_MIME, type DragPayload } from "../data";
import { pdpLogoSrc } from "../logo";

const DOCK_COLLAPSED = 66;
const DOCK_PAD_Y = 32; // 1rem top + bottom
const ROW_GAP = 12;
const ABS_MAX = 320;

export function Dock() {
  const {
    dock,
    dropTarget,
    setDropTarget,
    setDragging,
    moveCourseToDock,
    removeFromDock,
    openSearch,
    searchOpen,
    setSearchOpen,
    setSearchQuery,
  } = usePlan();

  const dockRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(DOCK_COLLAPSED);
  /** Max height needed to show every tag row (no empty slack) */
  const [contentMax, setContentMax] = useState(DOCK_COLLAPSED);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);
  const isOver = dropTarget === "dock";

  const measureNeededHeight = useCallback(() => {
    const strip = stripRef.current;
    if (!strip || dock.length === 0) {
      setContentMax(DOCK_COLLAPSED);
      return;
    }

    const cards = [...strip.querySelectorAll<HTMLElement>(".course-card")];
    if (!cards.length) {
      setContentMax(DOCK_COLLAPSED);
      return;
    }

    const avail = strip.clientWidth || strip.parentElement?.clientWidth || 0;
    if (avail <= 0) return;

    const gapX = 16;
    const gapY = ROW_GAP;
    let x = 0;
    let rows = 1;
    let rowH = 0;
    let totalH = 0;

    for (const card of cards) {
      const w = card.offsetWidth;
      const h = card.offsetHeight || 35;
      if (x > 0 && x + w > avail) {
        totalH += rowH + gapY;
        rows += 1;
        x = 0;
        rowH = 0;
      }
      x += w + gapX;
      rowH = Math.max(rowH, h);
    }
    totalH += rowH;

    const needed = DOCK_PAD_Y + totalH + 4;
    const maxH = Math.min(ABS_MAX, Math.max(DOCK_COLLAPSED, needed));
    setContentMax(maxH);
  }, [dock]);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => measureNeededHeight());
    return () => cancelAnimationFrame(id);
  }, [measureNeededHeight, height]);

  useEffect(() => {
    const onResize = () => measureNeededHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureNeededHeight]);

  // Clamp height when content shrinks (e.g. tags removed)
  useEffect(() => {
    setHeight((h) => Math.min(h, contentMax));
  }, [contentMax]);

  const canExpand = contentMax > DOCK_COLLAPSED + 8;

  const onResizeMove = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return;
      const dy = dragRef.current.startY - e.clientY;
      const next = Math.min(
        contentMax,
        Math.max(DOCK_COLLAPSED, dragRef.current.startH + dy)
      );
      setHeight(next);
    },
    [contentMax]
  );

  const onResizeEnd = useCallback(() => {
    dragRef.current = null;
    document.body.classList.remove("is-dock-resizing");
    window.removeEventListener("pointermove", onResizeMove);
    window.removeEventListener("pointerup", onResizeEnd);
  }, [onResizeMove]);

  const onResizeStart = (e: React.PointerEvent) => {
    if (!canExpand) return;
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startH: height };
    document.body.classList.add("is-dock-resizing");
    window.addEventListener("pointermove", onResizeMove);
    window.addEventListener("pointerup", onResizeEnd);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onResizeMove);
      window.removeEventListener("pointerup", onResizeEnd);
      document.body.classList.remove("is-dock-resizing");
    };
  }, [onResizeMove, onResizeEnd]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget("dock");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return;
    const payload = JSON.parse(raw) as DragPayload;
    moveCourseToDock(payload.code, payload);
    setDragging(null);
  };

  const expanded = height > DOCK_COLLAPSED + 8;

  return (
    <div
      ref={dockRef}
      className={`dock ${isOver ? "drop-over" : ""} ${expanded ? "expanded" : ""} ${canExpand ? "can-expand" : ""}`}
      style={{ height }}
      onDragOver={onDragOver}
      onDragLeave={() => {
        if (dropTarget === "dock") setDropTarget(null);
      }}
      onDrop={onDrop}
    >
      {canExpand && (
        <div
          className="dock-resize"
          onPointerDown={onResizeStart}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize dock"
          aria-valuemin={DOCK_COLLAPSED}
          aria-valuemax={contentMax}
          aria-valuenow={height}
          title="Drag to show more courses"
        />
      )}
      <button
        className="dock-add"
        type="button"
        onClick={() => {
          if (searchOpen) {
            setSearchOpen(false);
            setSearchQuery("");
          } else {
            openSearch("");
          }
        }}
      >
        <i className="fas fa-plus-circle fa-lg" />
        Add Course
      </button>
      <div className="dock-strip" ref={stripRef}>
        {dock.length === 0 ? (
          <div className="dock-placeholder">
            Drop courses in the dock for later.
          </div>
        ) : (
          dock.map((code) => (
            <CourseCard
              key={code}
              code={code}
              className="docked"
              showActions
              dragFrom={{ from: "dock", code }}
              onRemove={() => removeFromDock(code)}
            />
          ))
        )}
      </div>
      <img
        className="dock-logo"
        src={pdpLogoSrc}
        alt="Penn Degree Plan"
        width={30}
        height={45}
      />
    </div>
  );
}
