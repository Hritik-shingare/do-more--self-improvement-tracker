'use client';

import SolidCtaButton from './SolidCtaButton';

interface HighlightedCardProps {
  badge?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionText: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function HighlightedCard({
  badge = 'Workout Plan',
  title,
  subtitle,
  icon,
  actionText,
  actionHref,
  onAction,
  className = '',
}: HighlightedCardProps) {
  return (
    <div
      className={`card-highlighted-lime ${className}`}
      style={{
        background: 'var(--accent-lime)',
        color: '#000000',
        borderRadius: '24px',
        padding: '1.6rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(212, 255, 63, 0.2)',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {badge && (
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.7)',
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              {badge}
            </span>
          )}
          <h2
            style={{
              fontSize: 'clamp(1.25rem, 3.5vw, 1.6rem)',
              fontWeight: 800,
              color: '#000000',
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
            }}
          >
            {title}
          </h2>
        </div>

        {icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Subtitle / Details */}
      {subtitle && (
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'rgba(0, 0, 0, 0.75)',
            marginTop: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Action Button inside (Dark Pill Button) */}
      <div style={{ marginTop: subtitle ? 0 : '1.25rem' }}>
        <SolidCtaButton
          variant="dark"
          href={actionHref}
          onClick={onAction}
          size="md"
        >
          {actionText}
        </SolidCtaButton>
      </div>
    </div>
  );
}
