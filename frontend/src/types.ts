export interface StudentUser {
  id: number;
  student_id: string;
  full_name: string;
  age?: number | null;
  gender?: string;
  gaming_frequency?: number | null;
}

export interface Clue {
  id: string;
  title: string;
  detail: string;
}

export interface PuzzleAttempt {
  id: number;
  stage_code: string;
  puzzle_code: string;
  is_solved: boolean;
  attempts_count: number;
  errors_count: number;
  time_spent_seconds: number;
  score_earned: number;
}

export interface GameSession {
  id: number;
  student_id: string;
  student_name: string;
  status: 'in_progress' | 'completed' | 'expired';
  total_score: number;
  total_errors: number;
  time_remaining_seconds: number;
  total_time_spent_seconds: number;
  unlocked_clues: Clue[];
  completed_stages: string[];
  puzzle_attempts: PuzzleAttempt[];
}

export interface Badge {
  badge_code: string;
  title: string;
  description: string;
  earned_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  student_id: string;
  full_name: string;
  total_score: number;
  total_errors: number;
  time_spent_seconds: number;
  completed_stages_count: number;
}
