'use client';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({ score, size = 160, strokeWidth = 12 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 60) return '#6366f1'; // indigo
    if (s >= 40) return '#f59e0b'; // amber
    return '#ef4444';              // red
  };

  const color = getColor(clampedScore);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        />
      </svg>
      {/* Label */}
      <div style={{
        position: 'absolute',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}>
        <span style={{
          fontSize: size * 0.22,
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          {Math.round(clampedScore)}
        </span>
        <span style={{ fontSize: size * 0.09, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          pts
        </span>
      </div>
    </div>
  );
}
