// src/pages/DashboardPage.js
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
// AUDIT FIX [empty-states, 4.3]: Skeleton loader prevents CLS and gives empty state on load
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>
        <div className="stat-icon" aria-hidden="true">{icon}</div>
      </div>
    </div>
  );
}

// AUDIT FIX [4.3]: Skeleton card prevents layout shift while data loads
function SkeletonCard() {
  return (
    <div className="stat-card" style={{ borderLeftColor: 'var(--border)' }}>
      <div style={{ height: 14, width: '60%', background: 'var(--border)', borderRadius: 4, marginBottom: 10 }} />
      <div style={{ height: 28, width: '40%', background: 'var(--border)', borderRadius: 4 }} />
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden="true">📊</div>
      <p style={{ fontSize: 13 }}>{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (error)   return <div className="alert alert-error">{error}</div>;

  // AUDIT FIX [4.3]: Render skeleton cards during load to prevent CLS
  if (loading) return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Loading…</p>
        </div>
      </div>
      <div className="stat-grid">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    </div>
  );

  const { kpis, weekly, monthly, top_products, by_category } = data;

  const weeklyChart = {
    labels: weekly.map(d => new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Revenue (£)',
      data: weekly.map(d => parseFloat(d.revenue)),
      backgroundColor: '#1e3a5f',
      borderRadius: 5,
    }],
  };

  const monthlyChart = {
    labels: monthly.map(d => d.month),
    datasets: [{
      label: 'Monthly Revenue (£)',
      data: monthly.map(d => parseFloat(d.revenue)),
      backgroundColor: '#2d5a9a',
      borderRadius: 5,
    }],
  };

  const chartOpts = (title) => ({
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: title, color: '#1e293b', font: { size: 13 } } },
    scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.username} 👋</h1>
          <p className="page-sub">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard label="Today's Revenue"   value={`£${parseFloat(kpis.today_revenue).toFixed(2)}`}  icon="💷" color="var(--navy)" />
        <StatCard label="Today's Sales"     value={kpis.today_sales}                                 icon="🛒" color="var(--green)" />
        <StatCard label="Total Products"    value={kpis.total_products}                              icon="📦" color="#2d5a9a" />
        <StatCard label="Low Stock Alerts"  value={kpis.low_stock_count}                             icon="⚠️" color={kpis.low_stock_count > 0 ? 'var(--amber)' : 'var(--green)'} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card">
          {weekly.length === 0
            ? <EmptyChart message="No sales in the last 7 days" />
            : <Bar data={weeklyChart} options={chartOpts('Weekly Sales (Last 7 Days)')} />}
        </div>
        <div className="card">
          {monthly.length === 0
            ? <EmptyChart message="No sales data yet" />
            : <Bar data={monthlyChart} options={chartOpts('Monthly Revenue')} />}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top products */}
        <div className="card">
          <div className="card-title">🏆 Top Products (Last 30 Days)</div>
          <table>
            <thead>
              <tr><th>Product</th><th>Units</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {top_products.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales data yet</td></tr>}
              {top_products.map(p => (
                <tr key={p.sku}>
                  <td>{p.name}</td>
                  <td>{p.units_sold}</td>
                  <td style={{ fontWeight: 600 }}>£{parseFloat(p.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Revenue by category */}
        <div className="card">
          <div className="card-title">📂 Revenue by Category</div>
          {by_category.map((c, i) => {
            const max = by_category[0]?.revenue || 1;
            const pct = ((c.revenue / max) * 100).toFixed(0);
            const colors = ['var(--navy)', 'var(--green)', '#f472b6', 'var(--amber)', '#c084fc'];
            return (
              <div key={c.category} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span>{c.category}</span>
                  <span style={{ fontWeight: 600 }}>£{parseFloat(c.revenue).toFixed(2)}</span>
                </div>
                <div style={{ background: '#f1f5f9', height: 7, borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: 7, background: colors[i % colors.length], borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
          {by_category.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No data yet</p>}
        </div>
      </div>
    </div>
  );
}
