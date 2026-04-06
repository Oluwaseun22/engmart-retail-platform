// src/pages/ReportsPage.js
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ReportsPage() {
  const [period,  setPeriod]  = useState('monthly');
  const [report,  setReport]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [top,     setTop]     = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/reports/sales', { params: { period } }),
      api.get('/reports/dashboard'),
    ]).then(([salesRes, dashRes]) => {
      setReport(salesRes.data.report);
      setTop(dashRes.data.top_products);
    }).finally(() => setLoading(false));
  }, [period]);

  const totalRevenue = report.reduce((s, r) => s + parseFloat(r.revenue || 0), 0);
  const totalTxns    = report.reduce((s, r) => s + parseInt(r.transactions || 0), 0);
  const avgValue     = totalTxns > 0 ? totalRevenue / totalTxns : 0;

  const chartData = {
    labels: report.map(r => r.period_key),
    datasets: [{
      label: 'Revenue (£)',
      data: report.map(r => parseFloat(r.revenue || 0)),
      backgroundColor: report.map((_, i) => i === report.length - 1 ? '#1e3a5f' : '#bfdbfe'),
      borderRadius: 5,
    }],
  };

  function exportCSV() {
    const headers = ['Period', 'Revenue (£)', 'Transactions', 'Avg Sale Value (£)'];
    const rows = report.map(r => [
      r.period_key,
      parseFloat(r.revenue).toFixed(2),
      r.transactions,
      parseFloat(r.avg_sale_value || 0).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `engmart_report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-sub">Sales performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['daily','weekly','monthly'].map(p => (
            <button key={p} className={`btn btn-sm ${period===p ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriod(p)} style={{ textTransform: 'capitalize' }}>{p}</button>
          ))}
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">£{totalRevenue.toFixed(2)}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--green)' }}>
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{totalTxns}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f472b6' }}>
          <div className="stat-label">Avg Sale Value</div>
          <div className="stat-value">£{avgValue.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Revenue chart */}
        <div className="card">
          {loading ? <div className="spinner" /> : (
            report.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data for this period</p>
              : <Bar data={chartData} options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
                }} />
          )}
        </div>

        {/* Top products */}
        <div className="card">
          <div className="card-title">🏆 Top Products (30 days)</div>
          {top.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No data yet</p>}
          {top.map((p, i) => (
            <div key={p.sku} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 16 }}>{ ['🥇','🥈','🥉','4️⃣','5️⃣'][i] }</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.units_sold} units</div>
              </div>
              <strong>£{parseFloat(p.revenue).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Detailed Report — {period}</div>
        {loading ? <div className="spinner" /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Period</th><th>Revenue (£)</th><th>Transactions</th><th>Avg Sale Value</th></tr>
              </thead>
              <tbody>
                {report.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No data</td></tr>}
                {report.map(r => (
                  <tr key={r.period_key}>
                    <td>{r.period_key}</td>
                    <td><strong>£{parseFloat(r.revenue).toFixed(2)}</strong></td>
                    <td>{r.transactions}</td>
                    <td>£{parseFloat(r.avg_sale_value || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
