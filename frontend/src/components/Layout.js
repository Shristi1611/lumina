import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="nav-logo">
            Lumina<span>Reads</span> ✨
          </Link>

          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Discover</NavLink>
            {user && <>
              <NavLink to="/shelf" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>My Shelf</NavLink>
              <NavLink to="/pomodoro" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>🍅 Pomodoro</NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
            </>}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                  Hi, {user.name.split(' ')[0]}! 💅
                </span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main style={{ minHeight: 'calc(100vh - 68px)', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        background: 'rgba(253,248,240,0.8)',
        position: 'relative',
        zIndex: 1,
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Lumina✨ — because reading is totally a vibe 💅
        </p>
      </footer>
    </>
  );
}
