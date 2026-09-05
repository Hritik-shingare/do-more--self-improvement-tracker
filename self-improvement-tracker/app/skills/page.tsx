'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Skill, SkillArea } from '@/types/database';

interface SkillWithAreas extends Skill {
  skill_areas: SkillArea[];
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillWithAreas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New skill form
  const [newSkillName, setNewSkillName] = useState('');
  const [newAreas, setNewAreas] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  const loadSkills = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('skills')
      .select('*, skill_areas(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    setSkills((data as SkillWithAreas[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  async function createSkill() {
    if (!newSkillName.trim()) return;
    setCreating(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreating(false); return; }

    const { data: skill } = await supabase.from('skills').insert({
      user_id: user.id,
      name: newSkillName.trim(),
    }).select().single();

    if (skill) {
      const validAreas = newAreas.filter((a) => a.trim());
      if (validAreas.length > 0) {
        await supabase.from('skill_areas').insert(
          validAreas.map((name) => ({ skill_id: skill.id, name: name.trim() }))
        );
      }
      setNewSkillName('');
      setNewAreas(['', '']);
      setShowModal(false);
      loadSkills();
    }
    setCreating(false);
  }

  async function updateProgress(areaId: string, value: number) {
    const supabase = createClient();
    await supabase.from('skill_areas').update({ progress_percent: value, updated_at: new Date().toISOString() }).eq('id', areaId);
    setSkills((prev) =>
      prev.map((s) => ({
        ...s,
        skill_areas: s.skill_areas.map((a) => a.id === areaId ? { ...a, progress_percent: value } : a),
      }))
    );
  }

  async function deleteSkill(skillId: string) {
    if (!confirm('Delete this skill and all its sub-areas?')) return;
    const supabase = createClient();
    await supabase.from('skills').delete().eq('id', skillId);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  }

  if (loading) return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }} className="animate-fade-in-up">
        <div>
          <h1>Skills</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track your learning progress</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" id="skills-add-btn">
          + New Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌱</span>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No skills yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Add your first skill to start tracking progress</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" id="skills-add-first-btn">
            + Create Your First Skill
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {skills.map((skill, idx) => (
            <div key={skill.id} className={`card animate-fade-in-up`} style={{ animationDelay: `${idx * 100}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>{skill.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {skill.skill_areas.length > 0 && (
                    <span className="badge badge-primary">
                      {Math.round(skill.skill_areas.reduce((s, a) => s + a.progress_percent, 0) / skill.skill_areas.length)}% avg
                    </span>
                  )}
                  <button onClick={() => deleteSkill(skill.id)}
                    className="btn btn-icon btn-danger btn-sm" aria-label={`Delete ${skill.name}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>

              {skill.skill_areas.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No sub-areas defined</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {skill.skill_areas.map((area) => (
                    <div key={area.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9375rem' }}>{area.name}</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-light)', minWidth: 40, textAlign: 'right' }}>
                          {area.progress_percent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0} max={100} step={5}
                        value={area.progress_percent}
                        onChange={(e) => updateProgress(area.id, Number(e.target.value))}
                        aria-label={`${area.name} progress`}
                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                      />
                      {/* Visual progress bar */}
                      <div className="progress-bar" style={{ marginTop: '0.25rem' }}>
                        <div className="progress-bar-fill" style={{ width: `${area.progress_percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Skill Modal */}
      {showModal && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal animate-scale-in">
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Create New Skill</h2>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="new-skill-name">Skill name</label>
              <input id="new-skill-name" type="text" placeholder="e.g. Web Development"
                value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} autoFocus />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ marginBottom: '0.75rem', display: 'block' }}>Sub-areas (optional)</label>
              {newAreas.map((area, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" placeholder={`Sub-area ${i + 1} (e.g. Frontend)`}
                    value={area} onChange={(e) => setNewAreas((prev) => prev.map((a, j) => j === i ? e.target.value : a))} />
                  {newAreas.length > 1 && (
                    <button onClick={() => setNewAreas((prev) => prev.filter((_, j) => j !== i))}
                      className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => setNewAreas((prev) => [...prev, ''])}
                className="btn btn-ghost btn-sm" style={{ marginTop: '0.25rem' }}>
                + Add sub-area
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={createSkill} disabled={creating || !newSkillName.trim()}
                className="btn btn-primary" style={{ flex: 2 }} id="skill-create-submit-btn">
                {creating ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating...</> : 'Create Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
