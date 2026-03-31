import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../hooks/usePomodoro';
import { useShelf } from '../context/ShelfContext';
import toast from 'react-hot-toast';

const MODE_LABELS = {
  'work': { label: 'Focus Time', emoji: '🍅', color: 'var(--pink-hot)' },
  'short-break': { label: 'Short Break', emoji: '☕', color: '#2ec48a' },
  'long-break': { label: 'Long Break', emoji: '🌸', color: '#8b5cf6' },
};

export default function PomodoroPage() {
  const {
    settings, mode, timeLeft, isRunning, sessionCount,
    currentBook, setCurrentBook, sessionStats, progress,
    start, pause, reset, switchMode, saveSettings, formatTime,
  } = usePomodoro();

  const { shelf, fetchShelf } = useShelf();
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(settings);

  useEffect(() => { fetchShelf('reading'); }, []);
  useEffect(() => { setSettingsForm(settings); }, [settings]);

  const currentMode = MODE_LABELS[mode];

  // Update document title with timer
  useEffect(() => {
    document.title = isRunning ? `${formatTime(timeLeft)} — ${currentMode.label} | Lumina` : 'Lumina 💅';
    return () => { document.title = 'Lumina 💅'; };
  }, [timeLeft, isRunning, mode]);

  const circumference = 2 * Math.PI * 110; // r=110
  const dashOffset = circumference * (1 - progress);

  const readingBooks = shelf.filter(b => b.status === 'reading');

  const handleSaveSettings = async () => {
    await saveSettings(settingsForm);
    setShowSettings(false);
  };

  return (
    <div className="page-container" style={{ padding: '48px 24px', maxWidth: '860px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
        <h1 className="section-heading" style={{ margin: 0 }}>
          {currentMode.emoji} <span>Pomodoro</span> Reader
        </h1>
        <button className="btn btn-outline btn-sm" onClick={() => setShowSettings(true)}>
          ⚙️ Settings
        </button>
      </div>

      {/* Mode switcher */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
        {Object.entries(MODE_LABELS).map(([key, val]) => (
          <button
            key={key}
            className="btn btn-sm"
            style={{
              background: mode === key ? val.color : 'transparent',
              color: mode === key ? 'white' : 'var(--text-light)',
              border: `2px solid ${mode === key ? val.color : 'var(--border)'}`,
              borderRadius: '100px',
              fontWeight: mode === key ? 700 : 400,
            }}
            onClick={() => { if (!isRunning) switchMode(key); else toast('Pause timer first!'); }}
          >
            {val.emoji} {val.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* SVG Ring */}
          <div style={{ position: 'relative', width: '280px', height: '280px', marginBottom: '32px' }}>
            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
              {/* Track */}
              <circle cx="140" cy="140" r="110" fill="none" stroke="var(--pink-blush)" strokeWidth="12" />
              {/* Progress */}
              <circle
                cx="140" cy="140" r="110"
                fill="none"
                stroke={currentMode.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
              />
            </svg>

            {/* Center content */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3.4rem',
                fontWeight: 700,
                color: currentMode.color,
                lineHeight: 1,
                letterSpacing: '-2px',
              }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: '6px',
              }}>
                {currentMode.label}
              </div>
              {sessionCount > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                  {Array(settings.sessionsBeforeLongBreak).fill(0).map((_, i) => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: i < (sessionCount % settings.sessionsBeforeLongBreak) ? 'var(--pink-hot)' : 'var(--pink-blush)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-icon" onClick={reset} title="Reset" style={{ fontSize: '1.2rem' }}>↺</button>
            <button
              className={`btn btn-lg ${isRunning ? 'btn-outline' : 'btn-primary'}`}
              style={{ minWidth: '120px', borderRadius: '100px' }}
              onClick={isRunning ? pause : start}
            >
              {isRunning ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => {
                const modes = ['work', 'short-break', 'long-break'];
                const next = modes[(modes.indexOf(mode) + 1) % modes.length];
                if (!isRunning) switchMode(next);
                else toast('Pause first!');
              }}
              title="Skip"
              style={{ fontSize: '1.2rem' }}
            >⏭</button>
          </div>

          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Sessions today: <strong style={{ color: 'var(--pink-hot)' }}>{sessionCount}</strong>
            {settings.autoStartBreaks && <span style={{ marginLeft: '10px' }}>• Auto-break on</span>}
          </p>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Book selector */}
          <div className="card" style={{ padding: '24px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', marginBottom: '14px', color: 'var(--text-dark)' }}>
              📖 Reading Session For
            </p>
            {readingBooks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No books in progress. Add one to your shelf!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className={`btn btn-sm ${!currentBook ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => setCurrentBook(null)}
                >
                  🎯 General focus
                </button>
                {readingBooks.map(b => (
                  <button
                    key={b._id}
                    className={`btn btn-sm ${currentBook?._id === b._id ? 'btn-gold' : 'btn-ghost'}`}
                    style={{ justifyContent: 'flex-start', textAlign: 'left', gap: '10px' }}
                    onClick={() => setCurrentBook(b)}
                  >
                    {b.cover && <img src={b.cover} alt="" style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session stats */}
          {sessionStats && (
            <div className="card" style={{ padding: '24px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', marginBottom: '14px', color: 'var(--text-dark)' }}>
                📊 Your Stats
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Total Sessions', value: sessionStats.completedSessions },
                  { label: 'This Week', value: sessionStats.weekSessions },
                  { label: 'Minutes Read', value: sessionStats.totalReadingMinutes },
                  { label: 'Hours Read', value: (sessionStats.totalReadingMinutes / 60).toFixed(1) },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--pink-pale)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--pink-hot)', fontWeight: 700 }}>{s.value}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {sessionStats.topBooks?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Books</p>
                  {sessionStats.topBooks.slice(0, 3).map(b => (
                    <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-mid)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{b._id}</span>
                      <span style={{ color: 'var(--pink-hot)', fontWeight: 700 }}>{b.minutes}m</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div style={{ background: 'linear-gradient(135deg, var(--pink-pale), var(--gold-pale))', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
              💅 <em>"The best accessory a girl can have is a book in her hand."</em>
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Work {settings.workDuration}min → Break {settings.shortBreakDuration}min → Every {settings.sessionsBeforeLongBreak} sessions: Long break {settings.longBreakDuration}min
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '28px', color: 'var(--pink-hot)' }}>
              ⚙️ Timer Settings
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Work Duration (min)', key: 'workDuration' },
                { label: 'Short Break (min)', key: 'shortBreakDuration' },
                { label: 'Long Break (min)', key: 'longBreakDuration' },
                { label: 'Sessions Before Long Break', key: 'sessionsBeforeLongBreak' },
              ].map(({ label, key }) => (
                <div key={key} className="form-group">
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>{label}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settingsForm[key]}
                    onChange={e => setSettingsForm(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                    min={1}
                    max={key === 'sessionsBeforeLongBreak' ? 10 : 90}
                    style={{ padding: '10px 12px' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {[
                { label: '🔔 Sound notifications', key: 'soundEnabled' },
                { label: '▶ Auto-start breaks', key: 'autoStartBreaks' },
              ].map(({ label, key }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settingsForm[key]}
                    onChange={e => setSettingsForm(p => ({ ...p, [key]: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--pink-hot)' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-mid)' }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSettings}>Save Settings 💅</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
