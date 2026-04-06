// src/pages/InventoryPage.js
import { useState, useEffect } from 'react';
import api from '../services/api';
import EmptyState from '../components/layout/EmptyState';

function AdjustModal({ item, onClose, onSaved }) {
  const [change,  setChange]  = useState(0);
  const [reorder, setReorder] = useState(item.reorder_level);
  const [reason,  setReason]  = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (change === 0) return setError('Quantity change cannot be zero.');
    setLoading(true);
    try {
      await api.put(`/inventory/${item.product_id}/adjust`, {
        quantity_change: parseInt(change),
        reorder_level:   parseInt(reorder),
        reason,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Adjustment failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Adjust Stock — {item.product_name}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 13 }}>
          Current stock: <strong>{item.quantity}</strong> units
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Quantity Change</label>
              <input className="form-control" type="number" value={change}
                onChange={e => setChange(e.target.value)}
                placeholder="+10 to restock, -5 to reduce" required />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                New quantity: <strong>{item.quantity + parseInt(change || 0)}</strong>
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input className="form-control" type="number" min="0" value={reorder}
                onChange={e => setReorder(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason (optional)</label>
            <input className="form-control" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. New delivery received, damaged stock removed…" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Apply Adjustment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { ok: ['badge-ok', '✅ OK'], low: ['badge-low', '⚠️ Low'], critical: ['badge-critical', '🔴 Critical'], out_of_stock: ['badge-out', '⚫ Out'] };
  const [cls, label] = map[status] || ['badge-out', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [alerts,    setAlerts]    = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [modal,     setModal]     = useState(null);

  async function fetchInventory() {
    setLoading(true);
    try {
      const params = filter === 'low' ? { low_stock: true } : {};
      const { data } = await api.get('/inventory', { params });
      setInventory(data.inventory);
      const alertRes = await api.get('/inventory/alerts');
      setAlerts(alertRes.data.low_stock_count);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchInventory(); }, [filter]);

  return (
    <div>
      {modal && (
        <AdjustModal item={modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchInventory(); }} />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">{inventory.length} products tracked</p>
        </div>
      </div>

      {alerts > 0 && (
        <div className="alert alert-warning">
          ⚠️ <strong>{alerts} products</strong> are at or below their reorder level and require restocking.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'low'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Products' : '⚠️ Low Stock Only'}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Category</th><th>In Stock</th><th>Reorder Level</th><th>Status</th><th>Last Updated</th><th>Action</th></tr>
              </thead>
              <tbody>
                {inventory.length === 0 && !loading && (
                  <tr><td colSpan={8}>
                    <EmptyState icon="🗃️" title={filter === 'low' ? 'No low stock items' : 'No inventory records'} message={filter === 'low' ? 'All products are well stocked.' : 'Add products first to track inventory here.'} />
                  </td></tr>
                )}
                {inventory.map(item => (
                  <tr key={item.inventory_id}>
                    <td><strong>{item.product_name}</strong></td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.sku}</td>
                    <td>{item.category_name}</td>
                    <td><strong>{item.quantity}</strong></td>
                    <td>{item.reorder_level}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(item.last_updated).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(item)}>Adjust</button>
                    </td>
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
