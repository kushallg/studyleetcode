export type Difficulty = "Easy" | "Medium" | "Hard";
export type Source = "neetcode150" | "blind75" | "both";

export type Pattern =
  | "Arrays & Hashing"
  | "Two Pointers"
  | "Sliding Window"
  | "Stack"
  | "Binary Search"
  | "Linked List"
  | "Trees"
  | "Tries"
  | "Heap / Priority Queue"
  | "Backtracking"
  | "Graphs"
  | "Advanced Graphs"
  | "1D Dynamic Programming"
  | "2D Dynamic Programming"
  | "Greedy"
  | "Intervals"
  | "Math & Geometry"
  | "Bit Manipulation";

export interface Problem {
  id: string;
  title: string;
  leetcode_url: string;
  difficulty: Difficulty;
  pattern: Pattern;
  source: Source;
  interleave_group: number;
}

export interface Attempt {
  id: string;
  problem_id: string;
  attempted_at: string;
  struggled: boolean;
  personal_difficulty: Difficulty;
  active_recall_question: string;
  active_recall_answer: string | null;
  is_review: boolean;
}

export interface SessionProblem {
  problem: Problem;
  isReview: boolean;
  lastAttempt?: Attempt;
}
