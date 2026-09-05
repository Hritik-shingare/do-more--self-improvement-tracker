'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  label?: string;
  sublabel?: string;
  unit?: string;
  showCounter?: boolean;
  className?: string;
}

export default function ProgressRing({
  value,
  max = 100,
  size = 180,
  strokeWidth = 14,
  color = '#ccff00',
  glowColor = 'rgba(204, 255, 0, 0.38)',
  label,
  sublabel = 'pts',
  unit,
  showCounter = true,
  className = '',
}: ProgressRingProps) {
  const filterId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, value);
  const percent = max > 0 ? Math.min(100, (clampedValue / max) * 100) : 0;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Glow filter definition */}
        <defs>
          <filter id={`ring-glow-${filterId}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={glowColor} />
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          filter={`url(#ring-glow-${filterId})`}
        />
      </svg>

      {/* Center Label & Animated Counter */}
      <div
        style={{
          position: 'absolute',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          inset: 0,
        }}
      >
        {label && (
          <span
            style={{
              fontSize: Math.max(10, size * 0.075),
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: 2,
            }}
          >
            {label}
          </span>
        )}

        {showCounter ? (
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
            <AnimatedCounter
              value={clampedValue}
              style={{
                fontSize: size * 0.26,
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}
            />
            {unit && (
              <span style={{ fontSize: size * 0.1, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {unit}
              </span>
            )}
          </div>
        ) : null}

        {sublabel && (
          <span
            style={{
              fontSize: Math.max(11, size * 0.075),
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginTop: 3,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
