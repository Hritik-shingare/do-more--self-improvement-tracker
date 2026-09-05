'use client';

import { motion } from 'framer-motion';

interface StreakFlameProps {
  days: number;
  isActive?: boolean;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export default function StreakFlame({
  days,
  isActive = true,
  size = 28,
  className = '',
  showLabel = true,
}: StreakFlameProps) {
  const isZero = days <= 0;

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      <motion.div
        animate={
          isActive && !isZero
            ? {
                scale: [1, 1.08, 1],
                filter: [
                  'drop-shadow(0 0 6px rgba(255, 122, 0, 0.45))',
                  'drop-shadow(0 0 14px rgba(255, 122, 0, 0.85))',
                  'drop-shadow(0 0 6px rgba(255, 122, 0, 0.45))',
                ],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="flame-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF5500" />
              <stop offset="60%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FFB300" />
            </linearGradient>
            <linearGradient id="flame-inner-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FFE066" />
            </linearGradient>
          </defs>

          {/* Outer Flame */}
          <path
            d="M12 2C10.5 4.5 9 6.8 9 9.5C9 10.8 9.5 12 10.2 12.9C9.1 12.3 8 11.2 8 9.5C5.5 11.5 4 14.5 4 17C4 20.3 6.7 23 10 23C10.6 23 11.2 22.9 11.8 22.7C10.7 21.6 10 20.1 10 18.5C10 16.2 11.5 14.5 13 13C14.5 14.5 15.5 16.5 15.5 18.5C15.5 19.4 15.2 20.3 14.7 21C17.8 20.2 20 17.4 20 14C20 10.5 17.5 7.5 15 5C14.8 6.5 14 7.8 12.8 8.8C13 6.5 12.7 4.2 12 2Z"
            fill={isZero ? 'rgba(255,255,255,0.2)' : 'url(#flame-gradient)'}
          />

          {/* Inner Flame Core */}
          {!isZero && (
            <path
              d="M12 14C11 15.2 10.5 16.3 10.5 17.5C10.5 19.4 12 21 13.5 21C14.5 21 15.2 20.2 15.5 19.3C15.5 18.2 14.8 17 14 16C13.5 15.3 12.8 14.6 12 14Z"
              fill="url(#flame-inner-gradient)"
            />
          )}
        </svg>
      </motion.div>

      {showLabel && (
        <span
          style={{
            fontWeight: 800,
            fontSize: size * 0.55,
            color: isZero ? 'var(--text-muted)' : 'var(--accent-fire)',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {days} {days === 1 ? 'day' : 'days'}
        </span>
      )}
    </div>
  );
}
