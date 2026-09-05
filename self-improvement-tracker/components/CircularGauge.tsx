'use client';

import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

interface CircularGaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  labelTop?: string;
  labelBottom?: string;
  goalLabel?: string;
  unit?: string;
  isPercent?: boolean;
  type?: 'full' | 'semi';
  className?: string;
}

export default function CircularGauge({
  value,
  max = 100,
  size = 190,
  strokeWidth = 14,
  labelTop,
  labelBottom,
  goalLabel,
  unit,
  isPercent = false,
  type = 'full',
  className = '',
}: CircularGaugeProps) {
  const isSemi = type === 'semi';
  const radius = (size - strokeWidth) / 2;
  const clampedVal = Math.max(0, value);
  const percent = max > 0 ? Math.min(100, (clampedVal / max) * 100) : 0;

  if (isSemi) {
    // Semi-circle arc (Screen 1 style: "68% Completed")
    const semiCircumference = Math.PI * radius;
    const semiOffset = semiCircumference - (percent / 100) * semiCircumference;

    return (
      <div
        className={`inline-flex flex-col items-center justify-center ${className}`}
        style={{ position: 'relative', width: size, height: size * 0.65 }}
      >
        <svg
          width={size}
          height={size * 0.65}
          viewBox={`0 0 ${size} ${size * 0.65}`}
          style={{ overflow: 'visible' }}
        >
          {/* Track */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#262626"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated Lime Fill */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="var(--accent-lime)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={semiCircumference}
            initial={{ strokeDashoffset: semiCircumference }}
            animate={{ strokeDashoffset: semiOffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <AnimatedCounter
              value={isPercent ? percent : clampedVal}
              style={{
                fontSize: size * 0.22,
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            />
            {isPercent && (
              <span style={{ fontSize: size * 0.12, fontWeight: 700, color: '#FFFFFF' }}>%</span>
            )}
          </div>
          {labelBottom && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              {labelBottom}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full circular ring gauge (Screen 3 style: "Today 7,842 Steps, Goal: 10,000")
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Dark Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#222222"
            strokeWidth={strokeWidth}
          />
          {/* Lime Arc Fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent-lime)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {labelTop && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                marginBottom: 2,
              }}
            >
              {labelTop}
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
            <AnimatedCounter
              value={clampedVal}
              style={{
                fontSize: size * 0.23,
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}
            />
            {unit && (
              <span style={{ fontSize: size * 0.09, fontWeight: 600, color: 'var(--text-muted)' }}>
                {unit}
              </span>
            )}
          </div>

          {labelBottom && (
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              {labelBottom}
            </span>
          )}
        </div>
      </div>

      {/* Goal Pill beneath the ring */}
      {goalLabel && (
        <div
          style={{
            marginTop: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '9999px',
            padding: '0.3rem 0.9rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          {goalLabel}
        </div>
      )}
    </div>
  );
}
