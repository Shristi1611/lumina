import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back, gorgeous! 💅');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-art">
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'white', fontSize: '3.5rem', lineHeight: 1.1, textAlign: 'center', marginBottom: '20px' }}>
          Lumina<br /><span style={{ color: 'var(--gold-light)' }}>Reads</span> ✨
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontSize: '1.1rem', textAlign: 'center', maxWidth: '280px' }}>
          "A girl should be two things: classy and fabulous. And well-read."
        </p>
        <div style={{ marginTop: '40px', display: 'flex', gap: '16px', fontSize: '2rem' }}>
          {['📚','🎀','✨','💅','🌸'].map(e => <span key={e}>{e}</span>)}
        </div>
      </div>

      <div className="auth-panel-form">
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2.2rem', color: 'var(--text-dark)', marginBottom: '8px' }}>
            Welcome back!
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '36px' }}>
            Log in to your fabulous bookshelf
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className="form-input"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="elle@harvard.edu"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-input"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
              {loading ? '...' : 'Log In 💅'}
            </button>
          </form>

          <div className="divider">or</div>

          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--pink-hot)', fontWeight: 700, textDecoration: 'none' }}>
              Create an account ✨
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Let\'s get reading! 🎀');
      navigate('/discover');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-art">
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'white', fontSize: '3.5rem', lineHeight: 1.1, textAlign: 'center', marginBottom: '20px' }}>
          Join<br /><span style={{ color: 'var(--gold-light)' }}>Lumina</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontSize: '1.1rem', textAlign: 'center', maxWidth: '280px' }}>
          Build your dream bookshelf and become the most well-read person in the room 📚
        </p>
        <div style={{ marginTop: '40px', display: 'flex', gap: '16px', fontSize: '2rem' }}>
          {['📖','🌸','💕','✨','🎀'].map(e => <span key={e}>{e}</span>)}
        </div>
      </div>

      <div className="auth-panel-form">
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2.2rem', color: 'var(--text-dark)', marginBottom: '8px' }}>
            Start your story
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '36px' }}>
            Free forever. No credit card. Just books. 💅
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text" className="form-input"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Elle Woods"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className="form-input"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="elle@harvard.edu"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-input"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="At least 6 characters"
                required minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
              {loading ? '...' : 'Create Account ✨'}
            </button>
          </form>

          <div className="divider">or</div>

          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--pink-hot)', fontWeight: 700, textDecoration: 'none' }}>
              Log in 💅
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
