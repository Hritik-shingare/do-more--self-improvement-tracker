'use client';

interface ScoreBreakdownBarProps {
  fitness: number;
  skill: number;
  nutrition: number;
}

export default function ScoreBreakdownBar({ fitness, skill, nutrition }: ScoreBreakdownBarProps) {
  const bars = [
    { label: 'Fitness', value: fitness, color: '#6366f1', weight: '40%', icon: '💪' },
    { label: 'Skills', value: skill, color: '#10b981', weight: '40%', icon: '🎯' },
    { label: 'Nutrition', value: nutrition, color: '#f59e0b', weight: '20%', icon: '🥗' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {bars.map((bar) => (
        <div key={bar.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>{bar.icon}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{bar.label}</span>
              <span style={{
                fontSize: '0.7rem', padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
              }}>
                ×{bar.weight}
              </span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              {Math.round(bar.value)}
            </span>
          </div>
          <div className="progress-bar">
            <div style={{
              height: '100%',
              borderRadius: 'var(--radius-full)',
              background: bar.color,
              width: `${Math.min(100, bar.value)}%`,
              transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: `0 0 8px ${bar.color}60`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
