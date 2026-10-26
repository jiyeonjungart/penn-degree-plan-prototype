export type Course = {
  code: string;
  credits: number;
  cq: number | null;
  iq: number | null;
  diff: number | null;
  work: number | null;
  title?: string;
  description?: string;
};

export type Semester = {
  id: string;
  label: string;
  season: "fall" | "spring" | "transfer";
  yearShort: string;
  status: "past" | "current" | "future";
  courses: Course[];
};

export type SearchResult = {
  code: string;
  title: string;
  qual: number | null;
  diff: number | null;
};

export type DragPayload = {
  code: string;
  from: "dock" | "semester" | "search";
  semesterId?: string;
};

export type CourseLocation = {
  kind: "semester" | "dock";
  semesterId?: string;
  season?: "fall" | "spring" | "transfer";
  yearShort?: string;
};

export type InfoPanelState = {
  code: string;
  top: number;
  left: number;
  semesterLabel?: string | null;
};

/** Compact “Currently counts for” tooltip near the info icon */
export type CountsForPanelState = {
  code: string;
  top: number;
  left: number;
};

export const planName = "Prototype Testing";
export const accountInitials = "Je";
export const DND_MIME = "application/x-pdp-course";

function c(
  code: string,
  title: string,
  stats: [number | null, number | null, number | null, number | null],
  description: string,
  credits = 1
): Course {
  const [cq, iq, diff, work] = stats;
  return { code, title, credits, cq, iq, diff, work, description };
}

