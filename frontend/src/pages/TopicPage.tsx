import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTopics } from "../shared/api";
import { Markdown } from "../ui/Markdown";

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { data: topics, isLoading } = useTopics();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  if (isLoading) return <p className="muted">Loading…</p>;
  const topic = topics?.find((t) => t.id === topicId);
  if (!topic) return <p className="error">Topic not found.</p>;

  const current = activeLesson ?? topic.lessons[0]?.id ?? null;

  return (
    <section className="topic-view">
      <Link to="/learn" className="back-link">
        <ArrowLeft size={15} /> All topics
      </Link>

      <div className="page-head">
        <h1>{topic.name}</h1>
        <p className="muted">{topic.description}</p>
      </div>

      <div className="topic-layout">
        <aside className="lesson-list">
          <h3>Lessons</h3>
          {topic.lessons.length === 0 && <p className="muted">No lessons yet.</p>}
          {topic.lessons.map((l) => (
            <button
              type="button"
              key={l.id}
              className={`lesson-link ${current === l.id ? "active" : ""}`}
              onClick={() => setActiveLesson(l.id)}
            >
              {l.title}
            </button>
          ))}

          {topic.resources && topic.resources.length > 0 && (
            <>
              <h3>Resources</h3>
              <ul className="resource-list">
                {topic.resources.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.name} <ExternalLink size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <div className="lesson-body">
          {current && topic.lessonBodies[current] ? (
            <Markdown>{topic.lessonBodies[current]}</Markdown>
          ) : (
            <p className="muted">Select a lesson.</p>
          )}
        </div>
      </div>
    </section>
  );
}
