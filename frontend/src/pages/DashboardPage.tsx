import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuestions } from "../shared/api";
import type { TopicId } from "../shared/types";
import { useProgress } from "../shared/useProgress";
import { TOPIC_LABELS } from "../ui/badges";

export default function DashboardPage() {
  const { data: questions } = useQuestions();
  const { data: progress } = useProgress();

  const stats = useMemo(() => {
    if (!questions) return null;
    const total = questions.length;
    let solved = 0;
    let attempted = 0;
    let favorites = 0;
    let dueToday = 0;
    const now = Date.now();

    const perTopic: Record<string, { total: number; solved: number }> = {};
    for (const item of questions) {
      perTopic[item.topic] ??= { total: 0, solved: 0 };
      perTopic[item.topic].total += 1;
      const p = progress?.[item.id];
      if (p?.status === "solved") {
        solved += 1;
        perTopic[item.topic].solved += 1;
      } else if (p?.status === "attempted") {
        attempted += 1;
      }
      if (p?.favorite) favorites += 1;
      if (p?.dueAt && p.dueAt <= now) dueToday += 1;
    }
    return { total, solved, attempted, favorites, dueToday, perTopic };
  }, [questions, progress]);

  if (!stats) return <p className="muted">Loading…</p>;

  return (
    <section>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="muted">Your progress lives on this device (IndexedDB).</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-num">
            {stats.solved}/{stats.total}
          </span>
          <span className="stat-label">Solved</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.attempted}</span>
          <span className="stat-label">Attempted</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.favorites}</span>
          <span className="stat-label">Favorites</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-num">{stats.dueToday}</span>
          <span className="stat-label">Due for review</span>
        </div>
      </div>

      <h2 className="section-title">By topic</h2>
      <div className="topic-progress">
        {Object.entries(stats.perTopic).map(([topic, s]) => {
          const pct = s.total ? Math.round((s.solved / s.total) * 100) : 0;
          return (
            <Link key={topic} to={`/learn/${topic}`} className="topic-progress-row">
              <span className="tp-name">{TOPIC_LABELS[topic as TopicId] ?? topic}</span>
              <div className="tp-bar">
                <div className="tp-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="tp-count">
                {s.solved}/{s.total}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
