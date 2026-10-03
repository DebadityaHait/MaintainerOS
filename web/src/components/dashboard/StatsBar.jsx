import { cn } from "../../lib/utils";

function StatCard({ n, label, hot, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "queue-filter", active && "queue-filter-active"
      )}
    >
      <div
        className={cn(
          "queue-filter-count tabular-nums",
          hot && n > 0 ? "text-danger" : "text-text-primary"
        )}
      >
        {n}
      </div>
      <div className="queue-filter-label">
        {label}
      </div>
    </button>
  );
}

export function StatsBar({ stats, L, filter, setFilter }) {
  const counts = stats?.counts || {};
  const items = [
    { n: stats?.total ?? 0, label: L.stat.reviewed, hot: false, key: "all" },
    { n: counts.attention || 0, label: L.stat.attention, hot: true, key: "attention" },
    { n: counts.duplicates || 0, label: L.stat.duplicates, hot: false, key: "duplicates" },
    { n: counts.ready || 0, label: L.stat.ready, hot: false, key: "ready" },
    { n: counts.good_first || 0, label: L.stat.good_first, hot: false, key: "good_first" },
    { n: counts.more_info || 0, label: L.stat.more_info, hot: false, key: "more_info" },
  ];

  return (
    <div className="queue-filters">
      {items.map((item) => (
        <StatCard
          key={item.key}
          {...item}
          active={filter === item.key}
          onClick={() => setFilter(filter === item.key ? "all" : item.key)}
        />
      ))}
    </div>
  );
}
