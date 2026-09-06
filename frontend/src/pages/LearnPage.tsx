import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTopics } from "../shared/api";

export default function LearnPage() {
  const { data: topics, isLoading, error } = useTopics();

  if (isLoading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error">Failed to load topics.</p>;

  return (
    <section>
      <div className="page-head">
        <h1>Learn</h1>
        <p className="muted">Theory by topic, ordered by suggested preparation weight.</p>
      </div>

      <div className="topic-grid">
        {topics?.map((t) => (
          <Link key={t.id} to={`/learn/${t.id}`} className="topic-card">
            <div className="topic-card-head">
              <BookOpen size={18} />
              <h2>{t.name}</h2>
            </div>
            <p className="muted">{t.description}</p>
            <div className="topic-card-foot">
              <span>{t.lessons.length} lessons</span>
              <span>{t.questionCount} questions</span>
              {t.weight != null && <span>{Math.round(t.weight * 100)}% weight</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
