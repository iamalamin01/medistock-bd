'use client';
import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [modal, setModal] = useState(false);
  const [meds, setMeds] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ supplier: '', supplierPhone: '', paidAmount: '', note: '' });
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/purchases').then(r => setPurchases(r.data.purchases)); }, []);
  useEffect(() => { if (q) api.get(`/medicines?q=${q}`).then(r => setMeds(r.data)); else setMeds([]); }, [q]);

  const addItem = med => {
    setItems(prev => {
      const ex = prev.find(x => x.medicine === med._id);
      if (ex) return prev.map(x => x.medicine === med._id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { medicine: med._id, name: med.name, qty: 1, price: med.purchasePrice }];
    });
    setQ(''); setMeds([]);
  };

  const save = async e => {
    e.preventDefault();
    if (items.length === 0) return setError('Kono item add koroni');
    setError('');
    try {
      await api.post('/purchases', { ...form, items });
      setModal(false); setItems([]); setForm({ supplier: '', supplierPhone: '', paidAmount: '', note: '' });
      api.get('/purchases').then(r => setPurchases(r.data.purchases));
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const total = items.reduce((s, x) => s + x.price * x.qty, 0);

  return (
    <AppLayout title="📦 Purchases">
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Purchase</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Date</th><th>Supplier</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th><th>By</th></tr></thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p._id}>
                <td>{new Date(p.createdAt).toLocaleDateString('bn-BD')}</td>
                <td>{p.supplier || '—'}</td>
                <td>{p.items.length}</td>
                <td>৳{p.total}</td>
                <td>৳{p.paidAmount}</td>
                <td><span className={`badge ${p.dueAmount > 0 ? 'badge-red' : 'badge-green'}`}>৳{p.dueAmount}</span></td>
                <td>{p.addedBy?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ width: 640 }} onClick={e => e.stopPropagation()}>
            <h2>New Purchase</h2>
            {error && <div className="alert alert-red">{error}</div>}
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Supplier Name</label>
                  <input className="form-control" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Supplier Phone</label>
                  <input className="form-control" value={form.supplierPhone} onChange={e => setForm({ ...form, supplierPhone: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>Medicine Search</label>
                <input className="form-control" value={q} onChange={e => setQ(e.target.value)} placeholder="Medicine search koro..." />
                {meds.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, zIndex: 10 }}>
                    {meds.map(m => (
                      <div key={m._id} onClick={() => addItem(m)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14 }}>
                        {m.name} — ৳{m.purchasePrice}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <table style={{ marginBottom: 12 }}>
                  <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Sub</th></tr></thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td><input type="number" value={item.qty} min="1" style={{ width: 60 }}
                          onChange={e => setItems(items.map((x, j) => j === i ? { ...x, qty: +e.target.value } : x))} /></td>
                        <td><input type="number" value={item.price} style={{ width: 80 }}
                          onChange={e => setItems(items.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))} /></td>
                        <td>৳{item.price * item.qty}</td>
                      </tr>
                    ))}
                    <tr><td colSpan={3}><strong>Total</strong></td><td><strong>৳{total}</strong></td></tr>
                  </tbody>
                </table>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Paid Amount</label>
                  <input className="form-control" type="number" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <input className="form-control" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
