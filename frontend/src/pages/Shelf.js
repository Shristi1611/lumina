import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShelf } from '../context/ShelfContext';

const TABS = [
  { key: '', label: 'All Books', icon: '📚' },
  { key: 'reading', label: 'Reading', icon: '📖' },
  { key: 'want-to-read', label: 'Want to Read', icon: '🔖' },
  { key: 'finished', label: 'Finished', icon: '✅' },
];

export default function Shelf() {
  const { shelf, loading, fetchShelf, updateBook, removeBook, stats, fetchStats } = useShelf();
  const [activeTab, setActiveTab] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShelf(activeTab || undefined);
    fetchStats();
  }, [activeTab]);

  const displayShelf = activeTab ? shelf.filter(b => b.status === activeTab) : shelf;

  const progressPct = (item) => {
    if (!item.pageCount || item.pageCount === 0) return 0;
    return Math.min(100, Math.round((item.currentPage / item.pageCount) * 100));
  };

  return (
    <div className="page-container" style={{ padding: '48px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <h1 className="section-heading" style={{ margin: 0 }}>My <span>Shelf</span> 📚</h1>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, icon: '📚' },
            { label: 'Reading', value: stats.reading, icon: '📖' },
            { label: 'Finished', value: stats.finished, icon: '✅' },
            { label: 'Want to Read', value: stats.wantToRead, icon: '🔖' },
            { label: 'Minutes Read', value: stats.totalReadingMinutes?.toLocaleString(), icon: '⏱️' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px', minWidth: '110px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--pink-hot)', fontWeight: 700 }}>{s.value}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '2px solid var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === tab.key ? '3px solid var(--pink-hot)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--pink-hot)' : 'var(--text-light)',
              fontWeight: activeTab === tab.key ? 700 : 400,
              padding: '8px 16px',
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      )}

      {!loading && displayShelf.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</p>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '20px' }}>
            Your shelf is empty! Time to add some books.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/discover')}>
            Discover Books ✨
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {displayShelf.map(item => (
          <div key={item._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '0', height: '140px' }}>
              {/* Cover */}
              <div
                style={{ width: '90px', flexShrink: 0, cursor: 'pointer' }}
                onClick={() => navigate(`/book/${item.bookId}`)}
              >
                {item.cover
                  ? <img src={item.cover} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pink-blush)', fontSize: '2rem' }}>📚</div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, padding: '14px 16px', overflow: 'hidden' }}>
                <p
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '3px', cursor: 'pointer',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}
                  onClick={() => navigate(`/book/${item.bookId}`)}
                >
                  {item.title}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '8px' }}>{item.author}</p>

                <select
                  className="form-input"
                  value={item.status}
                  onChange={e => updateBook(item._id, { status: e.target.value })}
                  style={{ fontSize: '0.75rem', padding: '5px 8px', marginBottom: '8px', borderRadius: '8px' }}
                  onClick={e => e.stopPropagation()}
                >
                  <option value="want-to-read">🔖 Want to Read</option>
                  <option value="reading">📖 Reading</option>
                  <option value="finished">✅ Finished</option>
                </select>

                {item.status === 'reading' && (
                  <div>
                    <div className="progress-bar-track" style={{ height: '5px' }}>
                      <div className="progress-bar-fill" style={{ width: `${progressPct(item)}%` }} />
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {item.currentPage || 0} / {item.pageCount || '?'} pages ({progressPct(item)}%)
                    </p>
                  </div>
                )}

                {item.status === 'finished' && item.rating > 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>{'⭐'.repeat(item.rating)}</p>
                )}
              </div>

              {/* Remove */}
              <button
                className="btn btn-ghost"
                style={{ padding: '8px', color: 'var(--text-muted)', alignSelf: 'flex-start', margin: '6px 4px 0 0', borderRadius: '50%', fontSize: '0.8rem' }}
                onClick={() => removeBook(item._id)}
                title="Remove"
              >✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
