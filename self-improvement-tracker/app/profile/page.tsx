'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, UserGoals, WeeklyScore } from '@/types/database';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [scoreHistory, setScoreHistory] = useState<WeeklyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [stepGoal, setStepGoal] = useState(8000);
  const [calorieGoal, setCalorieGoal] = useState(500);
  const [skillMinutesGoal, setSkillMinutesGoal] = useState(300);

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: prof }, { data: g }, { data: scores }] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_goals').select('*').eq('user_id', user.id).single(),
      supabase.from('weekly_scores').select('*').eq('user_id', user.id)
        .order('week_start_date', { ascending: false }).limit(12),
    ]);

    setProfile(prof);
    setGoals(g);
    setScoreHistory((scores || []).reverse());

    setDisplayName(prof?.display_name || '');
    if (g) {
      setStepGoal(g.step_goal);
      setCalorieGoal(g.calorie_burn_goal);
      setSkillMinutesGoal(g.weekly_skill_minutes_goal);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);

    const supabase = createClient();
    await Promise.all([
      supabase.from('user_profiles').update({ display_name: displayName }).eq('id', profile.id),
      supabase.from('user_goals').upsert({
        user_id: profile.id,
        step_goal: stepGoal,
        calorie_burn_goal: calorieGoal,
        weekly_skill_minutes_goal: skillMinutesGoal,
      }),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }} />)}
    </div>
  );

  const chartData = scoreHistory.map((s) => ({
    week: new Date(s.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: Math.round(s.total_score),
    fitness: Math.round(s.fitness_score),
    skill: Math.round(s.skill_score),
    nutrition: Math.round(s.nutrition_score),
  }));

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in-up">
        <h1>Profile</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>@{profile?.username}</p>
      </div>

      {/* Avatar + name */}
      <div className="card animate-fade-in-up delay-100" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '1.5rem', color: '#fff',
          boxShadow: 'var(--shadow-glow)',
        }}>
          {(profile?.display_name || profile?.username || '?')[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="form-group">
            <label htmlFor="profile-display-name">Display name</label>
            <input id="profile-display-name" type="text" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} placeholder="Your Name" />
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="card animate-fade-in-up delay-200" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>🎯 Weekly Goals</h3>

        <GoalInput
          id="profile-step-goal"
          label="Daily step goal"
          value={stepGoal}
          min={1000} max={30000} step={500}
          unit="steps"
          onChange={setStepGoal}
        />
        <GoalInput
          id="profile-calorie-goal"
          label="Daily calories burned goal"
          value={calorieGoal}
          min={100} max={3000} step={50}
          unit="kcal"
          onChange={setCalorieGoal}
        />
        <GoalInput
          id="profile-skill-goal"
          label="Weekly skill minutes goal"
          value={skillMinutesGoal}
          min={30} max={2400} step={30}
          unit="min/week"
          onChange={setSkillMinutesGoal}
        />

        <button onClick={saveProfile} disabled={saving}
          className="btn btn-primary btn-full" id="profile-save-btn"
          style={{ marginTop: '1.25rem' }}>
          {saving ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Saving...</>
            : saved ? '✅ Saved!'
            : '💾 Save Changes'}
        </button>
      </div>

      {/* Score History Chart */}
      {chartData.length > 0 && (
        <div className="card animate-fade-in-up delay-300">
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>📈 Score History</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, color: '#f1f5f9' }}
                labelStyle={{ color: '#94a3b8', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} name="Total" />
              <Line type="monotone" dataKey="fitness" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Fitness" />
              <Line type="monotone" dataKey="skill" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Skill" />
              <Line type="monotone" dataKey="nutrition" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Nutrition" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total', color: '#6366f1' },
              { label: 'Fitness', color: '#10b981' },
              { label: 'Skill', color: '#8b5cf6' },
              { label: 'Nutrition', color: '#f59e0b' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 12, height: 3, borderRadius: 1.5, background: l.color }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="card animate-fade-in-up delay-300" style={{ textAlign: 'center', padding: '2rem' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>📊</span>
          <p>No score history yet. Scores are computed weekly — log your activity to see your trend!</p>
        </div>
      )}
    </div>
  );
}

function GoalInput({ id, label, value, min, max, step, unit, onChange }: {
  id: string; label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor={id}>{label}</label>
        <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
          {value.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unit}</span>
        </span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} style={{ accentColor: 'var(--primary)' }} />
    </div>
  );
}
