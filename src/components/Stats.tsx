import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getStatColor } from "../data";

type StatCircleProps = {
  score: number;
  label: string;
  reverse?: boolean;
};

function ScoreRow({ score, label, reverse = false }: StatCircleProps) {
  const color = getStatColor(score, reverse);
  const isNa = Number.isNaN(score);
  const value = isNa ? 0 : score * 25;
  const text = isNa ? "N/A" : score.toFixed(1);

  return (
    <div className="stat" title={`${label}: ${text}`}>
      <div className="stat-circle">
        <CircularProgressbar
          value={value}
          text={text}
          strokeWidth={12}
          styles={{
            path: { stroke: color },
            trail: { stroke: "#d6d6d6" },
            text: {
              fontSize: "2rem",
              fill: color,
              fontWeight: 700,
            },
          }}
        />
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

type StatsProps = {
  cq: number;
  iq: number;
  diff: number;
  work: number;
};

export function Stats({ cq, iq, diff, work }: StatsProps) {
  return (
    <div className="stats">
      <ScoreRow score={cq} label="Course Quality" />
      <ScoreRow score={iq} label="Instructor Quality" />
      <ScoreRow score={diff} label="Difficulty" reverse />
      <ScoreRow score={work} label="Work Required" reverse />
    </div>
  );
}
