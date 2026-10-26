import { useMemo } from "react";
import { usePlan, type ReqGroupView } from "./planContext";

export type ProgramTone = "degree" | "major" | "both";

function groupsListCode(groups: ReqGroupView[], code: string): boolean {
  return groups.some((g) =>
    g.children.some((leaf) => leaf.options.some((o) => o.code === code))
  );
}

export function programToneFromGroups(
  code: string,
  degreeRequirements: ReqGroupView[],
  requirements: ReqGroupView[]
): ProgramTone | null {
  const inDegree = groupsListCode(degreeRequirements, code);
  const inMajor = groupsListCode(requirements, code);
  if (inDegree && inMajor) return "both";
  if (inDegree) return "degree";
  if (inMajor) return "major";
  return null;
}

export function useCourseProgramTone(code: string): ProgramTone | null {
  const { degreeRequirements, requirements } = usePlan();
  return useMemo(
    () => programToneFromGroups(code, degreeRequirements, requirements),
    [code, degreeRequirements, requirements]
  );
}

export function programToneClass(tone: ProgramTone | null | undefined): string {
  return tone ? `program-${tone}` : "";
}
