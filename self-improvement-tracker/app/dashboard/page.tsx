'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Footprints,
  Flame,
  Clock,
  Plus,
  Utensils,
  Dumbbell,
  Check,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { computeWeeklyScore, getCurrentWeekDates, toDateString } from '@/lib/scoring';
import type { DailyLog, FoodEntry, SkillTimeLog, WeeklyScore, UserGoals, UserProfile } from '@/types/database';
import CircularGauge from '@/components/CircularGauge';
import HighlightedCard from '@/components/HighlightedCard';
import ScoreBreakdownBar from '@/components/ScoreBreakdownBar';
import StreakFlame from '@/components/StreakFlame';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [skillLogs, setSkillLogs] = useState<SkillTimeLog[]>([]);
  const [weeklyScore, setWeeklyScore] = useState<WeeklyScore | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDaysCount, setActiveDaysCount] = useState<number>(0);
  const [activeTimeTab, setActiveTimeTab] = useState<'week' | 'day' | 'month'>('week');
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

      setActiveDaysCount(logs.length);

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

  const displayName = profile?.display_name || profile?.username || 'Emon';
  const totalSkillMinutesToday = skillLogs.reduce((s, l) => s + l.minutes_spent, 0);
  const totalFoodCalories = foodEntries.reduce((s, e) => s + e.estimated_calories, 0);
  const hasLoggedToday = !!todayLog;
  const currentTotalScore = liveScore?.totalScore ?? weeklyScore?.total_score ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: 580, margin: '0 auto', paddingBottom: '2.5rem' }}
    >
      {/* ── Top Header (Exact Match to Screen 2: "Hi Emon 👋") ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.2rem)',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Hi {displayName} 👋
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.92rem',
              fontWeight: 500,
              marginTop: '0.2rem',
            }}
          >
            Ready to crush your goals today?
          </p>
        </div>

        {/* Action button on right: Plus button in solid lime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: '#161616',
              borderRadius: '9999px',
              padding: '0.4rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <StreakFlame days={activeDaysCount || (hasLoggedToday ? 1 : 0)} size={20} />
          </div>

          <Link
            href="/log"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'var(--accent-lime)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(212, 255, 63, 0.3)',
            }}
            id="dashboard-header-add-btn"
            aria-label="Add Log"
          >
            <Plus size={22} strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* ── Highlighted Feature Card (Reference Screen 2: Workout Plan lime card) ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        {!hasLoggedToday ? (
          <HighlightedCard
            badge="Action Plan"
            title="Log Today's Activity"
            subtitle="Record your steps, burned calories & deliberate skill practice."
            icon={<Dumbbell size={22} strokeWidth={2.4} />}
            actionText="Start Logging"
            actionHref="/log"
          />
        ) : (
          <HighlightedCard
            badge="Today's Momentum"
            title="Active Streak On Fire! 🔥"
            subtitle={`${todayLog?.steps?.toLocaleString() ?? 0} steps and ${todayLog?.calories_burned ?? 0} kcal logged.`}
            icon={<Flame size={22} strokeWidth={2.4} />}
            actionText="Update Today's Log"
            actionHref="/log"
          />
        )}
      </div>

      {/* ── Score & Activity Section with Segmented Control (Screen 3 style) ── */}
      <div
        className="card"
        style={{
          background: '#161616',
          borderRadius: '24px',
          padding: '1.75rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Segmented Toggle Control (Day / Week / Month) */}
        <div className="segmented-control" style={{ marginBottom: '1.75rem' }}>
          <button
            onClick={() => setActiveTimeTab('day')}
            className={`segmented-item ${activeTimeTab === 'day' ? 'active' : ''}`}
          >
            Day
          </button>
          <button
            onClick={() => setActiveTimeTab('week')}
            className={`segmented-item ${activeTimeTab === 'week' ? 'active' : ''}`}
          >
            Week
          </button>
          <button
            onClick={() => setActiveTimeTab('month')}
            className={`segmented-item ${activeTimeTab === 'month' ? 'active' : ''}`}
          >
            Month
          </button>
        </div>

        {/* Circular Progress Gauge (Screen 3 exact style) */}
        <CircularGauge
          value={Math.round(currentTotalScore)}
          max={100}
          size={196}
          strokeWidth={15}
          labelTop={activeTimeTab === 'week' ? 'This Week' : activeTimeTab === 'day' ? 'Today' : 'This Month'}
          labelBottom="Score"
          goalLabel="Goal: 100 points"
        />

        {/* Breakdown bars underneath */}
        {liveScore && (
          <div style={{ width: '100%', marginTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
            <ScoreBreakdownBar
              fitness={liveScore.fitnessScore}
              skill={liveScore.skillScore}
              nutrition={liveScore.nutritionScore}
            />
          </div>
        )}
      </div>

      {/* ── My Activity (3 Mini-Card Row from Screen 2 & 3) ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.85rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            My Activity
          </h2>
          <Link
            href="/log"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--accent-lime)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          {/* Card 1: Steps */}
          <div className="mini-stat-card">
            <div className="mini-stat-icon-circle">
              <Footprints size={17} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Steps
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
              {todayLog?.steps ? todayLog.steps.toLocaleString() : '—'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {goals?.step_goal ? `Goal ${goals.step_goal.toLocaleString()}` : 'Today'}
            </span>
          </div>

          {/* Card 2: Calories */}
          <div className="mini-stat-card">
            <div className="mini-stat-icon-circle">
              <Flame size={17} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Calories
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
              {todayLog?.calories_burned ? todayLog.calories_burned.toLocaleString() : '—'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              kcal
            </span>
          </div>

          {/* Card 3: Active Time / Skills */}
          <div className="mini-stat-card">
            <div className="mini-stat-icon-circle">
              <Clock size={17} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Active Time
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
              {totalSkillMinutesToday > 0 ? `${totalSkillMinutesToday}m` : '—'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              skills
            </span>
          </div>
        </div>
      </div>

      {/* ── Recent Activity / Workouts (Exact match to Screen 3 bottom list) ── */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.85rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.08rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Recent Activity
          </h2>
          <Link
            href="/skills"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--accent-lime)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Daily Fitness Activity Item */}
          <div
            className="card"
            style={{
              background: '#161616',
              borderRadius: '18px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-lime)',
                  flexShrink: 0,
                }}
              >
                <Dumbbell size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                  Daily Fitness & Cardio
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  {todayLog?.steps ? `${todayLog.steps.toLocaleString()} steps` : 'Not logged yet'} • {todayLog?.calories_burned ? `${todayLog.calories_burned} kcal` : '0 kcal'}
                </p>
              </div>
            </div>

            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: hasLoggedToday ? 'var(--accent-lime)' : 'rgba(255, 255, 255, 0.08)',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hasLoggedToday ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          </div>

          {/* Skill Practice Item */}
          <div
            className="card"
            style={{
              background: '#161616',
              borderRadius: '18px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-lime)',
                  flexShrink: 0,
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                  Skill Learning Practice
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  {totalSkillMinutesToday > 0 ? `${totalSkillMinutesToday} min today` : 'No practice logged today'}
                </p>
              </div>
            </div>

            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: totalSkillMinutesToday > 0 ? 'var(--accent-lime)' : 'rgba(255, 255, 255, 0.08)',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {totalSkillMinutesToday > 0 ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          </div>

          {/* Food Log Item */}
          <div
            className="card"
            style={{
              background: '#161616',
              borderRadius: '18px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-lime)',
                  flexShrink: 0,
                }}
              >
                <Utensils size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                  Nutrition Logging
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  {foodEntries.length > 0 ? `${foodEntries.length} items • ${totalFoodCalories} kcal` : 'No meals logged today'}
                </p>
              </div>
            </div>

            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: foodEntries.length > 0 ? 'var(--accent-lime)' : 'rgba(255, 255, 255, 0.08)',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {foodEntries.length > 0 ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <div className="skeleton" style={{ height: 32, width: '45%', marginBottom: '0.5rem', borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: '1.5rem', borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 180, borderRadius: 24, marginBottom: '1.75rem' }} />
      <div className="skeleton" style={{ height: 300, borderRadius: 24, marginBottom: '1.75rem' }} />
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: 110, borderRadius: 18 }} />
        ))}
      </div>
    </div>
  );
}
