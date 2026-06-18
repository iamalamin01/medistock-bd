'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';

const empty = { name: '', genericName: '', company: '', batchNo: '', expiryDate: '', purchasePrice: '', sellingPrice: '', stock: '', unit: 'pcs', lowStockAlert: 10, category: '' };

export default function Medicines() {
  const [meds, setMeds] = useState([]);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get(`/medicines?q=${q}`).then(r => setMeds(r.data));
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); setError(''); };
  const openEdit = m => { setForm({ ...m, expiryDate: m.expiryDate?.slice(0, 10) }); setEditing(m._id); setModal(true); setError(''); };

  const save = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/medicines/${editing}`, form);
      else await api.post('/medicines', form);
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving');
    }
  };

  const del = async id => {
    if (!confirm('Deactivate this medicine?')) return;
    await api.delete(`/medicines/${id}`);
    load();
  };

  const f = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <AppLayout title="💊 Medicines / Stock">
      <div className="search-bar">
        <input className="search-input" placeholder="Search by name or generic name..." value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Medicine</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Generic</th><th>Company</th><th>Expiry</th><th>Buy</th><th>Sell</th><th>Stock</th><th>Action</th></tr>
          </thead>
          <tbody>
            {meds.map(m => (
              <tr key={m._id}>
                <td><strong>{m.name}</strong></td>
                <td>{m.genericName}</td>
                <td>{m.company}</td>
                <td><span className={`badge ${new Date(m.expiryDate) < new Date() ? 'badge-red' : 'badge-green'}`}>{m.expiryDate?.slice(0, 10)}</span></td>
                <td>৳{m.purchasePrice}</td>
                <td>৳{m.sellingPrice}</td>
                <td><span className={`badge ${m.stock <= m.lowStockAlert ? 'badge-red' : 'badge-green'}`}>{m.stock} {m.unit}</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => openEdit(m)} style={{ marginRight: 6 }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(m._id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Medicine' : 'Add Medicine'}</h2>
            {error && <div className="alert alert-red">{error}</div>}
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['name', 'Medicine Name *'], ['genericName', 'Generic Name'], ['company', 'Company'], ['batchNo', 'Batch No'], ['category', 'Category']].map(([k, l]) => (
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input className="form-control" value={form[k] || ''} onChange={f(k)} required={l.includes('*')} />
                  </div>
                ))}
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input className="form-control" type="date" value={form.expiryDate || ''} onChange={f('expiryDate')} required />
                </div>
                {[['purchasePrice', 'Purchase Price *'], ['sellingPrice', 'Selling Price *'], ['stock', 'Stock Quantity'], ['lowStockAlert', 'Low Stock Alert']].map(([k, l]) => (
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input className="form-control" type="number" value={form[k] || ''} onChange={f(k)} required={l.includes('*')} />
                  </div>
                ))}
                <div className="form-group">
                  <label>Unit</label>
                  <select className="form-control" value={form.unit} onChange={f('unit')}>
                    {['pcs', 'strip', 'bottle', 'box', 'vial', 'sachet'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
