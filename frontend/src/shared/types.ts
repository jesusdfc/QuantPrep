export type Difficulty = "easy" | "medium" | "hard";

export type TopicId =
  | "probability"
  | "statistics"
  | "machine-learning"
  | "portfolio-construction"
  | "quantitative-research"
  | "sql";

export interface QuestionSource {
  name: string;
  url: string | null;
  license: string;
}

export interface Question {
  id: string;
  title: string;
  topic: TopicId;
  subtopic: string;
  difficulty: Difficulty;
  tags: string[];
  locked: boolean;
  source: QuestionSource;
  prompt: string;
  hints?: string[];
  solution: string;
  answer?: string | null;
}

export interface Subtopic {
  id: string;
  name: string;
}

export interface Resource {
  name: string;
  url: string;
  license?: string;
}

export interface LessonMeta {
  id: string;
  title: string;
  topic: TopicId;
  subtopic: string;
  order: number;
  summary?: string;
  license?: string;
  attribution?: string;
  prerequisites?: string[];
  resources?: Resource[];
}

export interface Topic {
  id: TopicId;
  name: string;
  order: number;
  weight?: number | null;
  description: string;
  subtopics?: Subtopic[];
  resources?: Resource[];
  lessons: LessonMeta[];
  lessonBodies: Record<string, string>;
  questionCount: number;
}