export const courseCatalog: Record<string, Course> = {
  "MATH 1400": c(
    "MATH 1400",
    "Calculus I",
    [2.0, 2.3, 3.2, 3.0],
    "Brief review of High School calculus, applications of integrals, transcendental functions, methods of integration, infinite series, Taylor's theorem, one dimensional waves. Use of symbolic manipulation and graphics software in calculus."
  ),
  "MATH 1410": c(
    "MATH 1410",
    "Calculus II",
    [2.0, 2.4, 2.8, 2.4],
    "Continuation of Calculus I. Techniques of integration, applications, infinite series, and an introduction to differential equations."
  ),
  "ENM 2400": c(
    "ENM 2400",
    "Diff. Equations & Linear Algebra",
    [2.0, 2.4, 2.8, 2.4],
    "First- and second-order ODEs, systems of equations, matrix algebra, eigenvalues, and applications in engineering."
  ),
  "MATH 2400": c(
    "MATH 2400",
    "Calculus III",
    [2.5, 2.6, 3.0, 2.9],
    "Functions of several variables, partial derivatives, multiple integrals, vector calculus, and applications."
  ),
  "MATH 2600": c(
    "MATH 2600",
    "Honors Calculus",
    [2.4, 2.5, 3.1, 3.0],
    "A rigorous treatment of multivariable calculus intended for students with a strong background in mathematics."
  ),
  "ESE 2030": c(
    "ESE 2030",
    "Engineering Probability",
    [2.8, 2.9, 2.6, 2.7],
    "Introduction to probability theory with engineering applications, random variables, and stochastic processes."
  ),
  "ENM 2030": c(
    "ENM 2030",
    "Linear Algebra & ODEs",
    [2.7, 2.8, 2.5, 2.6],
    "Linear algebra fundamentals paired with ordinary differential equations for engineering students."
  ),
  "ENM 3750": c(
    "ENM 3750",
    "Statistics for Engineers",
    [3.0, 3.1, 2.9, 3.0],
    "Statistical methods for engineering analysis, including estimation, hypothesis testing, and regression."
  ),
  "ENM 3440": c(
    "ENM 3440",
    "Numerical Methods",
    [2.9, 3.0, 2.8, 2.9],
    "Numerical techniques for solving engineering problems: root finding, interpolation, integration, and ODEs."
  ),
  "ESE 4020": c(
    "ESE 4020",
    "Statistics for Data Science",
    [3.1, 3.2, 3.0, 3.1],
    "Statistical foundations for data science including inference, modeling, and computational approaches."
  ),
  "STAT 4310": c(
    "STAT 4310",
    "Statistical Inference",
    [2.8, 2.9, 3.2, 3.1],
    "Theory of statistical inference: estimation, hypothesis testing, and large-sample methods."
  ),
  "BE 4700": c(
    "BE 4700",
    "Medical Devices",
    [3.2, 3.3, 2.7, 2.8],
    "Design and regulation of medical devices, with case studies spanning diagnostics and therapeutics."
  ),
  "MATH 0021": c(
    "MATH 0021",
    "Math and Movies",
    [2.4, 2.5, 1.3, 1.5],
    "An exploration of mathematical ideas through film, including geometry, infinity, and probability."
  ),
  "MATH 0025": c(
    "MATH 0025",
    "Geometry and Art",
    [0.7, 1.0, 3.7, 3.5],
    "This class is about incidence geometry and projective geometry, with connections to perspective in art and architecture."
  ),
  "MATH 0030": c(
    "MATH 0030",
    "Introduction to Calculus",
    [null, null, null, null],
    "Preparatory course covering functions, limits, and an introduction to differential calculus."
  ),
  "MATH 0100": c(
    "MATH 0100",
    "Calculus for Social Sciences",
    [null, null, null, null],
    "Single-variable calculus with applications in economics and the social sciences."
  ),
  "MATH 1070": c(
    "MATH 1070",
    "Mathematics of Change I",
    [2.9, 3.0, 2.4, 2.5],
    "Discrete and continuous models of change with applications across the sciences."
  ),
  "IPD 5510": c(
    "IPD 5510",
    "Design Thinking",
    [3.4, 3.5, 2.4, 2.5],
    "Human-centered design methods for product and systems innovation."
  ),
  "BIOL 1123": c(
    "BIOL 1123",
    "Introductory Molecular Biology Lab",
    [3.0, 3.1, 2.6, 2.7],
    "Laboratory techniques in molecular biology, including PCR, cloning, and gel electrophoresis."
  ),
  "IPD 6990": c(
    "IPD 6990",
    "Independent Study",
    [3.3, 3.4, 2.5, 2.6],
    "Independent research or design project under faculty supervision."
  ),
  "EAS 5450": c(
    "EAS 5450",
    "Engineering Entrepreneurship",
    [3.1, 3.2, 2.3, 2.4],
    "Startup fundamentals for engineers: opportunity recognition, product-market fit, and fundraising."
  ),
  "MATH 3130": c(
    "MATH 3130",
    "Computational Linear Algebra",
    [2.7, 2.8, 3.3, 3.2],
    "Numerical linear algebra with applications in data analysis and scientific computing."
  ),
  "CHEM 1161": c(
    "CHEM 1161",
    "Honors Chemistry II",
    [2.6, 2.7, 3.3, 2.9],
    "An advanced course for students who have had very strong preparation in chemistry, covering equilibrium, kinetics, and thermodynamics."
  ),
  "BE 1000": c(
    "BE 1000",
    "Introduction to Bioengineering",
    [3.1, 3.2, 2.4, 2.5],
    "Overview of bioengineering pathways, research areas, and professional practice."
  ),
  "BE 2700": c(
    "BE 2700",
    "Bioengineering Lab I",
    [3.3, 3.4, 2.8, 2.9],
    "Hands-on laboratory course covering biomechanics, biomaterials, and instrumentation."
  ),
  "CIS 1100": c(
    "CIS 1100",
    "Introduction to Programming",
    [3.2, 3.3, 2.6, 2.7],
    "Introduction to computer programming with emphasis on problem solving and data structures."
  ),
  "BIOL 1101": c(
    "BIOL 1101",
    "Introduction to Biology A",
    [3.0, 3.1, 2.5, 2.6],
    "Molecular and cellular foundations of biology for majors and pre-health students."
  ),
  "CHEM 1012": c(
    "CHEM 1012",
    "General Chemistry I",
    [2.7, 2.8, 3.0, 3.1],
    "Atomic structure, bonding, stoichiometry, and thermochemistry with laboratory."
  ),
  "PHYS 0150": c(
    "PHYS 0150",
    "Principles of Physics I",
    [2.8, 2.9, 3.1, 3.0],
    "Classical mechanics for science and engineering students, with laboratory."
  ),
  "WRIT 0110": c(
    "WRIT 0110",
    "Critical Writing Seminar",
    [3.2, 3.4, 2.4, 2.5],
    "Seminar in academic writing with emphasis on argument, research, and revision."
  ),
  "WRIT 0150": c(
    "WRIT 0150",
    "Writing Seminar in Science",
    [3.1, 3.2, 2.3, 2.4],
    "Writing-intensive seminar tailored to scientific and technical audiences."
  ),
  "SOCI 1000": c(
    "SOCI 1000",
    "Introduction to Sociology",
    [3.3, 3.2, 2.2, 2.3],
    "Foundations of sociological thinking: institutions, inequality, and culture."
  ),
  "PSYC 0001": c(
    "PSYC 0001",
    "Introduction to Experimental Psychology",
    [3.0, 3.1, 2.6, 2.5],
    "Survey of cognitive, social, developmental, and biological psychology."
  ),
  "PHIL 1330": c(
    "PHIL 1330",
    "Ethics",
    [3.4, 3.5, 2.1, 2.2],
    "Introduction to moral philosophy and applied ethical reasoning."
  ),
  "EAS 2030": c(
    "EAS 2030",
    "Engineering Ethics",
    [3.5, 3.6, 1.8, 2.0],
    "Ethical frameworks for engineering practice, professional responsibility, and public impact."
  ),
  "HIST 1110": c(
    "HIST 1110",
    "American History to 1865",
    [3.1, 3.0, 2.4, 2.5],
    "Survey of early American political, social, and cultural history."
  ),
};

