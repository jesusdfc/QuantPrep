import { CheckCircle2, Circle, Heart, Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuestions } from "../shared/api";
import type { Difficulty, TopicId } from "../shared/types";
import { useProgress, useProgressActions } from "../shared/useProgress";
import { DifficultyBadge, TOPIC_LABELS, TopicBadge } from "../ui/badges";

const TOPICS = Object.keys(TOPIC_LABELS) as TopicId[];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export default function QuestionsPage() {
  const { data: questions, isLoading, error } = useQuestions();
  const { data: progress } = useProgress();
  const { favorite } = useProgressActions();

  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<TopicId | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [favOnly, setFavOnly] = useState(false);

  const rows = useMemo(() => {
    if (!questions) return [];
    const needle = q.trim().toLowerCase();
    return questions.filter((item) => {
      if (topic !== "all" && item.topic !== topic) return false;
      if (difficulty !== "all" && item.difficulty !== difficulty) return false;
      if (favOnly && !progress?.[item.id]?.favorite) return false;
      if (needle) {
        const hay = `${item.title} ${item.subtopic} ${item.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [questions, q, topic, difficulty, favOnly, progress]);

  if (isLoading) return <p className="muted">Loading questions…</p>;
  if (error) return <p className="error">Failed to load questions.</p>;

  return (
    <section>
      <div className="page-head">
        <h1>Questions</h1>
        <p className="muted">
          {rows.length} of {questions?.length ?? 0} problems
        </p>
      </div>

      <div className="filters">
        <label className="search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search title, subtopic, or tag…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId | "all")}>
          <option value="all">All topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {TOPIC_LABELS[t]}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty | "all")}
        >
          <option value="all">All difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d[0].toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`toggle ${favOnly ? "active" : ""}`}
          onClick={() => setFavOnly((v) => !v)}
        >
          <Heart size={15} /> Favorites
        </button>
      </div>

      <div className="table-wrap">
        <table className="qtable">
          <thead>
            <tr>
              <th className="col-fav" aria-label="favorite" />
              <th className="col-status" aria-label="status" />
              <th>Name</th>
              <th>Topic</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const p = progress?.[item.id];
              return (
                <tr key={item.id}>
                  <td className="col-fav">
                    <button
                      type="button"
                      className={`icon-btn ${p?.favorite ? "fav-on" : ""}`}
                      onClick={() => favorite.mutate(item.id)}
                      aria-label="toggle favorite"
                    >
                      <Heart size={16} fill={p?.favorite ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="col-status">
                    {p?.status === "solved" ? (
                      <CheckCircle2 size={16} className="solved-icon" />
                    ) : (
                      <Circle size={16} className="unseen-icon" />
                    )}
                  </td>
                  <td className="col-name">
                    <Link to={`/questions/${item.id}`} className="qlink">
                      {item.locked && <Lock size={13} className="lock-icon" />}
                      {item.title}
                    </Link>
                  </td>
                  <td>
                    <TopicBadge topic={item.topic} />
                  </td>
                  <td>
                    <DifficultyBadge difficulty={item.difficulty} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="muted empty">No questions match your filters.</p>}
      </div>
    </section>
  );
}
