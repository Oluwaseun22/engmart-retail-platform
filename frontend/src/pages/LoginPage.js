// src/pages/LoginPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2040 0%, #1e3a5f 50%, #152a46 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🛍️</div>
          <h1 style={{ color: 'var(--navy)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>ENGMart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Retail Management Platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="sarah@engmart.co.uk"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 15, marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--navy)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, marginTop: 20 }}>
          🔒 Secured with JWT Authentication
        </p>
        {/* AUDIT FIX [credentials]: Demo credentials removed from UI.
            See README.md for test account details. */}
      </div>
    </div>
  );
}
