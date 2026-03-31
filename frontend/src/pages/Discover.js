import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  { key: 'horror', label: '👻 Horror' },
  { key: 'historical_fiction', label: '🏰 Historical' },
  { key: 'thriller', label: '🔥 Thriller' },
];

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSubject, setActiveSubject] = useState(searchParams.get('subject') || '');
  const { addBook, isOnShelf, getShelfItem } = useShelf();
  const { user } = useAuth();
  const navigate = useNavigate();

  const doSearch = async (q, p = 1) => {
    if (!q) return;
    setLoading(true);
    try {
      const res = await booksAPI.search(q, p);
      if (p === 1) setBooks(res.data.books);
      else setBooks(prev => [...prev, ...res.data.books]);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const doSubject = async (subject) => {
    setLoading(true);
    try {
      const res = await booksAPI.bySubject(subject);
      setBooks(res.data.books);
      setTotalPages(1);
    } catch { toast.error('Could not load subject'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    const s = searchParams.get('subject');
    if (q) { setQuery(q); setActiveSubject(''); doSearch(q); }
    else if (s) { setActiveSubject(s); setQuery(''); doSubject(s); }
    else { doSubject('romance'); setActiveSubject('romance'); }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setActiveSubject('');
    }
  };

  const handleSubject = (key) => {
    setSearchParams({ subject: key });
    setQuery('');
  };

  const handleAdd = async (book) => {
    if (!user) { navigate('/login'); return; }
    try {
      await addBook({ ...book, status: 'want-to-read' });
      toast.success(`Added to shelf! 🎀`);
    } catch (e) {
      if (e.response?.data?.message?.includes('already')) toast('Already on your shelf!');
      else toast.error('Could not add');
    }
  };

  return (
    <div className="page-container" style={{ padding: '48px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="section-heading">
          Discover <span>Books</span> ✨
        </h1>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '520px', marginBottom: '24px' }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search titles, authors, subjects..."
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SUBJECTS.map(s => (
            <button
              key={s.key}
              className={`badge ${activeSubject === s.key ? 'badge-pink' : 'badge-gold'}`}
              style={{ cursor: 'pointer', border: 'none', padding: '7px 14px', fontSize: '0.78rem' }}
              onClick={() => handleSubject(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading && books.length === 0 ? (
        <div className="book-grid">
          {Array(12).fill(0).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-md)' }} />
              <div className="skeleton" style={{ height: '14px', marginTop: '10px', borderRadius: '6px', width: '80%' }} />
              <div className="skeleton" style={{ height: '11px', marginTop: '6px', borderRadius: '6px', width: '55%' }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="book-grid">
            {books.map(book => (
              <BookCard
                key={book.bookId}
                book={book}
                onAdd={handleAdd}
                shelfStatus={isOnShelf(book.bookId) ? getShelfItem(book.bookId)?.status : null}
              />
            ))}
          </div>

          {books.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</p>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.2rem' }}>
                No books found. Try a different search!
              </p>
            </div>
          )}

          {page < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button
                className="btn btn-outline"
                onClick={() => doSearch(query, page + 1)}
                disabled={loading}
              >
                {loading ? '...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
