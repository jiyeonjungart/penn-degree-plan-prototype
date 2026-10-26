import { useEffect, useRef } from "react";
import { CountsForPopup } from "./components/CountsForPopup";
import { Dock } from "./components/Dock";
import { Footer } from "./components/Footer";
import { PlanPanel } from "./components/PlanPanel";
import { ReqPanel } from "./components/ReqPanel";
import { ReviewPanel } from "./components/ReviewPanel";
import { SearchPanel } from "./components/SearchPanel";
import { SplitPanes } from "./components/SplitPanes";
import { TopBar } from "./components/TopBar";
import { PlanProvider, usePlan } from "./planContext";
import "./styles.css";

function Shell() {
  const {
    searchOpen,
    toast,
    infoPanel,
    closeInfo,
    countsForPanel,
    closeCountsFor,
    getCourse,
    planColumnOpen,
    reqColumnOpen,
  } = usePlan();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!infoPanel && !countsForPanel) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".review-panel")) return;
      if (target.closest(".counts-for-popup")) return;
      if (target.closest(".course-info")) return;
      if (target.closest(".course-card")) return;
      if (target.closest(".option-chip")) return;
      if (target.closest(".search-row")) return;
      closeInfo();
      closeCountsFor();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [infoPanel, countsForPanel, closeInfo, closeCountsFor]);

  return (
    <div className="app">
      <TopBar />
      <main className="body">
        <SplitPanes
          left={planColumnOpen ? <PlanPanel /> : null}
          center={reqColumnOpen ? <ReqPanel /> : null}
          right={searchOpen ? <SearchPanel /> : null}
        />
      </main>
      <Footer />
      <Dock />
      {toast && <div className="toast">{toast}</div>}
      {infoPanel && (
        <ReviewPanel
          panelRef={panelRef}
          course={getCourse(infoPanel.code)}
          semesterLabel={infoPanel.semesterLabel}
          position={{ top: infoPanel.top, left: infoPanel.left }}
          onClose={closeInfo}
        />
      )}
      {countsForPanel && (
        <CountsForPopup
          code={countsForPanel.code}
          position={{ top: countsForPanel.top, left: countsForPanel.left }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlanProvider>
      <Shell />
    </PlanProvider>
  );
}
