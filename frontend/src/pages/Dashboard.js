import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShelf } from '../context/ShelfContext';
import { pomodoroAPI } from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, fetchStats, shelf, fetchShelf } = useShelf();
  const [pomStats, setPomStats] = useState(null);
  const [recentlyFinished, setRecentlyFinished] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchShelf();
    pomodoroAPI.getStats().then(r => setPomStats(r.data.stats)).catch(() => {});
  }, []);

  useEffect(() => {
    const finished = shelf.filter(b => b.status === 'finished').sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt)).slice(0, 5);
    setRecentlyFinished(finished);
  }, [shelf]);

  const hoursRead = pomStats ? (pomStats.totalReadingMinutes / 60).toFixed(1) : 0;
  const booksGoalPct = stats && user ? Math.min(100, Math.round((stats.finished / (user.readingGoal?.booksPerYear || 12)) * 100)) : 0;
  const minutesGoalPct = pomStats && user ? Math.min(100, Math.round(((pomStats.totalReadingMinutes / 30) / 365) * 100)) : 0;

  const currentlyReading = shelf.filter(b => b.status === 'reading').slice(0, 4);

  return (
    <div className="page-container" style={{ padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <p className="serif-accent" style={{ color: 'var(--pink-mid)', fontSize: '1.05rem' }}>Welcome back,</p>
        <h1 className="display-title">{user?.name?.split(' ')[0]} 💅</h1>
      </div>

      {/* Big stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { icon: '📚', value: stats?.total || 0, label: 'Books on Shelf', color: 'var(--pink-hot)' },
          { icon: '✅', value: stats?.finished || 0, label: 'Books Finished', color: 'var(--gold)' },
          { icon: '⏱️', value: `${hoursRead}h`, label: 'Hours Reading', color: '#8b5cf6' },
          { icon: '🍅', value: pomStats?.completedSessions || 0, label: 'Pomodoros Done', color: '#2ec48a' },
          { icon: '📖', value: stats?.reading || 0, label: 'Currently Reading', color: 'var(--pink-deep)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem' }}>📚 Books Goal</h3>
            <span style={{ color: 'var(--pink-hot)', fontWeight: 700 }}>{booksGoalPct}%</span>
          </div>
          <div className="progress-bar-track" style={{ marginBottom: '12px' }}>
            <div className="progress-bar-fill" style={{ width: `${booksGoalPct}%` }} />
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
            {stats?.finished || 0} of {user?.readingGoal?.booksPerYear || 12} books this year
          </p>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem' }}>⏱️ Reading Habit</h3>
            <span style={{ color: 'var(--pink-hot)', fontWeight: 700 }}>{pomStats?.weekSessions || 0} this week</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {Array(7).fill(0).map((_, i) => (
              <div key={i} style={{
                flex: 1,
                height: '40px',
                borderRadius: '6px',
                background: i < (pomStats?.weekSessions || 0) ? 'linear-gradient(to top, var(--pink-hot), var(--pink-soft))' : 'var(--pink-blush)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>Sessions this week</p>
        </div>
      </div>

      {/* Currently Reading */}
      {currentlyReading.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 className="section-heading">Currently <span>Reading</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {currentlyReading.map(book => {
              const pct = book.pageCount > 0 ? Math.min(100, Math.round((book.currentPage / book.pageCount) * 100)) : 0;
              return (
                <Link key={book._id} to={`/book/${book.bookId}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', height: '110px' }}>
                    {book.cover
                      ? <img src={book.cover} alt="" style={{ width: '74px', objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: '74px', background: 'var(--pink-blush)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📚</div>
                    }
                    <div style={{ flex: 1, padding: '14px 16px', overflow: 'hidden' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '10px' }}>{book.author}</p>
                      <div className="progress-bar-track" style={{ height: '5px', marginBottom: '4px' }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{pct}% • {book.currentPage || 0}/{book.pageCount || '?'} pages</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently Finished */}
      {recentlyFinished.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 className="section-heading">Recently <span>Finished</span> ✅</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {recentlyFinished.map(book => (
              <Link key={book._id} to={`/book/${book.bookId}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', transition: 'all 0.2s' }}>
                  {book.cover && <img src={book.cover} alt="" style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '4px' }} />}
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>{book.title}</p>
                    {book.rating > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>{'⭐'.repeat(book.rating)}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top books by pomodoro */}
      {pomStats?.topBooks?.length > 0 && (
        <div>
          <h2 className="section-heading">Most <span>Focused</span> On 🍅</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}>
            {pomStats.topBooks.map((b, i) => (
              <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-muted)', width: '20px', textAlign: 'right' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 500 }}>{b._id}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--pink-hot)', fontWeight: 700 }}>{b.minutes}m</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: '5px' }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (b.minutes / (pomStats.totalReadingMinutes || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA if no data */}
      {!stats?.total && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-mid)', fontSize: '1.3rem', marginBottom: '24px' }}>
            Start your reading journey today!
          </p>
          <Link to="/discover" className="btn btn-primary btn-lg">Discover Books ✨</Link>
        </div>
      )}
    </div>
  );
}
