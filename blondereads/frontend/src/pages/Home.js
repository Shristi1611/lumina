import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { booksAPI } from '../utils/api';
import { useShelf } from '../context/ShelfContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import toast from 'react-hot-toast';

const SUBJECTS = [
  { key: 'romance', label: '💕 Romance' },
  { key: 'mystery', label: '🔍 Mystery' },
  { key: 'fantasy', label: '🧚 Fantasy' },
  { key: 'science_fiction', label: '🚀 Sci-Fi' },
  { key: 'biography', label: '👑 Biography' },
  { key: 'self_help', label: '✨ Self-Help' },
];

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const { addBook, isOnShelf, getShelfItem, fetchShelf } = useShelf();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    booksAPI.trending()
      .then(r => setTrending(r.data.books.slice(0, 8)))
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
    if (user) fetchShelf();
  }, [user]);

  const handleAdd = async (book) => {
    if (!user) { navigate('/login'); return; }
    try {
      await addBook({ ...book, status: 'want-to-read' });
      toast.success(`"${book.title}" added to your shelf! 🎀`);
    } catch (e) {
      if (e.response?.data?.message?.includes('already')) toast('Already on your shelf! 📚');
      else toast.error('Could not add book');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/discover?q=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        padding: '80px 0 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* big decorative blobs */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-80px',
          width: '480px', height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-60px',
          width: '360px', height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="page-container">
          <div style={{ maxWidth: '640px' }}>
            <p className="serif-accent" style={{ color: 'var(--pink-mid)', fontSize: '1.15rem', marginBottom: '12px' }}>
              Welcome to your fabulous reading life
            </p>
            <h1 className="display-title" style={{ marginBottom: '20px' }}>
              Reading has<br />never been this<br /><em style={{ color: 'var(--gold)' }}>glamorous.</em>
            </h1>
            <p style={{ color: 'var(--text-mid)', fontSize: '1.1rem', marginBottom: '36px', maxWidth: '480px', lineHeight: '1.7' }}>
              Discover books, track your reading with the Pomodoro method, and build your dream bookshelf. Because smart is the new pink. 💅
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '480px', flexWrap: 'wrap' }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: '240px' }}
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search for books, authors..."
              />
              <button type="submit" className="btn btn-primary">Search ✨</button>
            </form>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              {SUBJECTS.map(s => (
                <Link
                  key={s.key}
                  to={`/discover?subject=${s.key}`}
                  className="badge badge-pink"
                  style={{ textDecoration: 'none', cursor: 'pointer', padding: '6px 14px' }}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      {user && (
        <section style={{
          background: 'linear-gradient(135deg, var(--pink-hot) 0%, var(--pink-deep) 100%)',
          padding: '28px 0',
          marginBottom: '0',
        }}>
          <div className="page-container">
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
                Keep up the fabulous reading, {user.name.split(' ')[0]}! 🌸
              </p>
              <Link to="/dashboard" className="btn btn-gold btn-sm" style={{ marginLeft: 'auto' }}>
                View Dashboard →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Trending ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '32px' }}>
            <h2 className="section-heading" style={{ margin: 0 }}>
              Trending <span>this week</span>
            </h2>
            <Link to="/discover" style={{ color: 'var(--pink-hot)', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 600 }}>
              See all →
            </Link>
          </div>

          {trendingLoading ? (
            <div className="book-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-md)' }} />
                  <div className="skeleton" style={{ height: '14px', marginTop: '10px', borderRadius: '6px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '11px', marginTop: '6px', borderRadius: '6px', width: '55%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="book-grid stagger">
              {trending.map(book => (
                <BookCard
                  key={book.bookId}
                  book={book}
                  onAdd={handleAdd}
                  shelfStatus={isOnShelf(book.bookId) ? getShelfItem(book.bookId)?.status : null}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Feature callout ── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="page-container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: '📚', title: 'Your Bookshelf', desc: 'Curate your reading list with want-to-read, currently reading, and finished lists.', link: '/shelf', cta: 'Open Shelf' },
              { icon: '🍅', title: 'Pomodoro Reader', desc: 'Stay focused with timed reading sessions. Track every minute you spend with your books.', link: '/pomodoro', cta: 'Start Session' },
              { icon: '📊', title: 'Reading Dashboard', desc: 'See your stats, streaks, and which books you\'ve loved most.', link: '/dashboard', cta: 'View Stats' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: '32px 28px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '10px', color: 'var(--text-dark)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: '1.6' }}>{f.desc}</p>
                <Link to={f.link} className="btn btn-outline btn-sm">{f.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
