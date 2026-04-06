// src/components/layout/EmptyState.js
// AUDIT FIX [empty-states]: Reusable empty state component for zero-data scenarios
export default function EmptyState({ icon = '📭', title, message, action, onAction }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      {message && <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 280, lineHeight: 1.5 }}>{message}</p>}
      {action && onAction && (
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onAction}>{action}</button>
      )}
    </div>
  );
}
