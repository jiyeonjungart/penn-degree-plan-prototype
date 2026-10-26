import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildCourseIndex,
  degree,
  degreeRequirementGroups,
  initialDock,
  initialSemesters,
  majorTitle,
  requirementGroups,
  planName,
  resolveCourse,
  type Course,
  type CourseLocation,
  type CountsForPanelState,
  type DragPayload,
  type InfoPanelState,
  type RequirementGroupDef,
  type Semester,
} from "./data";

export type ReqOptionView = {
  code: string;
  selected: boolean;
  season?: "fall" | "spring" | "transfer";
  yearShort?: string;
  isSearch?: boolean;
};

export type ReqLeafView = {
  title: string;
  progress: string;
  check: boolean;
  options: ReqOptionView[];
  elective?: boolean;
  allowSearch?: boolean;
  /** CU requirement — progress shows "cus" subscript */
  credits?: number;
  cus?: number;
  numRequired?: number;
  numSatisfied?: number;
};

export type ReqGroupView = {
  title: string;
  progressPct: number;
  children: ReqLeafView[];
  showHeader?: boolean;
};

export type NotificationItem = {
  id: string;
  message: string;
  createdAt: number;
  read: boolean;
};

type PlanContextValue = {
  planName: string;
  plans: string[];
  setActivePlan: (name: string) => void;
  semesters: Semester[];
  dock: string[];
  showStats: boolean;
  setShowStats: (v: boolean) => void;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  reqEditMode: boolean;
  setReqEditMode: (v: boolean) => void;
  planColumnOpen: boolean;
  setPlanColumnOpen: (v: boolean) => void;
  reqColumnOpen: boolean;
  setReqColumnOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  openSearch: (query?: string) => void;
  dragging: DragPayload | null;
  setDragging: (v: DragPayload | null) => void;
  dropTarget: string | null;
  setDropTarget: (v: string | null) => void;
  infoPanel: InfoPanelState | null;
  openInfo: (
    code: string,
    anchor: DOMRect,
    semesterLabel?: string | null
  ) => void;
  closeInfo: () => void;
  countsForPanel: CountsForPanelState | null;
  openCountsFor: (code: string, anchor: DOMRect) => void;
  closeCountsFor: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  courseIndex: Map<string, CourseLocation>;
  requirements: ReqGroupView[];
  degreeRequirements: ReqGroupView[];
  majorProgressPct: number;
  degreeProgressPct: number;
  degreeTitle: string;
  majorTitle: string;
  moveCourseToSemester: (code: string, semesterId: string, from?: DragPayload) => void;
  moveCourseToDock: (code: string, from?: DragPayload) => boolean;
  removeFromSemester: (code: string, semesterId: string) => void;
  removeFromDock: (code: string) => void;
  addSemester: (season: "fall" | "spring") => void;
  removeSemester: (semesterId: string) => void;
  getCourse: (code: string) => Course;
};

const PlanContext = createContext<PlanContextValue | null>(null);

