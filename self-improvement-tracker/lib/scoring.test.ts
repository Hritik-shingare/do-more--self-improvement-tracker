import { computeWeeklyScore, getWeekStart, toDateString } from './scoring';

describe('computeWeeklyScore', () => {
  const defaultGoals = {
    stepGoal: 8000,
    calorieGoal: 500,
    weeklyMinutesGoal: 300,
  };

  test('perfect week — all goals met — returns max score', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 8000,
      avgCaloriesBurned: 500,
      totalSkillMinutes: 300,
      daysWithFoodLog: 7,
      ...defaultGoals,
    });
    expect(result.fitnessScore).toBe(100);
    expect(result.skillScore).toBe(100);
    expect(result.nutritionScore).toBeCloseTo(100, 1);
    expect(result.totalScore).toBeCloseTo(100, 1);
  });

  test('zero activity — returns zero total', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 0,
      avgCaloriesBurned: 0,
      totalSkillMinutes: 0,
      daysWithFoodLog: 0,
      ...defaultGoals,
    });
    expect(result.fitnessScore).toBe(0);
    expect(result.skillScore).toBe(0);
    expect(result.nutritionScore).toBe(0);
    expect(result.totalScore).toBe(0);
  });

  test('half goals met — score is roughly 50', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 4000,   // 50% of 8000
      avgCaloriesBurned: 250, // 50% of 500
      totalSkillMinutes: 150, // 50% of 300
      daysWithFoodLog: 7,     // full nutrition
      ...defaultGoals,
    });
    // Fitness: (0.5 * 60) + (0.5 * 40) = 50
    expect(result.fitnessScore).toBeCloseTo(50, 1);
    // Skill: 50
    expect(result.skillScore).toBeCloseTo(50, 1);
    // Nutrition: 100 (logged all days)
    expect(result.nutritionScore).toBeCloseTo(100, 1);
    // Total: 0.4*50 + 0.4*50 + 0.2*100 = 20 + 20 + 20 = 60
    expect(result.totalScore).toBeCloseTo(60, 1);
  });

  test('no food logs — nutrition penalty is applied', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 8000,
      avgCaloriesBurned: 500,
      totalSkillMinutes: 300,
      daysWithFoodLog: 0, // 0 days logged
      ...defaultGoals,
    });
    expect(result.nutritionScore).toBeCloseTo(0, 1);
  });

  test('partial food logs — nutrition is proportional', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 0,
      avgCaloriesBurned: 0,
      totalSkillMinutes: 0,
      daysWithFoodLog: 3, // 3 out of 7
      ...defaultGoals,
    });
    // 4 days without = 4 * (100/7) ≈ 57.14 penalty
    expect(result.nutritionScore).toBeCloseTo((3 / 7) * 100, 0);
  });

  test('exceeding goals — fitness score is capped at 100', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 20000, // far above goal
      avgCaloriesBurned: 2000, // far above goal
      totalSkillMinutes: 1000, // far above goal
      daysWithFoodLog: 7,
      ...defaultGoals,
    });
    expect(result.fitnessScore).toBe(100);
    expect(result.skillScore).toBe(100);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  test('steps only contributes to fitness correctly', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 8000, // 100% of goal → 60 pts
      avgCaloriesBurned: 0, // 0 pts
      totalSkillMinutes: 0,
      daysWithFoodLog: 0,
      ...defaultGoals,
    });
    expect(result.fitnessScore).toBeCloseTo(60, 1);
  });

  test('calories only contributes to fitness correctly', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 0, // 0 pts
      avgCaloriesBurned: 500, // 100% of goal → 40 pts
      totalSkillMinutes: 0,
      daysWithFoodLog: 0,
      ...defaultGoals,
    });
    expect(result.fitnessScore).toBeCloseTo(40, 1);
  });

  test('handles zero goals gracefully — uses defaults', () => {
    const result = computeWeeklyScore({
      avgDailySteps: 8000,
      avgCaloriesBurned: 500,
      totalSkillMinutes: 300,
      daysWithFoodLog: 7,
      stepGoal: 0,     // should default to 8000
      calorieGoal: 0,  // should default to 500
      weeklyMinutesGoal: 0, // should default to 300
    });
    // With defaults, this is a perfect week
    expect(result.totalScore).toBeGreaterThan(90);
  });
});

describe('getWeekStart', () => {
  test('returns Monday for any weekday', () => {
    // Test on a known Wednesday: 2024-01-10
    const wednesday = new Date('2024-01-10T12:00:00');
    const weekStart = getWeekStart(wednesday);
    expect(weekStart.getDay()).toBe(1); // 1 = Monday
    expect(weekStart.toISOString().split('T')[0]).toBe('2024-01-08');
  });

  test('returns previous Monday for Sunday', () => {
    const sunday = new Date('2024-01-14T12:00:00');
    const weekStart = getWeekStart(sunday);
    expect(weekStart.getDay()).toBe(1);
    expect(weekStart.toISOString().split('T')[0]).toBe('2024-01-08');
  });

  test('returns same Monday for Monday', () => {
    const monday = new Date('2024-01-08T12:00:00');
    const weekStart = getWeekStart(monday);
    expect(weekStart.toISOString().split('T')[0]).toBe('2024-01-08');
  });
});

describe('toDateString', () => {
  test('formats date as YYYY-MM-DD', () => {
    const date = new Date('2024-03-15T10:00:00');
    expect(toDateString(date)).toBe('2024-03-15');
  });
});
