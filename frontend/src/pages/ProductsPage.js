// src/pages/ProductsPage.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/layout/EmptyState';

// AUDIT FIX [2.4]: Proper confirmation modal — replaces window.confirm
function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <h2 className="modal-title">{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function StockBadge({ qty, reorder }) {
  if (qty === 0) return <span className="badge badge-out">Out of Stock</span>;
  if (qty <= reorder / 2) return <span className="badge badge-critical">Critical ({qty})</span>;
  if (qty <= reorder) return <span className="badge badge-low">Low ({qty})</span>;
  return <span className="badge badge-ok">In Stock ({qty})</span>;
}

function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?.product_id;
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || '',
    category_id: product?.category_id || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await api.put(`/products/${product.product_id}`, form);
      else await api.post('/products', form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input className="form-control" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Price (£) *</label>
              <input className="form-control" type="number" step="0.01" min="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | {} | product
  // AUDIT FIX [2.4]: Track pending delete for confirm dialog
  const [confirmDelete, setConfirmDelete] = useState(null); // null | { id, name }

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { search, category_id: catFilter, page, limit: 15 } });
      setProducts(data.products);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [search, catFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)); }, []);

  async function handleDelete(id, name) {
    // AUDIT FIX [2.4]: Show confirm modal instead of window.confirm
    setConfirmDelete({ id, name });
  }

  async function confirmDeleteProduct() {
    if (!confirmDelete) return;
    await api.delete(`/products/${confirmDelete.id}`);
    setConfirmDelete(null);
    fetchProducts();
  }

  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      {confirmDelete && (
        <ConfirmModal
          title={`Deactivate "${confirmDelete.name}"?`}
          message="This product will be hidden from the catalogue. Existing sales records will not be affected."
          confirmLabel="Deactivate product"
          onConfirm={confirmDeleteProduct}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {modal !== null && (
        <ProductModal
          product={modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchProducts(); }}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub">{total} products in catalogue</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal({})}>+ Add Product</button>}
      </div>

      <div className="search-bar">
        <input className="form-control search-input" placeholder="🔍 Search by name or SKU…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="form-control" style={{ width: 180 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon="📦"
                        title="No products found"
                        message={search || catFilter ? 'Try adjusting your search or filter.' : 'Add your first product to get started.'}
                        action={isAdmin && !search && !catFilter ? '+ Add Product' : null}
                        onAction={() => setModal({})}
                      />
                    </td>
                  </tr>
                )}
                {products.map(p => (
                  <tr key={p.product_id}>
                    <td><strong>{p.name}</strong><br /><span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.description?.substring(0, 50)}</span></td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.sku}</td>
                    <td>{p.category_name}</td>
                    <td><strong>£{parseFloat(p.price).toFixed(2)}</strong></td>
                    <td><StockBadge qty={p.quantity} reorder={p.reorder_level} /></td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setModal(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.product_id, p.name)}>Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}