export const initialSemesters: Semester[] = [
  {
    id: "transfer",
    label: "AP & Transfer Credit",
    season: "transfer",
    yearShort: "",
    status: "past",
    courses: [],
  },
  {
    id: "2026C",
    label: "Fall 2026",
    season: "fall",
    yearShort: "26",
    status: "current",
    courses: [],
  },
  {
    id: "2027A",
    label: "Spring 2027",
    season: "spring",
    yearShort: "27",
    status: "future",
    courses: [],
  },
  {
    id: "2027C",
    label: "Fall 2027",
    season: "fall",
    yearShort: "27",
    status: "future",
    courses: [],
  },
  {
    id: "2028A",
    label: "Spring 2028",
    season: "spring",
    yearShort: "28",
    status: "future",
    courses: [],
  },
  {
    id: "2028C",
    label: "Fall 2028",
    season: "fall",
    yearShort: "28",
    status: "future",
    courses: [],
  },
  {
    id: "2029A",
    label: "Spring 2029",
    season: "spring",
    yearShort: "29",
    status: "future",
    courses: [courseCatalog["ENM 2400"]],
  },
  {
    id: "2029C",
    label: "Fall 2029",
    season: "fall",
    yearShort: "29",
    status: "future",
    courses: [],
  },
  {
    id: "2030A",
    label: "Spring 2030",
    season: "spring",
    yearShort: "30",
    status: "future",
    courses: [],
  },
  {
    id: "2030C",
    label: "Fall 2030",
    season: "fall",
    yearShort: "30",
    status: "future",
    courses: [courseCatalog["CHEM 1161"], courseCatalog["IPD 5510"]],
  },
  {
    id: "2031A",
    label: "Spring 2031",
    season: "spring",
    yearShort: "31",
    status: "future",
    courses: [],
  },
];

export const initialDock = [
  "BE 4700",
  "MATH 0021",
  "BIOL 1123",
  "IPD 6990",
  "EAS 5450",
  "MATH 3130",
];

export const degree = {
  title: "BSE in Artificial Intelligence",
  year: 2027,
};

export const majorTitle = "BAS in Biomedical Science";

export type RequirementDef = {
  title: string;
  options: string[];
  /** Multi-option / open elective — show search chips */
  elective?: boolean;
  /** Show a generic Search chip in addition to option chips */
  allowSearch?: boolean;
  /** CU requirement (shows "n / credits cus") */
  credits?: number;
  /** Course-count requirement (default 1 when credits unset) */
  num?: number;
};

export type RequirementGroupDef = {
  title: string;
  children: RequirementDef[];
  /** Hide sticky group header (for orphan leaves matching live PDP) */
  showHeader?: boolean;
};

