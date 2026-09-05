'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Flame, Award, Trophy, User, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MotionLink = motion.create(Link);

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/log',
    label: 'Log',
    icon: Flame,
  },
  {
    href: '/skills',
    label: 'Skills',
    icon: Award,
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar (desktop) */}
      <aside className="sidebar" style={{ background: '#121212', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="sidebar-logo">
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(212, 255, 63, 0.35)',
              color: '#000000',
              fontWeight: 900,
            }}
          >
            P
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              DO MORE
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              PULSE TRACKER
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  background: isActive ? 'rgba(212, 255, 63, 0.1)' : 'transparent',
                  color: isActive ? 'var(--accent-lime)' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(212, 255, 63, 0.25)' : '1px solid transparent',
                  borderRadius: '14px',
                }}
              >
                <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', marginTop: 'auto', borderRadius: '14px' }}
          id="app-logout-btn"
        >
          <LogOut size={18} strokeWidth={2} />
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="page-content">{children}</main>

      {/* Bottom navigation (mobile) — Exact Pulse match: icon-only, active in lime with pill bar */}
      <nav
        className="bottom-nav"
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          height: '68px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <MotionLink
              key={item.href}
              href={item.href}
              whileTap={{ scale: 0.82 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              aria-label={item.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 52,
                position: 'relative',
                color: isActive ? 'var(--accent-lime)' : '#8A8A8A',
                textDecoration: 'none',
              }}
            >
              <IconComponent size={24} strokeWidth={isActive ? 2.6 : 1.9} />
              {/* Pulse Active Indicator Dot/Pill underneath icon */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 16,
                    height: 3,
                    borderRadius: 9999,
                    background: 'var(--accent-lime)',
                    boxShadow: '0 0 8px rgba(212, 255, 63, 0.6)',
                  }}
                />
              )}
            </MotionLink>
          );
        })}
      </nav>
    </div>
  );
}
