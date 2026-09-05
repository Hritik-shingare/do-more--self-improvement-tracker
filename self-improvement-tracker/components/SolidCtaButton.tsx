'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SolidCtaButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  id?: string;
  className?: string;
  variant?: 'lime' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function SolidCtaButton({
  href,
  onClick,
  children,
  id,
  className = '',
  variant = 'lime',
  size = 'md',
  fullWidth = false,
  type = 'button',
  disabled = false,
}: SolidCtaButtonProps) {
  const isDark = variant === 'dark';

  const baseStyle: React.CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: fullWidth ? '100%' : 'auto',
    borderRadius: '9999px',
    fontWeight: 800,
    letterSpacing: '-0.01em',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    border: 'none',
    userSelect: 'none',
    background: isDark ? '#000000' : 'var(--accent-lime)',
    color: isDark ? '#FFFFFF' : '#000000',
    padding: size === 'lg' ? '0.9rem 1.6rem' : size === 'sm' ? '0.5rem 1rem' : '0.75rem 1.4rem',
    fontSize: size === 'lg' ? '1.0625rem' : size === 'sm' ? '0.875rem' : '0.96rem',
    boxShadow: isDark
      ? '0 4px 16px rgba(0, 0, 0, 0.4)'
      : '0 4px 20px rgba(212, 255, 63, 0.28)',
  };

  const arrowCircleStyle: React.CSSProperties = {
    width: size === 'lg' ? 32 : size === 'sm' ? 24 : 28,
    height: size === 'lg' ? 32 : size === 'sm' ? 24 : 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '0.75rem',
    background: isDark ? 'var(--accent-lime)' : '#000000',
    color: isDark ? '#000000' : 'var(--accent-lime)',
    flexShrink: 0,
    transition: 'transform 0.2s ease',
  };

  const content = (
    <>
      <span style={{ flex: 1, textAlign: fullWidth ? 'center' : 'left' }}>{children}</span>
      <span style={arrowCircleStyle} className="cta-arrow-circle">
        <ArrowRight size={size === 'lg' ? 17 : size === 'sm' ? 13 : 15} strokeWidth={2.6} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} id={id} className={`solid-cta-btn ${className}`} style={baseStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      id={id}
      className={`solid-cta-btn ${className}`}
      style={baseStyle}
    >
      {content}
    </button>
  );
}
