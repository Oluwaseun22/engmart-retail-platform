// src/pages/NotFoundPage.js
// AUDIT FIX [10.1]: Custom 404 page instead of silent redirect
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🔍</div>
        <h1 style={{ fontSize: 72, fontWeight: 800, color: 'var(--navy)', lineHeight: 1, marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Page not found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go back</button>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to dashboard</button>
        </div>
      </div>
    </div>
  );
}
