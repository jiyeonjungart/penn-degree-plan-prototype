import { useMemo } from "react";
import { usePlan, type ReqGroupView, type ReqLeafView } from "../planContext";

export type CountsForItem = {
  programCode: string;
  requirementTitle: string;
};

export type CountsForBuckets = {
  currently: CountsForItem[];
  couldAlso: CountsForItem[];
};

/** e.g. "BSE in Artificial Intelligence" → "BSE ARIN" */
export function programShortCode(programTitle: string): string {
  const degreeMatch = programTitle.match(/^(BSE|BAS|BA|BS|BFA)\b/i);
  const prefix = degreeMatch ? degreeMatch[1].toUpperCase() : null;
  const rest = programTitle
    .replace(/^(BSE|BAS|BA|BS|BFA)\s+in\s+/i, "")
    .replace(/^Major in\s+/i, "")
    .replace(/\s*\(\d{4}\)\s*$/, "")
    .replace(/\s+\d{4}$/, "");
  const words = rest
    .split(/[\s/-]+/)
    .map((w) => w.replace(/[^A-Za-z]/g, ""))
    .filter((w) => w && !/^(in|and|of|the|a|an)$/i.test(w));
  const stem = words
    .slice(0, 2)
    .map((w) => w.slice(0, 2).toUpperCase())
    .join("");
  if (prefix && stem) return `${prefix} ${stem}`;
  if (prefix) return prefix;
  return stem || programTitle.slice(0, 8).toUpperCase();
}

function classifyLeaf(
  code: string,
  leaf: ReqLeafView,
  planned: boolean
): "currently" | "couldAlso" | null {
  const listed = leaf.options.some((o) => o.code === code);
  const selected = leaf.options.some((o) => o.selected && o.code === code);

  if (selected) return "currently";

  // Explicit alternative on this requirement (listed but not the one in use)
  if (listed) return "couldAlso";

  // Open CU electives: any planned course could fill unused credit slots
  if (planned && leaf.credits != null) return "couldAlso";

  return null;
}

export function countsBucketsFromGroups(
  code: string,
  programTitle: string,
  groups: ReqGroupView[],
  planned: boolean
): CountsForBuckets {
  const programCode = programShortCode(programTitle);
  const currently: CountsForItem[] = [];
  const couldAlso: CountsForItem[] = [];

  for (const group of groups) {
    for (const leaf of group.children) {
      const kind = classifyLeaf(code, leaf, planned);
      if (!kind) continue;
      const item = { programCode, requirementTitle: leaf.title };
      if (kind === "currently") currently.push(item);
      else couldAlso.push(item);
    }
  }

  return { currently, couldAlso };
}

export function useCountsFor(code: string): CountsForBuckets {
  const {
    requirements,
    degreeRequirements,
    degreeTitle,
    majorTitle,
    semesters,
    dock,
  } = usePlan();

  return useMemo(() => {
    const degreeName = degreeTitle.replace(/ \d{4}$/, "");
    const planned =
      dock.includes(code) ||
      semesters.some((s) => s.courses.some((c) => c.code === code));

    const buckets = [
      countsBucketsFromGroups(code, degreeName, degreeRequirements, planned),
      countsBucketsFromGroups(code, majorTitle, requirements, planned),
    ];

    return {
      currently: buckets.flatMap((b) => b.currently),
      couldAlso: buckets.flatMap((b) => b.couldAlso),
    };
  }, [
    code,
    degreeTitle,
    majorTitle,
    degreeRequirements,
    requirements,
    semesters,
    dock,
  ]);
}

type Props = {
  code: string;
  position: { top: number; left: number };
};

export function CountsForPopup({ code, position }: Props) {
  const { currently, couldAlso } = useCountsFor(code);
  if (currently.length === 0 && couldAlso.length === 0) return null;

  return (
    <div
      className="counts-for-popup"
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-label="Requirement counting"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {currently.length > 0 && (
        <section className="counts-for-popup-section">
          <p className="counts-for-popup-label">Currently counts for</p>
          <ul className="counts-for-popup-list">
            {currently.map((item) => (
              <li key={`cur-${item.programCode}-${item.requirementTitle}`}>
                <span className="counts-for-popup-program">
                  [{item.programCode}]
                </span>{" "}
                {item.requirementTitle}
              </li>
            ))}
          </ul>
        </section>
      )}

      {couldAlso.length > 0 && (
        <section className="counts-for-popup-section">
          <p className="counts-for-popup-label">Could also count for</p>
          <ul className="counts-for-popup-list">
            {couldAlso.map((item) => (
              <li key={`alt-${item.programCode}-${item.requirementTitle}`}>
                <span className="counts-for-popup-program">
                  [{item.programCode}]
                </span>{" "}
                {item.requirementTitle}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
