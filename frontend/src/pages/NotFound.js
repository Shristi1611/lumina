import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '40px',
    }}>
      <p style={{ fontSize: '5rem', marginBottom: '16px' }}>📚</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '3rem', color: 'var(--pink-hot)', marginBottom: '12px' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '32px', fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontSize: '1.1rem' }}>
        Looks like this chapter hasn't been written yet.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">Back Home 💅</Link>
    </div>
  );
}
