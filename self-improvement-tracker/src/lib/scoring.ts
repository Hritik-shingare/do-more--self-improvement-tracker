import type { ScoringInput, ScoreBreakdown } from '@/types/database';

// ============================================================
// Scoring Engine — Pure, isolated, testable function
// Formula:
//   Fitness Score   = min(100, (avg_steps / step_goal) * 60 + (avg_calories / cal_goal) * 40)
//   Skill Score     = min(100, (total_skill_minutes / weekly_goal) * 100)
//   Nutrition Score = 100 - penalty_for_days_without_food_log
//   Weekly Score    = 0.4 * Fitness + 0.4 * Skill + 0.2 * Nutrition
// ============================================================

export function computeWeeklyScore(input: ScoringInput): ScoreBreakdown {
  const {
    avgDailySteps,
    stepGoal,
    avgCaloriesBurned,
    calorieGoal,
    totalSkillMinutes,
    weeklyMinutesGoal,
    daysWithFoodLog,
  } = input;

  // Guard against division by zero with sensible defaults
  const safeStepGoal = stepGoal > 0 ? stepGoal : 8000;
  const safeCalorieGoal = calorieGoal > 0 ? calorieGoal : 500;
  const safeMinutesGoal = weeklyMinutesGoal > 0 ? weeklyMinutesGoal : 300;

  // Fitness Score (max 100)
  const stepsContribution = (avgDailySteps / safeStepGoal) * 60;
  const caloriesContribution = (avgCaloriesBurned / safeCalorieGoal) * 40;
  const fitnessScore = Math.min(100, stepsContribution + caloriesContribution);

  // Skill Score (max 100)
  const skillScore = Math.min(100, (totalSkillMinutes / safeMinutesGoal) * 100);

  // Nutrition Score (100 - penalty per day without food log)
  // Penalty = 100/7 ≈ 14.28 per missed day
  const daysWithoutLog = Math.max(0, 7 - daysWithFoodLog);
  const penaltyPerDay = 100 / 7;
  const nutritionScore = Math.max(0, 100 - daysWithoutLog * penaltyPerDay);

  // Weekly Total Score
  const totalScore =
    0.4 * fitnessScore + 0.4 * skillScore + 0.2 * nutritionScore;

  return {
    fitnessScore: Math.round(fitnessScore * 100) / 100,
    skillScore: Math.round(skillScore * 100) / 100,
    nutritionScore: Math.round(nutritionScore * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
  };
}

// ============================================================
// Helper: Get the Monday (week start) for a given date
// ============================================================
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // getDay() returns 0=Sun, 1=Mon ... 6=Sat; we want Monday as start
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============================================================
// Helper: Format date as YYYY-MM-DD
// ============================================================
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================
// Helper: Get all 7 days of the current week (Mon-Sun)
// ============================================================
export function getCurrentWeekDates(): string[] {
  const weekStart = getWeekStart();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return toDateString(d);
  });
}
