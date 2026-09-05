'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toDateString } from '@/lib/scoring';
import type { DailyLog, FoodEntry, Skill, SkillTimeLog } from '@/types/database';

export default function LogPage() {
  const today = toDateString(new Date());
  const [log, setLog] = useState<DailyLog | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillLogs, setSkillLogs] = useState<SkillTimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [steps, setSteps] = useState(0);
  const [ranToday, setRanToday] = useState(false);
  const [runDistance, setRunDistance] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // Food entry form
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCals, setNewFoodCals] = useState('');
  const [addingFood, setAddingFood] = useState(false);

  // Skill time form
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [skillMinutes, setSkillMinutes] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: existingLog }, { data: userSkills }] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).single(),
      supabase.from('skills').select('*').eq('user_id', user.id),
    ]);

    setSkills(userSkills || []);

    if (existingLog) {
      setLog(existingLog);
      setSteps(existingLog.steps || 0);
      setRanToday(existingLog.ran_today || false);
      setRunDistance(existingLog.run_distance_km?.toString() || '');
      setCaloriesBurned(existingLog.calories_burned || 0);

      const [{ data: food }, { data: skillTime }] = await Promise.all([
        supabase.from('food_entries').select('*').eq('daily_log_id', existingLog.id),
        supabase.from('skill_time_logs').select('*, skill:skills(name)').eq('user_id', user.id).eq('log_date', today),
      ]);
      setFoodEntries(food || []);
      setSkillLogs((skillTime as SkillTimeLog[]) || []);
    }

    setLoading(false);
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveLog() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const logData = {
      user_id: user.id,
      log_date: today,
      steps,
      ran_today: ranToday,
      run_distance_km: runDistance ? parseFloat(runDistance) : null,
      calories_burned: caloriesBurned,
    };

    if (log) {
      await supabase.from('daily_logs').update(logData).eq('id', log.id);
    } else {
      const { data: newLog } = await supabase.from('daily_logs').insert(logData).select().single();
      setLog(newLog);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function addFoodEntry() {
    if (!newFoodName.trim() || !newFoodCals) return;
    setAddingFood(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Ensure log exists
    let currentLogId = log?.id;
    if (!currentLogId) {
      const { data: newLog } = await supabase.from('daily_logs').upsert({
        user_id: user.id, log_date: today, steps, ran_today: ranToday,
        run_distance_km: runDistance ? parseFloat(runDistance) : null,
        calories_burned: caloriesBurned,
      }, { onConflict: 'user_id,log_date' }).select().single();
      if (newLog) { setLog(newLog); currentLogId = newLog.id; }
    }

    if (!currentLogId) { setAddingFood(false); return; }

    const { data: entry } = await supabase.from('food_entries').insert({
      daily_log_id: currentLogId,
      food_name: newFoodName.trim(),
      estimated_calories: parseInt(newFoodCals),
    }).select().single();

    if (entry) setFoodEntries((prev) => [...prev, entry]);
    setNewFoodName('');
    setNewFoodCals('');
    setAddingFood(false);
  }

  async function removeFoodEntry(id: string) {
    const supabase = createClient();
    await supabase.from('food_entries').delete().eq('id', id);
    setFoodEntries((prev) => prev.filter((f) => f.id !== id));
  }

  async function addSkillTime() {
    if (!selectedSkillId || !skillMinutes) return;
    setAddingSkill(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: entry } = await supabase.from('skill_time_logs').insert({
      user_id: user.id,
      skill_id: selectedSkillId,
      log_date: today,
      minutes_spent: parseInt(skillMinutes),
    }).select('*, skill:skills(name)').single();

    if (entry) setSkillLogs((prev) => [...prev, entry as SkillTimeLog]);
    setSkillMinutes('');
    setSelectedSkillId('');
    setAddingSkill(false);
  }

  async function removeSkillLog(id: string) {
    const supabase = createClient();
    await supabase.from('skill_time_logs').delete().eq('id', id);
    setSkillLogs((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return <LogSkeleton />;

  const totalFoodCals = foodEntries.reduce((s, e) => s + e.estimated_calories, 0);
  const totalSkillMin = skillLogs.reduce((s, l) => s + l.minutes_spent, 0);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in-up">
        <h1>Today&apos;s Log</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Fitness Section ── */}
      <Section title="💪 Fitness" className="animate-fade-in-up delay-100">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="log-steps">Steps walked</label>
            <input id="log-steps" type="number" min={0} max={100000} value={steps}
              onChange={(e) => setSteps(Number(e.target.value))} placeholder="8000" />
          </div>
          <div className="form-group">
            <label htmlFor="log-calories">Calories burned</label>
            <input id="log-calories" type="number" min={0} max={10000} value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(Number(e.target.value))} placeholder="500" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <label className="toggle" aria-label="Did you run today">
            <input type="checkbox" id="log-ran" checked={ranToday} onChange={(e) => setRanToday(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <label htmlFor="log-ran" style={{ cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 500 }}>
            Did you run today?
          </label>
        </div>

        {ranToday && (
          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label htmlFor="log-distance">Distance (km)</label>
            <input id="log-distance" type="number" min={0} max={200} step={0.1}
              value={runDistance} onChange={(e) => setRunDistance(e.target.value)} placeholder="5.0" />
          </div>
        )}

        <button
          onClick={saveLog}
          className="btn btn-primary btn-full"
          disabled={saving}
          id="log-save-fitness-btn"
          style={{ marginTop: '1rem' }}
        >
          {saving ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Saving...</>
            : saved ? '✅ Saved!'
            : '💾 Save Fitness Log'}
        </button>
      </Section>

      {/* ── Nutrition Section ── */}
      <Section title="🥗 Nutrition" className="animate-fade-in-up delay-200">
        {/* Food list */}
        {foodEntries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {foodEntries.map((entry) => (
              <div key={entry.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{entry.food_name}</span>
                  <span style={{ color: 'var(--accent)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                    {entry.estimated_calories} kcal
                  </span>
                </div>
                <button onClick={() => removeFoodEntry(entry.id)}
                  className="btn btn-icon" style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
                  aria-label={`Remove ${entry.food_name}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
              Total: <span style={{ color: 'var(--accent)' }}>{totalFoodCals} kcal</span>
            </div>
          </div>
        )}

        {/* Add food form */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="food-name">Food item</label>
            <input id="food-name" type="text" placeholder="e.g. Oatmeal"
              value={newFoodName} onChange={(e) => setNewFoodName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addFoodEntry(); }}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="food-cals">Calories</label>
            <input id="food-cals" type="number" placeholder="350" min={0}
              value={newFoodCals} onChange={(e) => setNewFoodCals(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addFoodEntry(); }}
            />
          </div>
          <button onClick={addFoodEntry} disabled={addingFood}
            className="btn btn-accent btn-sm" id="food-add-btn"
            style={{ marginBottom: '0.5rem', flexShrink: 0 }}>
            {addingFood ? '...' : '+ Add'}
          </button>
        </div>
      </Section>

      {/* ── Skills Section ── */}
      <Section title="🎯 Skills" className="animate-fade-in-up delay-300">
        {skillLogs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {skillLogs.map((sl) => (
              <div key={sl.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {(sl.skill as { name: string } | undefined)?.name || 'Skill'}
                  </span>
                  <span style={{ color: 'var(--primary-light)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                    {sl.minutes_spent} min
                  </span>
                </div>
                <button onClick={() => removeSkillLog(sl.id)}
                  className="btn btn-icon" style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
                  aria-label="Remove skill log">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
              Total: <span style={{ color: 'var(--primary-light)' }}>{totalSkillMin} min today</span>
            </div>
          </div>
        )}

        {skills.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontStyle: 'italic' }}>
            No skills yet. <a href="/skills" style={{ color: 'var(--primary-light)' }}>Create one →</a>
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="skill-select">Which skill?</label>
              <select id="skill-select" value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)}>
                <option value="">Select a skill...</option>
                {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="skill-minutes">Minutes</label>
              <input id="skill-minutes" type="number" min={1} max={1440} placeholder="60"
                value={skillMinutes} onChange={(e) => setSkillMinutes(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addSkillTime(); }}
              />
            </div>
            <button onClick={addSkillTime} disabled={addingSkill}
              className="btn btn-primary btn-sm" id="skill-log-add-btn"
              style={{ marginBottom: '0.5rem', flexShrink: 0 }}>
              {addingSkill ? '...' : '+ Add'}
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`} style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function LogSkeleton() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {[1,2,3].map(i => (
        <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }} />
      ))}
    </div>
  );
}
