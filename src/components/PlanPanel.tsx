import { useState } from "react";
import { usePlan } from "../planContext";
import { Semester } from "./Semester";

export function PlanPanel() {
  const {
    planName,
    plans,
    setActivePlan,
    semesters,
    showStats,
    setShowStats,
    editMode,
    setEditMode,
    addSemester,
  } = usePlan();
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <section className="panel panel-plan">
      <header className="panel-header">
        <div className="plan-select-wrap">
          <button
            className="plan-select"
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {planName}
            <i className="fas fa-chevron-down" style={{ fontSize: "0.7rem" }} />
          </button>
          {menuOpen && (
            <div className="plan-menu">
              {plans.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={p === planName ? "active" : ""}
                  onClick={() => {
                    setActivePlan(p);
                    setMenuOpen(false);
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="muted"
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                + Add new degree plan
              </button>
            </div>
          )}
        </div>
        <div className="panel-header-actions">
          <button
            className="top-bar-btn"
            type="button"
            onClick={() => setShowStats(!showStats)}
          >
            <i className="fas fa-chart-bar top-bar-icon" />
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
          <button
            className="top-bar-btn"
            type="button"
            onClick={() => setEditMode(!editMode)}
          >
            <i
              className={`fas ${editMode ? "fa-check" : "fa-pen-to-square"} top-bar-icon`}
            />
            {editMode ? "Done" : "Edit"}
          </button>
        </div>
      </header>
      <div className="panel-body" onClick={() => setMenuOpen(false)}>
        <div className="semesters">
          {semesters
            .filter((s) => s.season === "transfer")
            .map((semester) => (
              <Semester key={semester.id} semester={semester} />
            ))}
          {semesters
            .filter((s) => s.season !== "transfer")
            .map((semester) => (
              <Semester key={semester.id} semester={semester} />
            ))}
          {editMode && (
            <article className="semester add-semester">
              {!addOpen ? (
                <button type="button" onClick={() => setAddOpen(true)}>
                  <i className="fas fa-plus" />
                  <span>Add Semester</span>
                </button>
              ) : (
                <div className="add-semester-choices">
                  <button
                    type="button"
                    onClick={() => {
                      addSemester("spring");
                      setAddOpen(false);
                    }}
                  >
                    Spring
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addSemester("fall");
                      setAddOpen(false);
                    }}
                  >
                    Fall
                  </button>
                  <button
                    type="button"
                    className="muted"
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
