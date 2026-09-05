'use client';

import { motion } from 'framer-motion';

interface ScoreBreakdownBarProps {
  fitness: number;
  skill: number;
  nutrition: number;
}

export default function ScoreBreakdownBar({ fitness, skill, nutrition }: ScoreBreakdownBarProps) {
  const bars = [
    {
      label: 'Fitness',
      value: fitness,
      color: '#ccff00',
      glow: 'rgba(204, 255, 0, 0.35)',
      weight: '40%',
      icon: '💪',
    },
    {
      label: 'Skills',
      value: skill,
      color: '#a3e635',
      glow: 'rgba(163, 230, 53, 0.35)',
      weight: '40%',
      icon: '🎯',
    },
    {
      label: 'Nutrition',
      value: nutrition,
      color: '#ff7a00',
      glow: 'rgba(255, 122, 0, 0.35)',
      weight: '20%',
      icon: '🥗',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      {bars.map((bar, index) => {
        const clampedVal = Math.min(100, Math.max(0, bar.value));
        return (
          <div key={bar.label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.375rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem' }}>{bar.icon}</span>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {bar.label}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  ×{bar.weight}
                </span>
              </div>

              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round(clampedVal)}
              </span>
            </div>

            {/* Animated Track */}
            <div
              style={{
                height: 7,
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${clampedVal}%` }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  height: '100%',
                  borderRadius: 'var(--radius-full)',
                  background: bar.color,
                  boxShadow: `0 0 10px ${bar.glow}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
