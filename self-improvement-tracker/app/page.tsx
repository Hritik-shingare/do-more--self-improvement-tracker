'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, Bell, Flame, Activity, Clock, ShieldCheck, Dumbbell, Award } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import SolidCtaButton from '@/components/SolidCtaButton';
import CircularGauge from '@/components/CircularGauge';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFFFFF' }}>
      {/* ── Rotating Photo Carousel Hero Section ── */}
      <HeroCarousel intervalMs={4500}>
        {/* Top Navigation Bar */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Menu size={20} color="#FFFFFF" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link
              href="/login"
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '0.4rem 0.8rem',
              }}
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                textDecoration: 'none',
                color: '#FFFFFF',
              }}
              aria-label="Notifications"
            >
              <Bell size={20} />
            </Link>
          </div>
        </header>

        {/* Hero Headline & CTA (matching Screen 1) */}
        <div
          style={{
            padding: '2.5rem 1.5rem 2rem',
            maxWidth: 540,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 3.6rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                marginBottom: '0.75rem',
                textShadow: '0 2px 16px rgba(0, 0, 0, 0.75)',
              }}
            >
              PUSH <br />
              <span style={{ color: 'var(--accent-lime)' }}>YOUR LIMITS</span> <br />
              EVERY DAY
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                marginBottom: '1.75rem',
              }}
            >
              Stronger Body. Stronger You.
            </p>

            <div style={{ maxWidth: 280 }}>
              <SolidCtaButton href="/signup" size="lg" id="landing-hero-cta">
                Get Started
              </SolidCtaButton>
            </div>
          </motion.div>
        </div>
      </HeroCarousel>

      {/* ── Feature Introduction Section ── */}
      <section
        style={{
          maxWidth: 520,
          margin: '2rem auto 4rem',
          padding: '0 1.25rem',
          position: 'relative',
          zIndex: 20,
        }}
      >

        {/* Feature Cards Grid (Seamless App Introduction) */}
        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              background: '#161616',
              borderRadius: '20px',
              padding: '1.35rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(212, 255, 63, 0.1)',
                color: 'var(--accent-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Dumbbell size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                Daily Fitness & Nutrition
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Track steps, calories burned, and food logging consistency with real-time scoring.
              </p>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: '#161616',
              borderRadius: '20px',
              padding: '1.35rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(212, 255, 63, 0.1)',
                color: 'var(--accent-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>
                Skill Progress & Friends Leaderboard
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Measure deliberate practice and climb the weekly leaderboard with your circle.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <SolidCtaButton href="/signup" size="lg" fullWidth id="landing-bottom-cta">
            Join DO MORE Free
          </SolidCtaButton>
          <p style={{ marginTop: '0.85rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Already tracking?{' '}
            <Link href="/login" style={{ color: 'var(--accent-lime)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
