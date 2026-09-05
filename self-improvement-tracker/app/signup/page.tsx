'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Step = 'account' | 'goals';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('account');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Goals fields
  const [stepGoal, setStepGoal] = useState(8000);
  const [calorieGoal, setCalorieGoal] = useState(500);
  const [skillMinutesGoal, setSkillMinutesGoal] = useState(300);

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Username can only contain lowercase letters, numbers and underscores.');
      return;
    }
    setStep('goals');
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: displayName || username,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If profile was auto-created via trigger, update goals
    if (data.user) {
      // Wait a moment for the trigger to fire
      await new Promise((r) => setTimeout(r, 800));

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          username: username.toLowerCase(),
          display_name: displayName || username,
        });

      if (!profileError) {
        await supabase.from('user_goals').upsert({
          user_id: data.user.id,
          step_goal: stepGoal,
          calorie_burn_goal: calorieGoal,
          weekly_skill_minutes_goal: skillMinutesGoal,
        });
      }
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {/* Background glow orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', left: '-5%',
          width: '35vw', height: '35vw',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div className="w-full max-w-sm animate-scale-in" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-primary)',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '1rem',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>LevelUp</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            {step === 'account' ? 'Create your account' : 'Set your weekly goals'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['account', 'goals'] as Step[]).map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: step === s || (i === 0) ? 'var(--primary)' : 'var(--bg-elevated)',
              opacity: i === 1 && step === 'account' ? 0.3 : 1,
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
              color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          {step === 'account' ? (
            <form onSubmit={handleAccountStep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="signup-email">Email address</label>
                <input id="signup-email" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label htmlFor="signup-username">Username</label>
                <input id="signup-username" type="text" placeholder="cooluser123"
                  value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required pattern="[a-z0-9_]+" minLength={3} maxLength={24} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-displayname">Display name</label>
                <input id="signup-displayname" type="text" placeholder="Your Name"
                  value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={48} />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input id="signup-password" type="password" placeholder="At least 8 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" id="signup-next-btn"
                style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
                Next: Set Goals →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <GoalSlider
                id="step-goal"
                label="Daily step goal"
                value={stepGoal}
                min={2000} max={20000} step={500}
                unit="steps"
                onChange={setStepGoal}
              />
              <GoalSlider
                id="calorie-goal"
                label="Daily calories burned goal"
                value={calorieGoal}
                min={100} max={2000} step={50}
                unit="kcal"
                onChange={setCalorieGoal}
              />
              <GoalSlider
                id="skill-minutes-goal"
                label="Weekly skill learning goal"
                value={skillMinutesGoal}
                min={60} max={1200} step={30}
                unit="min/week"
                onChange={setSkillMinutesGoal}
              />

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep('account')}
                  style={{ flex: 1 }}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}
                  id="signup-submit-btn" style={{ flex: 2, padding: '0.75rem' }}>
                  {loading ? (
                    <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating...</>
                  ) : 'Create Account 🚀'}
                </button>
              </div>
            </form>
          )}

          {step === 'account' && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9375rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
              <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GoalSlider({ id, label, value, min, max, step, unit, onChange }: {
  id: string; label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label htmlFor={id}>{label}</label>
        <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '1rem' }}>
          {value.toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unit}</span>
        </span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: 'var(--primary)' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.25rem' }}>
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
