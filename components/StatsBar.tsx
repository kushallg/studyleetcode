interface Props {
  totalAttempted: number;
  streak: number;
  dueTomorrow: number;
}

export default function StatsBar({ totalAttempted, streak, dueTomorrow }: Props) {
  return (
    <div className="grid grid-cols-3 border border-border bg-panel">
      <Stat label="Total solved" value={totalAttempted} />
      <Stat label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} divider />
      <Stat label="Due tomorrow" value={dueTomorrow} divider />
    </div>
  );
}

function Stat({
  label,
  value,
  divider,
}: {
  label: string;
  value: number | string;
  divider?: boolean;
}) {
  return (
    <div className={"px-5 py-4 " + (divider ? "border-l border-border" : "")}>
      <div className="mb-1 text-xs uppercase tracking-wider text-faint">{label}</div>
      <div className="font-mono text-2xl text-ink">{value}</div>
    </div>
  );
}
