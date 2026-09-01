import type { ReactNode } from "react";

export interface Stat {
  end: number;
  prefix?: string;
  suffix?: string;
  title: string;
  icon?: ReactNode;
}

// Statically rendered: the identity's motion section rules out counters
// triggering in the viewport ("anything on scroll: never"), and prices
// and figures never count up. The number is a fact, so it is simply there.
function StatItem({ stat }: { stat: Stat }) {
  return (
    <div className="stat">
      <div className="stat__row">
        <div className="stat__number">
          {stat.prefix}
          {stat.end.toLocaleString("en-AU")}
          {stat.suffix}
        </div>
        {stat.icon && (
          <span className="stat__icon" aria-hidden="true">
            {stat.icon}
          </span>
        )}
      </div>
      <div className="stat__title">{stat.title}</div>
    </div>
  );
}

export default function StatCounter({ stats }: { stats: Stat[] }) {
  return (
    <div className="stats">
      {stats.map((s) => (
        <StatItem key={s.title} stat={s} />
      ))}
    </div>
  );
}