function nextSemesterId(semesters: Semester[], season: "fall" | "spring") {
  const last = semesters[semesters.length - 1];
  let year = 2028;
  if (last) {
    const match = last.label.match(/(\d{4})/);
    year = match ? Number(match[1]) : 2028;
    if (last.season === "fall") {
      // next is spring of year+1 if adding spring after fall of same year... 
      // Fall 2028 -> Spring 2029, Spring 2028 -> Fall 2028
    }
  }
  if (last?.season === "spring") {
    // next fall same calendar year? Spring 2028 -> Fall 2028
    const y = Number(last.label.match(/(\d{4})/)?.[1] ?? 2028);
    if (season === "fall") {
      return {
        id: `${y}C`,
        label: `Fall ${y}`,
        yearShort: String(y).slice(2),
      };
    }
    return {
      id: `${y + 1}A`,
      label: `Spring ${y + 1}`,
      yearShort: String(y + 1).slice(2),
    };
  }
  if (last?.season === "fall") {
    const y = Number(last.label.match(/(\d{4})/)?.[1] ?? 2028);
    if (season === "spring") {
      return {
        id: `${y + 1}A`,
        label: `Spring ${y + 1}`,
        yearShort: String(y + 1).slice(2),
      };
    }
    return {
      id: `${y + 1}C`,
      label: `Fall ${y + 1}`,
      yearShort: String(y + 1).slice(2),
    };
  }
  return {
    id: `${year}C`,
    label: `Fall ${year}`,
    yearShort: String(year).slice(2),
  };
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans] = useState(["Prototype Testing", "Backup Plan"]);
  const [activePlan, setActivePlan] = useState(planName);
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [dock, setDock] = useState<string[]>(initialDock);
  const [showStats, setShowStats] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [reqEditMode, setReqEditMode] = useState(false);
  const [planColumnOpen, setPlanColumnOpen] = useState(true);
  const [reqColumnOpen, setReqColumnOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [infoPanel, setInfoPanel] = useState<InfoPanelState | null>(null);
  const [countsForPanel, setCountsForPanel] =
    useState<CountsForPanelState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setNotifications((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          message: msg,
          createdAt: Date.now(),
          read: false,
        },
        ...prev,
      ].slice(0, 50)
    );
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => (n.read ? n : { ...n, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const closeInfo = useCallback(() => setInfoPanel(null), []);
  const closeCountsFor = useCallback(() => setCountsForPanel(null), []);

  const openInfo = useCallback(
    (code: string, anchor: DOMRect, semesterLabel?: string | null) => {
      const width = 280;
      const height = 420;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = anchor.right + 10;
      let top = anchor.top;
      if (left + width > vw - 12) left = anchor.left - width - 10;
      if (left < 12) left = 12;
      if (top + height > vh - 12) top = Math.max(12, vh - height - 12);
      if (top < 12) top = 12;
      setCountsForPanel(null);
      setInfoPanel({
        code,
        top,
        left,
        semesterLabel: semesterLabel ?? null,
      });
    },
    []
  );

  const openCountsFor = useCallback((code: string, anchor: DOMRect) => {
    const width = 280;
    const height = 140;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = anchor.left;
    let top = anchor.bottom + 8;
    if (left + width > vw - 12) left = Math.max(12, vw - width - 12);
    if (left < 12) left = 12;
    if (top + height > vh - 12) top = Math.max(12, anchor.top - height - 8);
    if (top < 12) top = 12;
    setInfoPanel(null);
    setCountsForPanel({ code, top, left });
  }, []);

  const courseIndex = useMemo(
    () => buildCourseIndex(semesters, dock),
    [semesters, dock]
  );

  const plannedCodes = useMemo(() => {
    const set = new Set<string>();
    for (const sem of semesters) {
      for (const c of sem.courses) set.add(c.code);
    }
    return set;
  }, [semesters]);

  const buildRequirementViews = useCallback(
    (groups: RequirementGroupDef[]): ReqGroupView[] => {
      return groups.map((group) => {
        const children: ReqLeafView[] = group.children.map((def) => {
          if (def.credits != null) {
            const matchedCodes = def.options.filter((code) =>
              plannedCodes.has(code)
            );
            const cus = matchedCodes.reduce((sum, code) => {
              const course = resolveCourse(code);
              return sum + (course?.credits ?? 1);
            }, 0);
            const check = cus >= def.credits;
            return {
              title: def.title,
              progress: `${cus} / ${def.credits}`,
              check,
              elective: def.elective,
              allowSearch: def.allowSearch ?? true,
              credits: def.credits,
              cus,
              options: matchedCodes.map((code) => {
                const loc = courseIndex.get(code);
                return {
                  code,
                  selected: true,
                  season: loc?.kind === "semester" ? loc.season : undefined,
                  yearShort:
                    loc?.kind === "semester" ? loc.yearShort : undefined,
                };
              }),
            };
          }

          const matched = def.options.find((code) => plannedCodes.has(code));
          const loc = matched ? courseIndex.get(matched) : undefined;
          const numRequired = def.num ?? 1;
          return {
            title: def.title,
            progress: matched ? `1/${numRequired}` : `0/${numRequired}`,
            check: Boolean(matched),
            elective: def.elective,
            allowSearch: def.allowSearch,
            numRequired,
            numSatisfied: matched ? 1 : 0,
            options: def.options.map((code) => ({
              code,
              selected: code === matched,
              season:
                code === matched && loc?.kind === "semester"
                  ? loc.season
                  : undefined,
              yearShort:
                code === matched && loc?.kind === "semester"
                  ? loc.yearShort
                  : undefined,
            })),
          };
        });
        const satisfied = children.filter((c) => c.check).length;
        const progressPct =
          children.length === 0
            ? 0
            : Math.round((satisfied / children.length) * 100);
        return {
          title: group.title,
          progressPct,
          children,
          showHeader: group.showHeader,
        };
      });
    },
    [plannedCodes, courseIndex]
  );

  const requirements = useMemo(
    () => buildRequirementViews(requirementGroups),
    [buildRequirementViews]
  );

  const degreeRequirements = useMemo(
    () => buildRequirementViews(degreeRequirementGroups),
    [buildRequirementViews]
  );

  const progressFrom = (groups: ReqGroupView[]) => {
    const all = groups.flatMap((g) => g.children);
    if (!all.length) return 0;
    return Math.round((all.filter((c) => c.check).length / all.length) * 100);
  };

  const majorProgressPct = useMemo(
    () => progressFrom(requirements),
    [requirements]
  );

  const degreeProgressPct = useMemo(
    () => progressFrom(degreeRequirements),
    [degreeRequirements]
  );

  const moveCourseToSemester = useCallback(
    (code: string, semesterId: string, from?: DragPayload) => {
      const course = resolveCourse(code);
      const target = semesters.find((s) => s.id === semesterId);
      if (!target) return;
      if (target.courses.some((c) => c.code === code)) {
        // Already here — clear any leftover dock copy and stop.
        if (dock.includes(code) || from?.from === "dock") {
          setDock((prev) => prev.filter((c) => c !== code));
        }
        showToast(`${code} is already in ${target.label}`);
        return;
      }

      // Move: remove from every other semester, then add to the target.
      setSemesters((prev) =>
        prev.map((sem) => {
          if (sem.id === semesterId) {
            return { ...sem, courses: [...sem.courses, course] };
          }
          if (sem.courses.some((c) => c.code === code)) {
            return {
              ...sem,
              courses: sem.courses.filter((c) => c.code !== code),
            };
          }
          return sem;
        })
      );

      // Placing into a year removes it from the dock as well.
      if (dock.includes(code) || from?.from === "dock") {
        setDock((prev) => prev.filter((c) => c !== code));
      }
    },
    [semesters, dock, showToast]
  );

  const moveCourseToDock = useCallback(
    (code: string, from?: DragPayload): boolean => {
      // Don't park a course on the dock while it still appears in any year card
      // (ignore the semester we're moving out of).
      const stillInPlan = semesters.filter(
        (s) =>
          s.courses.some((c) => c.code === code) &&
          !(from?.from === "semester" && from.semesterId === s.id)
      );

      if (stillInPlan.length > 0) {
        const where = stillInPlan.map((s) => s.label).join(", ");
        showToast(
          `${code} is already in ${where}. Remove it from your plan before adding to the dock.`
        );
        return false;
      }

      if (from?.from === "semester" && from.semesterId) {
        setSemesters((prev) =>
          prev.map((sem) =>
            sem.id === from.semesterId
              ? { ...sem, courses: sem.courses.filter((c) => c.code !== code) }
              : sem
          )
        );
      }

      if (dock.includes(code)) {
        showToast(`${code} is already in the dock`);
        return false;
      }

      setDock((prev) => [...prev, code]);
      return true;
    },
    [semesters, dock, showToast]
  );

  const removeFromSemester = useCallback(
    (code: string, semesterId: string) => {
      setSemesters((prev) =>
        prev.map((sem) =>
          sem.id === semesterId
            ? { ...sem, courses: sem.courses.filter((c) => c.code !== code) }
            : sem
        )
      );
      showToast(`Removed ${code}`);
    },
    [showToast]
  );

  const removeFromDock = useCallback(
    (code: string) => {
      setDock((prev) => prev.filter((c) => c !== code));
      showToast(`Removed ${code} from dock`);
    },
    [showToast]
  );

  const addSemester = useCallback(
    (season: "fall" | "spring") => {
      const meta = nextSemesterId(semesters, season);
      if (semesters.some((s) => s.id === meta.id)) {
        showToast("That semester already exists");
        return;
      }
      setSemesters((prev) => [
        ...prev,
        {
          id: meta.id,
          label: meta.label,
          season,
          yearShort: meta.yearShort,
          status: "future",
          courses: [],
        },
      ]);
    },
    [semesters, showToast]
  );

  const removeSemester = useCallback(
    (semesterId: string) => {
      const sem = semesters.find((s) => s.id === semesterId);
      if (!sem) return;
      if (sem.courses.length) {
        setDock((prev) => {
          const next = [...prev];
          for (const c of sem.courses) {
            if (!next.includes(c.code)) next.push(c.code);
          }
          return next;
        });
      }
      setSemesters((prev) => prev.filter((s) => s.id !== semesterId));
      showToast(`Removed ${sem.label}`);
    },
    [semesters, showToast]
  );

  const openSearch = useCallback((query = "") => {
    setSearchQuery(query);
    setSearchOpen(true);
  }, []);

  const value: PlanContextValue = {
    planName: activePlan,
    plans,
    setActivePlan,
    semesters,
    dock,
    showStats,
    setShowStats,
    editMode,
    setEditMode,
    reqEditMode,
    setReqEditMode,
    planColumnOpen,
    setPlanColumnOpen,
    reqColumnOpen,
    setReqColumnOpen,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    openSearch,
    dragging,
    setDragging,
    dropTarget,
    setDropTarget,
    infoPanel,
    openInfo,
    closeInfo,
    countsForPanel,
    openCountsFor,
    closeCountsFor,
    toast,
    showToast,
    notifications,
    unreadNotificationCount,
    markNotificationsRead,
    clearNotifications,
    courseIndex,
    requirements,
    degreeRequirements,
    majorProgressPct,
    degreeProgressPct,
    degreeTitle: `${degree.title} ${degree.year}`,
    majorTitle,
    moveCourseToSemester,
    moveCourseToDock,
    removeFromSemester,
    removeFromDock,
    addSemester,
    removeSemester,
    getCourse: resolveCourse,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
