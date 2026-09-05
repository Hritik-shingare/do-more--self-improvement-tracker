'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { computeWeeklyScore, getCurrentWeekDates, toDateString } from '@/lib/scoring';
import type { DailyLog, FoodEntry, SkillTimeLog, WeeklyScore, UserGoals, UserProfile } from '@/types/database';
import ScoreRing from '@/components/ScoreRing';
import ScoreBreakdownBar from '@/components/ScoreBreakdownBar';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [skillLogs, setSkillLogs] = useState<SkillTimeLog[]>([]);
  const [weeklyScore, setWeeklyScore] = useState<WeeklyScore | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const today = toDateString(new Date());

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [
      { data: prof },
      { data: log },
      { data: goal },
      { data: score },
    ] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).single(),
      supabase.from('user_goals').select('*').eq('user_id', user.id).single(),
      supabase.from('weekly_scores').select('*').eq('user_id', user.id)
        .order('week_start_date', { ascending: false }).limit(1).single(),
    ]);

    setProfile(prof);
    setGoals(goal);
    setWeeklyScore(score);

    if (log) {
      setTodayLog(log);
      const [{ data: food }, { data: skillTime }] = await Promise.all([
        supabase.from('food_entries').select('*').eq('daily_log_id', log.id),
        supabase.from('skill_time_logs').select('*, skill:skills(name)').eq('user_id', user.id).eq('log_date', today),
      ]);
      setFoodEntries(food || []);
      setSkillLogs((skillTime as SkillTimeLog[]) || []);
    }

    setLoading(false);
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  // Compute live weekly score from this week's logs
  const [liveScore, setLiveScore] = useState<ReturnType<typeof computeWeeklyScore> | null>(null);

  useEffect(() => {
    async function computeLive() {
      if (!goals) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekDates = getCurrentWeekDates();
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*, food_entries(id)')
        .eq('user_id', user.id)
        .in('log_date', weekDates);

      const { data: skillTimeLogs } = await supabase
        .from('skill_time_logs')
        .select('minutes_spent')
        .eq('user_id', user.id)
        .in('log_date', weekDates);

      if (!logs) return;

      const avgSteps = logs.reduce((s, l) => s + (l.steps || 0), 0) / 7;
      const avgCalories = logs.reduce((s, l) => s + (l.calories_burned || 0), 0) / 7;
      const totalMinutes = (skillTimeLogs || []).reduce((s, l) => s + l.minutes_spent, 0);
      const daysWithFood = logs.filter((l) => l.food_entries && l.food_entries.length > 0).length;

      setLiveScore(computeWeeklyScore({
        avgDailySteps: avgSteps,
        stepGoal: goals.step_goal,
        avgCaloriesBurned: avgCalories,
        calorieGoal: goals.calorie_burn_goal,
        totalSkillMinutes: totalMinutes,
        weeklyMinutesGoal: goals.weekly_skill_minutes_goal,
        daysWithFoodLog: daysWithFood,
      }));
    }
    computeLive();
  }, [goals]);

  if (loading) return <DashboardSkeleton />;

  const greeting = getGreeting();
  const totalSkillMinutesToday = skillLogs.reduce((s, l) => s + l.minutes_spent, 0);
  const totalFoodCalories = foodEntries.reduce((s, e) => s + e.estimated_calories, 0);
  const hasLoggedToday = !!todayLog;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in-up">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{greeting}</p>
        <h1 style={{ color: 'var(--text-primary)' }}>
          {profile?.display_name || profile?.username || 'Welcome back'} 👋
        </h1>
      </div>

      {/* Score Ring + Breakdown */}
      <div className="card card-gradient animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 500 }}>
          THIS WEEK&apos;S SCORE
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <ScoreRing score={liveScore?.totalScore ?? weeklyScore?.total_score ?? 0} size={160} />

          {liveScore && (
            <div style={{ width: '100%' }}>
              <ScoreBreakdownBar
                fitness={liveScore.fitnessScore}
                skill={liveScore.skillScore}
                nutrition={liveScore.nutritionScore}
              />
            </div>
          )}
        </div>
      </div>

      {/* Today's Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard
          label="Steps Today"
          value={todayLog?.steps?.toLocaleString() ?? '—'}
          goal={goals?.step_goal}
          icon="👟"
          progress={todayLog && goals ? (todayLog.steps / goals.step_goal) * 100 : 0}
          className="animate-fade-in-up delay-200"
        />
        <StatCard
          label="Calories Burned"
          value={todayLog?.calories_burned?.toLocaleString() ?? '—'}
          goal={goals?.calorie_burn_goal}
          icon="🔥"
          progress={todayLog && goals ? (todayLog.calories_burned / goals.calorie_burn_goal) * 100 : 0}
          className="animate-fade-in-up delay-300"
        />
        <StatCard
          label="Skill Minutes"
          value={totalSkillMinutesToday > 0 ? `${totalSkillMinutesToday}m` : '—'}
          icon="🎯"
          progress={goals ? (totalSkillMinutesToday / (goals.weekly_skill_minutes_goal / 7)) * 100 : 0}
          className="animate-fade-in-up delay-300"
        />
        <StatCard
          label="Food Calories"
          value={totalFoodCalories > 0 ? `${totalFoodCalories.toLocaleString()} kcal` : '—'}
          icon="🥗"
          progress={foodEntries.length > 0 ? 100 : 0}
          className="animate-fade-in-up delay-400"
        />
      </div>

      {/* Log Today CTA */}
      <div className="animate-fade-in-up delay-400">
        {!hasLoggedToday ? (
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '1rem', textAlign: 'center', padding: '2rem',
          }}>
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No log yet today</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                Log your activity to keep your streak going!
              </p>
            </div>
            <Link href="/log" className="btn btn-primary btn-lg animate-pulse-glow" id="dashboard-log-today-btn">
              Log Today →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/log" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} id="dashboard-edit-log-btn">
              ✏️ Edit Today&apos;s Log
            </Link>
            <Link href="/leaderboard" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} id="dashboard-leaderboard-btn">
              🏆 Leaderboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, goal, icon, progress, className = '' }: {
  label: string; value: string; goal?: number; icon: string;
  progress: number; className?: string;
}) {
  return (
    <div className={`stat-card ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ marginTop: '0.25rem' }}>{value}</div>
          {goal && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              / {goal.toLocaleString()}
            </div>
          )}
        </div>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
        <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: '0.5rem', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: '2rem', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />)}
      </div>
      <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}
