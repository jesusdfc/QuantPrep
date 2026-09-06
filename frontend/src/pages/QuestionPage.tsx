import { ArrowLeft, Check, ExternalLink, Eye, Heart, Lightbulb } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuestions } from "../shared/api";
import { useProgress, useProgressActions } from "../shared/useProgress";
import { Markdown } from "../ui/Markdown";
import { DifficultyBadge, TopicBadge } from "../ui/badges";

export default function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { data: questions, isLoading } = useQuestions();
  const { data: progress } = useProgress();
  const { favorite, status } = useProgressActions();

  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const question = useMemo(() => questions?.find((x) => x.id === id), [questions, id]);

  // Mark as attempted the first time the question is opened.
  const currentStatus = id ? progress?.[id]?.status : undefined;
  const markAttempted = status.mutate;
  useEffect(() => {
    if (id && progress && (currentStatus === undefined || currentStatus === "unseen")) {
      markAttempted({ id, status: "attempted" });
    }
  }, [id, currentStatus, progress, markAttempted]);

  if (isLoading) return <p className="muted">Loading…</p>;
  if (!question) return <p className="error">Question not found.</p>;

  const p = progress?.[question.id];
  const hints = question.hints ?? [];

  return (
    <article className="question-view">
      <Link to="/questions" className="back-link">
        <ArrowLeft size={15} /> All questions
      </Link>

      <header className="q-header">
        <div>
          <h1>{question.title}</h1>
          <div className="q-meta">
            <TopicBadge topic={question.topic} />
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="subtopic">{question.subtopic}</span>
          </div>
        </div>
        <div className="q-actions">
          <button
            type="button"
            className={`icon-btn big ${p?.status === "solved" ? "solved-on" : ""}`}
            onClick={() => status.mutate({ id: question.id, status: "solved" })}
            disabled={p?.status === "solved" || status.isPending}
            aria-label={p?.status === "solved" ? "Solved" : "Mark as solved"}
            title={p?.status === "solved" ? "Solved" : "Mark as solved"}
          >
            <Check size={22} />
          </button>
          <button
            type="button"
            className={`icon-btn big ${p?.favorite ? "fav-on" : ""}`}
            onClick={() => favorite.mutate(question.id)}
            aria-label="Toggle favorite"
            title={p?.favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={22} fill={p?.favorite ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <section className="q-prompt">
        <Markdown>{question.prompt}</Markdown>
      </section>

      <div className="tag-row">
        {question.tags.map((t) => (
          <span key={t} className="tag">
            #{t}
          </span>
        ))}
      </div>

      {hints.length > 0 && (
        <section className="hints">
          <h2>
            <Lightbulb size={16} /> Hints
          </h2>
          {hints.slice(0, revealedHints).map((h) => (
            <div key={h} className="hint-card">
              <Markdown>{h}</Markdown>
            </div>
          ))}
          {revealedHints < hints.length && (
            <button
              type="button"
              className="btn subtle"
              onClick={() => setRevealedHints((n) => n + 1)}
            >
              Show hint {revealedHints + 1} of {hints.length}
            </button>
          )}
        </section>
      )}

      <section className="solution">
        {showSolution ? (
          <>
            <h2>Solution</h2>
            {question.answer && (
              <p className="answer-line">
                <Check size={15} /> <strong>Answer:</strong> {question.answer}
              </p>
            )}
            <Markdown>{question.solution}</Markdown>
          </>
        ) : (
          <button type="button" className="btn primary" onClick={() => setShowSolution(true)}>
            <Eye size={16} /> Reveal solution
          </button>
        )}
      </section>

      <footer className="source">
        Source: {question.source.name}
        {question.source.url && (
          <a href={question.source.url} target="_blank" rel="noreferrer">
            <ExternalLink size={12} /> link
          </a>
        )}
        <span className="license">· {question.source.license}</span>
      </footer>
    </article>
  );
}
