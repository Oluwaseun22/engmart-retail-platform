// src/pages/SalesPage.js
import { useState, useEffect } from 'react';
import api from '../services/api';
import EmptyState from '../components/layout/EmptyState';

function NewSaleModal({ onClose, onSaved }) {
  const [products, setProducts]   = useState([]);
  const [search,   setSearch]     = useState('');
  const [cart,     setCart]       = useState([]);
  const [method,   setMethod]     = useState('cash');
  const [notes,    setNotes]      = useState('');
  const [error,    setError]      = useState('');
  const [loading,  setLoading]    = useState(false);
  const [searching,setSearching]  = useState(false);

  useEffect(() => {
    if (!search) return setProducts([]);
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await api.get('/products', { params: { search, limit: 8 } });
      setProducts(data.products);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  function addToCart(product) {
    setCart(prev => {
      const exists = prev.find(i => i.product_id === product.product_id);
      if (exists) return prev.map(i => i.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
    setSearch('');
    setProducts([]);
  }

  function removeFromCart(product_id) { setCart(prev => prev.filter(i => i.product_id !== product_id)); }
  function updateQty(product_id, qty) { if (qty < 1) return; setCart(prev => prev.map(i => i.product_id === product_id ? {...i, quantity: qty} : i)); }

  const total = cart.reduce((sum, i) => sum + (i.price * i.quantity - (i.discount || 0)), 0);

  async function handleSubmit() {
    if (cart.length === 0) return setError('Add at least one product.');
    setLoading(true);
    setError('');
    try {
      await api.post('/sales', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, discount: i.discount || 0 })),
        payment_method: method,
        notes,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Sale failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 14, padding: 28, width: '90%', maxWidth: 760, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 className="modal-title">🛒 Process New Sale</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: product search */}
          <div>
            <label className="form-label">Search Products</label>
            <input className="form-control" placeholder="Type product name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
            {searching && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0' }}>Searching…</p>}
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {products.map(p => (
                <div key={p.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, background: '#f9fafb' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sku} · {p.quantity} in stock</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>£{parseFloat(p.price).toFixed(2)}</strong>
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(p)} disabled={p.quantity === 0}>Add</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: cart */}
          <div>
            <label className="form-label">Order Summary</label>
            {cart.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No items added yet</p>}
            {cart.map(item => (
              <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>£{parseFloat(item.price).toFixed(2)} each</div>
                </div>
                <input type="number" min="1" value={item.quantity} style={{ width: 52, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 13 }}
                  onChange={e => updateQty(item.product_id, parseInt(e.target.value))} />
                <span style={{ fontWeight: 600, minWidth: 60, textAlign: 'right' }}>£{(item.price * item.quantity).toFixed(2)}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.product_id)}>✕</button>
              </div>
            ))}

            {cart.length > 0 && (
              <div style={{ marginTop: 12, padding: '10px 0', borderTop: '2px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
                  <span>Total</span><span>£{total.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['cash','card','bank_transfer'].map(m => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className={`btn btn-sm ${method===m ? 'btn-primary' : 'btn-outline'}`}>
                    {m === 'cash' ? '💵 Cash' : m === 'card' ? '💳 Card' : '🏦 Transfer'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any sale notes…" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={loading || cart.length === 0}>
            {loading ? 'Processing…' : `✅ Complete Sale — £${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [sales,   setSales]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [modal,   setModal]   = useState(false);
  const [success, setSuccess] = useState('');

  async function fetchSales() {
    setLoading(true);
    const { data } = await api.get('/sales', { params: { page, limit: 15 } });
    setSales(data.sales);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => { fetchSales(); }, [page]);

  function handleSaleComplete() {
    setModal(false);
    setSuccess('Sale completed successfully! Inventory updated.');
    fetchSales();
    setTimeout(() => setSuccess(''), 4000);
  }

  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      {modal && <NewSaleModal onClose={() => setModal(false)} onSaved={handleSaleComplete} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-sub">{total} total transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Sale</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {loading ? <div className="spinner" /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Date</th><th>Staff</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {sales.length === 0 && !loading && (
                  <tr><td colSpan={7}>
                    <EmptyState icon="🛒" title="No sales yet" message="Process your first sale to see transactions here." action="+ New Sale" onAction={() => setModal(true)} />
                  </td></tr>
                )}
                {sales.map(s => (
                  <tr key={s.sale_id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{s.sale_id}</td>
                    <td>{new Date(s.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{s.username}</td>
                    <td>{s.items_count} item{s.items_count !== 1 ? 's' : ''}</td>
                    <td style={{ textTransform: 'capitalize' }}>{s.payment_method.replace('_', ' ')}</td>
                    <td><strong>£{parseFloat(s.total_amount).toFixed(2)}</strong></td>
                    <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page===1}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
              <button key={n} className={`page-btn ${page===n?'active':''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}
