'use client';

import { useState, useEffect } from 'react';

export interface HeroSlide {
  src: string;
  position: string;
}

/**
 * Configurable array of hero slides with optimized focal positions.
 * Each image's focal point is tailored to keep the subject and quotes in view on all screen sizes.
 */
export const heroSlides: HeroSlide[] = [
  {
    src: '/hero/hero-1.jpg',
    position: '82% 20%', // Centers the smiling runner on the right
  },
  {
    src: '/hero/hero-2.jpg',
    position: '74% 30%', // Centers the student/coder at desk
  },
  {
    src: '/hero/hero-3.jpg',
    position: '34% 30%', // Centers the athlete with dumbbells on rooftop
  },
  {
    src: '/hero/hero-4.jpg',
    position: '44% 30%', // Centers the healthy meal & woman
  },
];

export const heroImages: string[] = heroSlides.map((s) => s.src);

interface HeroCarouselProps {
  intervalMs?: number;
  children?: React.ReactNode;
}

export default function HeroCarousel({
  intervalMs = 4500,
  children,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Stacked Real <img> Elements with Per-Image Alignment ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        {heroSlides.map((slide, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt={`Hero Slide ${idx + 1}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: slide.position,
              opacity: idx === currentIndex ? 1 : 0,
              transform: idx === currentIndex ? 'scale(1)' : 'scale(1.05)',
              transition: 'opacity 1s ease-in-out, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
              filter: 'brightness(0.95) contrast(1.04)',
            }}
          />
        ))}

        {/* ── Balanced Dark Gradient Overlay: Subject & text are both clear ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10, 10, 10, 0.2) 0%, rgba(10, 10, 10, 0.35) 40%, rgba(10, 10, 10, 0.8) 75%, #0A0A0A 98%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Foreground Content Layer ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          width: '100%',
        }}
      >
        {children}

        {/* ── Slide Indicator Dots ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            paddingBottom: '1.5rem',
            zIndex: 15,
          }}
        >
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 9999,
                background:
                  idx === currentIndex ? 'var(--accent-lime)' : 'rgba(255, 255, 255, 0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
