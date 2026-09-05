import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '45vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)',
          borderRadius: '50%',
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            LevelUp
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn btn-primary" id="landing-signup-btn">Get Started Free</Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <section style={{ textAlign: 'center', padding: 'clamp(4rem, 10vw, 8rem) 1rem 4rem' }}>
          <div className="badge badge-primary animate-fade-in" style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '0.35rem 1rem', fontSize: '0.875rem' }}>
            🚀 Gamify your self-improvement
          </div>
          <h1 className="animate-fade-in-up" style={{ maxWidth: 720, margin: '0 auto 1.25rem', letterSpacing: '-0.03em' }}>
            Track Progress.<br />
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Beat Your Friends.
            </span>
          </h1>
          <p className="animate-fade-in-up delay-100" style={{
            maxWidth: 560, margin: '0 auto 2.5rem', fontSize: '1.125rem',
            color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            Log your fitness, nutrition, and skill-learning every day. Get a weekly score. Compete on the leaderboard with friends.
          </p>
          <div className="animate-fade-in-up delay-200" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary btn-lg animate-pulse-glow" id="landing-hero-cta">
              Start for free →
            </Link>
            <Link href="/login" className="btn btn-ghost btn-lg">
              Sign in
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section style={{ padding: '0 1rem 6rem', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              { icon: '💪', title: 'Fitness Tracking', desc: 'Log steps, runs, and calories burned daily. See your fitness score grow week over week.' },
              { icon: '🎯', title: 'Skill Progress', desc: 'Create custom skills with sub-areas. Track learning time and self-reported progress with sliders.' },
              { icon: '🥗', title: 'Nutrition Logging', desc: 'Log what you eat each day. Stay consistent with food logging to maximize your nutrition score.' },
              { icon: '🏆', title: 'Friend Leaderboard', desc: 'Add friends and compete on a weekly leaderboard. See who\'s climbing and who\'s falling behind.' },
              { icon: '📊', title: 'Weekly Score', desc: 'A composite score (0–100) weighing fitness, skills, and nutrition — recomputed every week.' },
              { icon: '📈', title: 'Trend History', desc: 'Track your score history over weeks to see your long-term improvement trajectory.' },
            ].map((f, i) => (
              <div key={f.title} className={`card card-gradient animate-fade-in-up`}
                style={{ animationDelay: `${i * 80 + 200}ms` }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>{f.icon}</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA bottom */}
        <section style={{
          textAlign: 'center', padding: '4rem 1rem 6rem',
          borderTop: '1px solid var(--border)',
        }}>
          <h2 className="animate-fade-in-up" style={{ marginBottom: '1rem' }}>Ready to level up?</h2>
          <p className="animate-fade-in-up delay-100" style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.0625rem' }}>
            Join for free. No credit card required.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg animate-fade-in-up delay-200" id="landing-bottom-cta">
            Create your account →
          </Link>
        </section>
      </main>
    </div>
  );
}
