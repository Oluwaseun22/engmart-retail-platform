// src/components/layout/ErrorBoundary.js
// AUDIT FIX [10.1]: React error boundary catches runtime errors gracefully
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'var(--bg)',
        }}>
          <div style={{
            background: 'white', borderRadius: 14, padding: '40px 36px',
            maxWidth: 440, width: '90%', textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: 'var(--text)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              An unexpected error occurred. Please refresh the page or return to the dashboard.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => window.location.reload()}>
                Refresh page
              </button>
              <button className="btn btn-primary" onClick={() => { this.setState({ hasError: false }); window.location.href = '/dashboard'; }}>
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
