'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile, WeeklyScore } from '@/types/database';
import ScoreRing from '@/components/ScoreRing';

interface LeaderboardEntry {
  user: UserProfile;
  currentScore: WeeklyScore | null;
  previousScore: WeeklyScore | null;
  rank: number;
  rankChange: number;
}

type FriendRequest = {
  id: string;
  user_id: string;
  status: 'pending' | 'accepted';
  user: UserProfile;
};

export default function LeaderboardPage() {
  const [myId, setMyId] = useState<string>('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSuccess, setSearchSuccess] = useState('');

  const getWeekStart = (offset = 0) => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff - offset * 7);
    return d.toISOString().split('T')[0];
  };

  const loadLeaderboard = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMyId(user.id);

    // Get accepted friends
    const { data: friendships } = await supabase
      .from('friendships')
      .select('user_id, friend_id, status')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    const friendIds = (friendships || []).map((f) =>
      f.user_id === user.id ? f.friend_id : f.user_id
    );
    const allIds = [user.id, ...friendIds];

    // Get pending requests (to me)
    const { data: pending } = await supabase
      .from('friendships')
      .select('*, user:user_profiles!friendships_user_id_fkey(*)')
      .eq('friend_id', user.id)
      .eq('status', 'pending');
    setPendingRequests((pending as FriendRequest[]) || []);

    // Load profiles + scores
    const thisWeek = getWeekStart(0);
    const lastWeek = getWeekStart(1);

    const [{ data: profiles }, { data: thisWeekScores }, { data: lastWeekScores }] = await Promise.all([
      supabase.from('user_profiles').select('*').in('id', allIds),
      supabase.from('weekly_scores').select('*').in('user_id', allIds).eq('week_start_date', thisWeek),
      supabase.from('weekly_scores').select('*').in('user_id', allIds).eq('week_start_date', lastWeek),
    ]);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
    const thisMap = new Map((thisWeekScores || []).map((s) => [s.user_id, s]));
    const lastMap = new Map((lastWeekScores || []).map((s) => [s.user_id, s]));

    // Sort by current score
    const ranked: LeaderboardEntry[] = allIds
      .filter((id) => profileMap.has(id))
      .map((id) => ({
        user: profileMap.get(id)!,
        currentScore: thisMap.get(id) || null,
        previousScore: lastMap.get(id) || null,
        rank: 0,
        rankChange: 0,
      }))
      .sort((a, b) => (b.currentScore?.total_score ?? 0) - (a.currentScore?.total_score ?? 0))
      .map((e, i) => ({ ...e, rank: i + 1 }));

    // Compute rank change vs last week
    const lastWeekRanked = [...ranked]
      .sort((a, b) => (b.previousScore?.total_score ?? 0) - (a.previousScore?.total_score ?? 0))
      .map((e, i) => ({ id: e.user.id, lastRank: i + 1 }));
    const lastRankMap = new Map(lastWeekRanked.map((e) => [e.id, e.lastRank]));

    const finalEntries = ranked.map((e) => ({
      ...e,
      rankChange: (lastRankMap.get(e.user.id) ?? e.rank) - e.rank,
    }));

    setEntries(finalEntries);
    setLoading(false);
  }, []);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  async function sendFriendRequest() {
    if (!searchUsername.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchSuccess('');

    const supabase = createClient();
    const { data: foundUser, error } = await supabase
      .from('user_profiles')
      .select('id, username')
      .eq('username', searchUsername.toLowerCase().trim())
      .single();

    if (error || !foundUser) {
      setSearchError(`User "${searchUsername}" not found.`);
      setSearchLoading(false);
      return;
    }

    if (foundUser.id === myId) {
      setSearchError("You can't add yourself!");
      setSearchLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('friendships').insert({
      user_id: myId,
      friend_id: foundUser.id,
    });

    if (insertError) {
      setSearchError(insertError.code === '23505' ? 'Friend request already sent.' : insertError.message);
    } else {
      setSearchSuccess(`Friend request sent to @${foundUser.username}!`);
      setSearchUsername('');
    }
    setSearchLoading(false);
  }

  async function acceptRequest(friendshipId: string) {
    const supabase = createClient();
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
    loadLeaderboard();
  }

  async function declineRequest(friendshipId: string) {
    const supabase = createClient();
    await supabase.from('friendships').delete().eq('id', friendshipId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId));
  }

  if (loading) return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }} className="animate-fade-in-up">
        <h1>🏆 Leaderboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>This week&apos;s rankings among friends</p>
      </div>

      {/* Pending friend requests */}
      {pendingRequests.length > 0 && (
        <div className="card animate-fade-in-up" style={{
          marginBottom: '1.5rem',
          borderColor: 'rgba(245,158,11,0.3)',
          background: 'rgba(245,158,11,0.05)',
        }}>
          <h4 style={{ color: 'var(--warning)', marginBottom: '0.75rem' }}>⏳ Pending Requests</h4>
          {pendingRequests.map((req) => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
              <div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>@{req.user?.username}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.875rem' }}>wants to be friends</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => acceptRequest(req.id)} className="btn btn-accent btn-sm" id={`accept-req-${req.id}`}>Accept</button>
                <button onClick={() => declineRequest(req.id)} className="btn btn-ghost btn-sm" id={`decline-req-${req.id}`}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add friend */}
      <div className="card animate-fade-in-up delay-100" style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Add Friend by Username</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="friend-search-input"
            type="text"
            placeholder="@username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendFriendRequest(); }}
            style={{ flex: 1 }}
          />
          <button onClick={sendFriendRequest} disabled={searchLoading}
            className="btn btn-primary" id="friend-request-btn">
            {searchLoading ? '...' : 'Send'}
          </button>
        </div>
        {searchError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{searchError}</p>}
        {searchSuccess && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{searchSuccess}</p>}
      </div>

      {/* Leaderboard */}
      {entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>👥</span>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No friends yet</h3>
          <p>Add friends above to see the leaderboard!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.map((entry, idx) => (
            <LeaderboardRow
              key={entry.user.id}
              entry={entry}
              isMe={entry.user.id === myId}
              className={`animate-fade-in-up`}
              style={{ animationDelay: `${(idx + 2) * 80}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({ entry, isMe, className, style }: {
  entry: LeaderboardEntry; isMe: boolean;
  className?: string; style?: React.CSSProperties;
}) {
  const { user, currentScore, rank, rankChange } = entry;
  const score = currentScore?.total_score ?? 0;

  return (
    <div className={`card ${className}`} style={{
      ...style,
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
      border: isMe ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
      background: isMe ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
    }}>
      {/* Rank */}
      <div className={`rank-badge rank-${rank <= 3 ? rank : 'n'}`}>
        {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
      </div>

      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: 'var(--gradient-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '1rem', color: '#fff',
      }}>
        {(user.display_name || user.username)[0]?.toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
          {user.display_name || user.username}
          {isMe && <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>You</span>}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>@{user.username}</div>
      </div>

      {/* Score ring (mini) */}
      <ScoreRing score={score} size={56} strokeWidth={5} />

      {/* Rank movement */}
      <div style={{ textAlign: 'center', minWidth: 32 }}>
        {rankChange > 0 ? (
          <span className="rank-up" style={{ fontSize: '0.875rem', fontWeight: 700 }}>↑{rankChange}</span>
        ) : rankChange < 0 ? (
          <span className="rank-down" style={{ fontSize: '0.875rem', fontWeight: 700 }}>↓{Math.abs(rankChange)}</span>
        ) : (
          <span className="rank-same" style={{ fontSize: '0.875rem' }}>—</span>
        )}
      </div>
    </div>
  );
}
