import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, notesAPI } from '../utils/api';
import { useShelf } from '../context/ShelfContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NOTE_COLORS = ['pink', 'yellow', 'mint', 'lavender'];

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBook, updateBook, removeBook, isOnShelf, getShelfItem, fetchShelf } = useShelf();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shelfItem, setShelfItem] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [notePage, setNotePage] = useState('');
  const [noteColor, setNoteColor] = useState('pink');
  const [notesLoading, setNotesLoading] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    booksAPI.getBook(id)
      .then(r => {
        setBook(r.data.book);
        setLoading(false);
      })
      .catch(() => { toast.error('Book not found'); navigate('/discover'); });
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchShelf().then(() => {
        const item = getShelfItem(id);
        setShelfItem(item);
        if (item) setPageInput(item.currentPage || 0);
      });
    }
  }, [user, id]);

  useEffect(() => {
    const item = getShelfItem(id);
    setShelfItem(item);
    if (item) setPageInput(item.currentPage || 0);
  });

  const loadNotes = async () => {
    if (!user || !isOnShelf(id)) return;
    setNotesLoading(true);
    try {
      const r = await notesAPI.getNotes(id);
      setNotes(r.data.notes);
    } catch {}
    finally { setNotesLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'notes' && user) loadNotes();
  }, [activeTab, user]);

  const handleAddToShelf = async (status) => {
    if (!user) { navigate('/login'); return; }
    try {
      const item = await addBook({
        bookId: id,
        title: book.title,
        author: book.author,
        cover: book.cover,
        description: book.description,
        pageCount: book.pageCount || 0,
        publishedYear: book.publishedYear,
        status,
      });
      setShelfItem(item);
      toast.success(`Added to shelf! 🎀`);
    } catch (e) {
      if (e.response?.data?.message?.includes('already')) toast('Already on your shelf!');
      else toast.error('Could not add book');
    }
  };

  const handleStatusChange = async (status) => {
    if (!shelfItem) return;
    const updated = await updateBook(shelfItem._id, { status });
    setShelfItem(updated);
    toast.success(`Status updated! ✨`);
  };

  const handlePageUpdate = async () => {
    if (!shelfItem) return;
    const updated = await updateBook(shelfItem._id, { currentPage: parseInt(pageInput) || 0 });
    setShelfItem(updated);
    toast.success('Progress saved! 📖');
  };

  const handleRating = async (rating) => {
    if (!shelfItem) return;
    const updated = await updateBook(shelfItem._id, { rating });
    setShelfItem(updated);
    toast.success('Rating saved! ⭐');
  };

  const handleRemove = async () => {
    if (!shelfItem) return;
    if (!window.confirm('Remove from shelf?')) return;
    await removeBook(shelfItem._id);
    setShelfItem(null);
    toast('Removed from shelf');
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    try {
      const r = await notesAPI.createNote({ bookId: id, content: noteInput, page: notePage || null, color: noteColor });
      setNotes(prev => [r.data.note, ...prev]);
      setNoteInput('');
      setNotePage('');
      toast.success('Note saved! 📝');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    await notesAPI.deleteNote(noteId);
    setNotes(prev => prev.filter(n => n._id !== noteId));
    toast('Note deleted');
  };

  if (loading) return (
    <div className="page-container" style={{ padding: '60px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px' }}>
        <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
        <div>
          <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '32px' }} />
          <div className="skeleton" style={{ height: '14px', marginBottom: '10px' }} />
          <div className="skeleton" style={{ height: '14px', width: '80%', marginBottom: '10px' }} />
        </div>
      </div>
    </div>
  );

  if (!book) return null;

  const progressPct = shelfItem?.pageCount > 0
    ? Math.min(100, Math.round((shelfItem.currentPage / shelfItem.pageCount) * 100))
    : 0;

  return (
    <div className="page-container" style={{ padding: '48px 24px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '32px' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'clamp(180px, 22%, 260px) 1fr', gap: '48px', alignItems: 'start' }}>
        {/* Cover */}
        <div>
          <div className="book-cover-wrap" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
            {book.cover
              ? <img src={book.cover} alt={book.title} className="book-cover" />
              : <div className="book-cover-placeholder" style={{ display: 'flex' }}>
                  <span style={{ fontSize: '3rem' }}>📚</span>
                  <span className="book-title-placeholder">{book.title}</span>
                </div>
            }
          </div>

          {/* Shelf actions */}
          <div style={{ marginTop: '20px' }}>
            {!user ? (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                Login to Add 💅
              </button>
            ) : !shelfItem ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleAddToShelf('want-to-read')}>+ Want to Read</button>
                <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => handleAddToShelf('reading')}>📖 Start Reading</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  className="form-input"
                  value={shelfItem.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  style={{ fontSize: '0.85rem', padding: '9px 12px' }}
                >
                  <option value="want-to-read">🔖 Want to Read</option>
                  <option value="reading">📖 Currently Reading</option>
                  <option value="finished">✅ Finished</option>
                </select>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }} onClick={handleRemove}>
                  Remove from shelf
                </button>
              </div>
            )}
          </div>

          {/* Rating */}
          {shelfItem && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Rating</p>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="star" onClick={() => handleRating(s)}>
                    {s <= (shelfItem.rating || 0) ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginBottom: '8px', lineHeight: 1.15 }}>
            {book.title}
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.05rem', marginBottom: '16px' }}>
            by <strong style={{ color: 'var(--pink-deep)' }}>{book.author}</strong>
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {book.publishedYear && <span className="badge badge-gold">📅 {book.publishedYear}</span>}
            {book.ratingsAverage && <span className="badge badge-pink">★ {book.ratingsAverage} ({book.ratingsCount?.toLocaleString()} ratings)</span>}
          </div>

          {/* Progress bar if reading */}
          {shelfItem?.status === 'reading' && (
            <div style={{ marginBottom: '28px', background: 'var(--pink-pale)', borderRadius: 'var(--radius-md)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--pink-deep)' }}>Reading Progress</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--pink-hot)', fontWeight: 700 }}>{progressPct}%</span>
              </div>
              <div className="progress-bar-track" style={{ marginBottom: '14px' }}>
                <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '100px', padding: '8px 12px', fontSize: '0.85rem' }}
                  value={pageInput}
                  onChange={e => setPageInput(e.target.value)}
                  placeholder="Page"
                  min={0}
                  max={shelfItem.pageCount || 9999}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  / {shelfItem.pageCount || '?'} pages
                </span>
                <button className="btn btn-primary btn-sm" onClick={handlePageUpdate}>Save</button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
            {['about', 'subjects', ...(user && shelfItem ? ['notes'] : [])].map(tab => (
              <button
                key={tab}
                className="btn btn-ghost btn-sm"
                style={{
                  borderRadius: '8px 8px 0 0',
                  borderBottom: activeTab === tab ? '3px solid var(--pink-hot)' : '3px solid transparent',
                  color: activeTab === tab ? 'var(--pink-hot)' : 'var(--text-light)',
                  fontWeight: activeTab === tab ? 700 : 400,
                  textTransform: 'capitalize',
                  padding: '8px 16px',
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'notes' ? '📝 Notes' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <div>
              {book.description ? (
                <p style={{ color: 'var(--text-mid)', lineHeight: '1.8', fontSize: '0.97rem', whiteSpace: 'pre-line' }}>
                  {book.description}
                </p>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description available for this book.</p>
              )}
            </div>
          )}

          {activeTab === 'subjects' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {book.subjects?.length > 0
                ? book.subjects.map(s => (
                    <span key={s} className="badge badge-lavender">{s}</span>
                  ))
                : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No subjects listed.</p>
              }
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              {/* Add note form */}
              <form onSubmit={handleAddNote} style={{ marginBottom: '24px', background: 'var(--pink-pale)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <textarea
                  className="form-input"
                  style={{ width: '100%', minHeight: '90px', resize: 'vertical', marginBottom: '12px' }}
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Write a note about this book..."
                />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '90px', padding: '8px 12px', fontSize: '0.85rem' }}
                    value={notePage}
                    onChange={e => setNotePage(e.target.value)}
                    placeholder="Page #"
                    min={1}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNoteColor(c)}
                        style={{
                          width: '24px', height: '24px', borderRadius: '50%', border: noteColor === c ? '3px solid var(--text-dark)' : '2px solid transparent',
                          background: c === 'pink' ? '#f9b4cd' : c === 'yellow' ? '#fde68a' : c === 'mint' ? '#a7f3d0' : '#c4b5fd',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Save Note</button>
                </div>
              </form>

              {notesLoading && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Loading notes...</p>}
              {!notesLoading && notes.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes yet. Add your first one! 📝</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notes.map(note => (
                  <div key={note._id} className={`note-${note.color}`} style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {note.page ? `Page ${note.page} · ` : ''}
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '2px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                        onClick={() => handleDeleteNote(note._id)}
                      >✕</button>
                    </div>
                    <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-dark)' }}>{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
