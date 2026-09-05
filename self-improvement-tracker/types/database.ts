// ============================================================
// Database types matching the Supabase schema
// ============================================================

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface UserGoals {
  user_id: string;
  step_goal: number;
  calorie_burn_goal: number;
  weekly_skill_minutes_goal: number;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  steps: number;
  ran_today: boolean;
  run_distance_km: number | null;
  calories_burned: number;
  created_at: string;
}

export interface FoodEntry {
  id: string;
  daily_log_id: string;
  food_name: string;
  estimated_calories: number;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  skill_areas?: SkillArea[];
}

export interface SkillArea {
  id: string;
  skill_id: string;
  name: string;
  progress_percent: number;
  updated_at: string;
}

export interface SkillTimeLog {
  id: string;
  user_id: string;
  skill_id: string;
  log_date: string;
  minutes_spent: number;
  created_at: string;
  skill?: Skill | { name: string };
}

export interface WeeklyScore {
  id: string;
  user_id: string;
  week_start_date: string;
  fitness_score: number;
  skill_score: number;
  nutrition_score: number;
  total_score: number;
  rank_in_friend_group: number | null;
  computed_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend?: UserProfile;
}

export interface DailyLogWithDetails extends DailyLog {
  food_entries: FoodEntry[];
  skill_time_logs: SkillTimeLog[];
}

export interface LeaderboardEntry {
  user: UserProfile;
  current_score: WeeklyScore | null;
  previous_score: WeeklyScore | null;
  rank: number;
  rank_change: number;
}

export interface ScoreBreakdown {
  fitnessScore: number;
  skillScore: number;
  nutritionScore: number;
  totalScore: number;
}

export interface ScoringInput {
  avgDailySteps: number;
  stepGoal: number;
  avgCaloriesBurned: number;
  calorieGoal: number;
  totalSkillMinutes: number;
  weeklyMinutesGoal: number;
  daysWithFoodLog: number;
}