/** School / degree-level requirements (shown on the Degree tab). */
export const degreeRequirementGroups: RequirementGroupDef[] = [
  {
    title: "WRITING",
    children: [
      {
        title: "Critical Writing",
        options: ["WRIT 0110", "WRIT 0150"],
        elective: true,
      },
    ],
  },
  {
    title: "SOCIAL SCIENCE & HUMANITIES",
    children: [
      {
        title: "Social Science",
        options: ["SOCI 1000", "PSYC 0001"],
        elective: true,
        allowSearch: true,
      },
      {
        title: "Humanities",
        options: ["PHIL 1330", "HIST 1110"],
        elective: true,
        allowSearch: true,
      },
    ],
  },
  {
    title: "TECHNOLOGY, BUSINESS & SOCIETY",
    children: [
      {
        title: "Engineering Ethics",
        options: ["EAS 2030"],
        elective: true,
      },
    ],
  },
  {
    title: "Free Electives Group",
    showHeader: false,
    children: [
      {
        title: "Free Electives",
        options: [],
        elective: true,
        allowSearch: true,
        credits: 3,
      },
    ],
  },
];

export const requirementGroups: RequirementGroupDef[] = [
  {
    title: "MATHEMATICS",
    children: [
      { title: "Calculus I", options: ["MATH 1400"] },
      { title: "Calculus II", options: ["MATH 1410"] },
      {
        title: "ENM 2400, MATH 2400, or MATH 2600",
        options: ["ENM 2400", "MATH 2400", "MATH 2600", "ESE 2030", "ENM 2030"],
        elective: true,
      },
      {
        title: "ENM 3750, ENM 3440, ESE 4020, or STAT 4310",
        options: ["ENM 3750", "ENM 3440", "ESE 4020", "STAT 4310"],
        elective: true,
      },
    ],
  },
  {
    title: "SCIENCE",
    children: [
      {
        title: "Intro. Molec. Biol. Lab",
        options: ["BIOL 1123"],
        elective: true,
        allowSearch: true,
      },
      {
        title: "Chemistry",
        options: ["CHEM 1012", "CHEM 1161"],
        elective: true,
      },
      {
        title: "Physics",
        options: ["PHYS 0150"],
        elective: true,
        allowSearch: true,
      },
    ],
  },
  {
    title: "Engineering Electives Group",
    showHeader: false,
    children: [
      {
        title: "Engineering Electives",
        options: [],
        elective: true,
        allowSearch: true,
        credits: 2,
      },
    ],
  },
  {
    title: "PROFESSIONAL ELECTIVES",
    children: [
      {
        title: "Professional Elective I",
        options: ["BE 4700", "EAS 5450", "IPD 5510"],
        elective: true,
        allowSearch: true,
      },
      {
        title: "Professional Elective II",
        options: ["CIS 1100", "BE 1000", "IPD 6990"],
        elective: true,
        allowSearch: true,
      },
      {
        title: "Open Professional Electives",
        options: [],
        elective: true,
        allowSearch: true,
        credits: 2,
      },
    ],
  },
];

/** @deprecated use requirementGroups */
export const mathRequirementDefs = requirementGroups[0].children;

export const searchResults: SearchResult[] = Object.values(courseCatalog)
  .map((course) => ({
    code: course.code,
    title: course.title ?? course.code,
    qual: course.cq,
    diff: course.diff,
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

export function resolveCourse(code: string): Course {
  return (
    courseCatalog[code] ?? {
      code,
      title: code,
      credits: 1,
      cq: 2.5,
      iq: 2.5,
      diff: 2.5,
      work: 2.5,
      description: "No description available for this course.",
    }
  );
}

export function avg(courses: Course[], key: "cq" | "iq" | "diff" | "work"): number {
  const vals = courses
    .map((c) => c[key])
    .filter((v): v is number => typeof v === "number");
  if (!vals.length) return NaN;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function getStatColor(score: number, reverse = false): string {
  if (Number.isNaN(score)) return "#d6d6d6";
  if (score < 2) return reverse ? "#76bf96" : "#ffc107";
  if (score < 3) return "#6274f1";
  return reverse ? "#ffc107" : "#76bf96";
}

export function buildCourseIndex(semesters: Semester[], dock: string[]) {
  const map = new Map<string, CourseLocation>();
  for (const sem of semesters) {
    for (const course of sem.courses) {
      map.set(course.code, {
        kind: "semester",
        semesterId: sem.id,
        season: sem.season,
        yearShort: sem.yearShort,
      });
    }
  }
  for (const code of dock) {
    if (!map.has(code)) map.set(code, { kind: "dock" });
  }
  return map;
}
