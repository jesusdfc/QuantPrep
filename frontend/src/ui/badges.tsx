import type { Difficulty, TopicId } from "../shared/types";

export const TOPIC_LABELS: Record<TopicId, string> = {
  probability: "Probability",
  statistics: "Statistics",
  "machine-learning": "Machine Learning",
  "portfolio-construction": "Portfolio Construction",
  "quantitative-research": "Quantitative Research",
  sql: "SQL",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`badge diff-${difficulty}`}>{difficulty}</span>;
}

export function TopicBadge({ topic }: { topic: TopicId }) {
  return <span className={`badge topic-${topic}`}>{TOPIC_LABELS[topic]}</span>;
}
