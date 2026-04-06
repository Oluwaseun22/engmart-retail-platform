// src/pages/ResetPasswordPage.js
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams]            = useSearchParams();
  const token                     = searchParams.get('token');
  const navigate                  = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [message, setMessage]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired link.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#c62828' }}>Invalid reset link. Please request a new one.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f2040 0%, #1e3a5f 50%, #152a46 100%)' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 14, width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a237e', marginBottom: 6 }}>Reset your password</h2>
          <p style={{ color: '#666', fontSize: 13 }}>Enter a new password for your account.</p>
        </div>

        {message && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{message} Redirecting to login...</div>}
        {error   && <div style={{ background: '#fdecea', color: '#c62828', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#333' }}>New password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min 8 characters" required minLength={8}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }}
          />
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#333' }}>Confirm password</label>
          <input
            type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat new password" required
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px 0', background: '#1a237e', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
