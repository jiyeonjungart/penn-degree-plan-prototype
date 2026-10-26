import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  left?: ReactNode | null;
  center?: ReactNode | null;
  right?: ReactNode | null;
};

const MIN_PCT = 22;
const MAX_LEFT = 70;

export function SplitPanes({ left, center, right }: Props) {
  const hasLeft = Boolean(left);
  const hasCenter = Boolean(center);
  const hasRight = Boolean(right);
  const paneCount = Number(hasLeft) + Number(hasCenter) + Number(hasRight);

  const [leftPct, setLeftPct] = useState(58);
  const [rightPct, setRightPct] = useState(24);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"left" | "right" | null>(null);

  // Reset proportions when visible panes change
  useEffect(() => {
    if (hasLeft && hasCenter && hasRight) {
      setLeftPct(48);
      setRightPct(26);
    } else if (hasLeft && hasCenter) {
      setLeftPct(62);
      setRightPct(0);
    } else if (hasRight && (hasLeft || hasCenter)) {
      setLeftPct(hasLeft && !hasCenter ? 70 : 0);
      setRightPct(28);
    } else {
      setLeftPct(hasLeft ? 100 : 0);
      setRightPct(hasRight ? 100 : 0);
    }
  }, [hasLeft, hasCenter, hasRight]);

  const onMove = useCallback(
    (clientX: number) => {
      const el = wrapRef.current;
      if (!el || !dragRef.current) return;
      const rect = el.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;

      if (dragRef.current === "left") {
        const max = hasRight ? 100 - rightPct - MIN_PCT : MAX_LEFT;
        setLeftPct(Math.min(max, Math.max(MIN_PCT, x)));
      } else {
        const fromRight = ((rect.right - clientX) / rect.width) * 100;
        const max = 100 - (hasLeft ? leftPct : 0) - MIN_PCT;
        setRightPct(Math.min(max, Math.max(MIN_PCT, fromRight)));
      }
    },
    [hasRight, hasLeft, leftPct, rightPct]
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      onMove(e.clientX);
    };
    const onPointerUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.classList.remove("is-resizing");
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onMove]);

  const startDrag = (which: "left" | "right") => (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = which;
    document.body.classList.add("is-resizing");
  };

  if (paneCount === 0) {
    return (
      <div className="split-panes split-panes-empty" ref={wrapRef}>
        <p className="split-empty-hint">
          Open <strong>Plan</strong> or <strong>Requirements</strong> from the
          top bar to show a column.
        </p>
      </div>
    );
  }

  // Flex basis for each visible pane
  let leftBasis = 0;
  let centerBasis = 0;
  let rightBasis = 0;

  if (hasLeft && hasCenter && hasRight) {
    leftBasis = leftPct;
    rightBasis = rightPct;
    centerBasis = Math.max(MIN_PCT, 100 - leftPct - rightPct);
  } else if (hasLeft && hasCenter) {
    leftBasis = leftPct;
    centerBasis = Math.max(MIN_PCT, 100 - leftPct);
  } else if (hasLeft && hasRight) {
    leftBasis = leftPct;
    rightBasis = Math.max(MIN_PCT, 100 - leftPct);
  } else if (hasCenter && hasRight) {
    rightBasis = rightPct;
    centerBasis = Math.max(MIN_PCT, 100 - rightPct);
  } else if (hasLeft) {
    leftBasis = 100;
  } else if (hasCenter) {
    centerBasis = 100;
  } else if (hasRight) {
    rightBasis = 100;
  }

  const showLeftGutter = hasLeft && hasCenter;
  const showRightGutter = hasRight && (hasLeft || hasCenter);

  return (
    <div className="split-panes" ref={wrapRef}>
      {hasLeft && (
        <div className="split-pane" style={{ flexBasis: `${leftBasis}%` }}>
          {left}
        </div>
      )}
      {showLeftGutter && (
        <div
          className="split-gutter"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize plan panel"
          onPointerDown={startDrag("left")}
        />
      )}
      {hasCenter && (
        <div className="split-pane" style={{ flexBasis: `${centerBasis}%` }}>
          {center}
        </div>
      )}
      {showRightGutter && (
        <div
          className="split-gutter"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize search panel"
          onPointerDown={startDrag("right")}
        />
      )}
      {hasRight && (
        <div className="split-pane" style={{ flexBasis: `${rightBasis}%` }}>
          {right}
        </div>
      )}
    </div>
  );
}
