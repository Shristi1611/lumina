import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookCard({ book, onAdd, shelfStatus }) {
  const navigate = useNavigate();

  const statusBadge = {
    'want-to-read': { label: '🔖 Want to Read', cls: 'badge-lavender' },
    'reading': { label: '📖 Reading', cls: 'badge-pink' },
    'finished': { label: '✅ Finished', cls: 'badge-mint' },
  };

  return (
    <div className="book-card fade-in" onClick={() => navigate(`/book/${book.bookId}`)}>
      <div className="book-cover-wrap">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="book-cover"
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="book-cover-placeholder" style={{ display: book.cover ? 'none' : 'flex' }}>
          <span style={{ fontSize: '2rem' }}>📚</span>
          <span className="book-title-placeholder">{book.title}</span>
        </div>

        <div className="book-card-overlay">
          {shelfStatus ? (
            <span className={`badge ${statusBadge[shelfStatus]?.cls}`} style={{ fontSize: '0.65rem' }}>
              {statusBadge[shelfStatus]?.label}
            </span>
          ) : onAdd ? (
            <button
              className="btn btn-gold btn-sm"
              style={{ fontSize: '0.72rem', padding: '5px 10px' }}
              onClick={e => { e.stopPropagation(); onAdd(book); }}
            >
              + Add
            </button>
          ) : null}
        </div>
      </div>

      <div className="book-card-info">
        <div className="book-card-title">{book.title}</div>
        <div className="book-card-author">{book.author}</div>
        {book.ratingsAverage && (
          <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '3px' }}>
            ★ {book.ratingsAverage}
          </div>
        )}
      </div>
    </div>
  );
}
