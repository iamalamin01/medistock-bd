'use client';
import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';

export default function SettingsPage() {
  const [form, setForm] = useState({ shopName: '', address: '', phone: '', currency: 'BDT' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/settings').then(r => setForm(r.data)); }, []);

  const save = async e => {
    e.preventDefault(); setSaved(false); setError('');
    try {
      await api.put('/settings', form);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving');
    }
  };

  return (
    <AppLayout title="⚙️ Settings">
      <div className="card" style={{ maxWidth: 560 }}>
        <h3 style={{ marginBottom: 16 }}>Shop Details</h3>
        {saved && <div className="alert" style={{ background: '#f0fff4', color: '#276749', border: '1px solid #9ae6b4' }}>✅ Settings saved!</div>}
        {error && <div className="alert alert-red">{error}</div>}
        <form onSubmit={save}>
          <div className="form-group"><label>Shop Name</label><input className="form-control" value={form.shopName || ''} onChange={e => setForm({ ...form, shopName: e.target.value })} /></div>
          <div className="form-group"><label>Address</label><textarea className="form-control" rows={2} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-group">
            <label>Currency</label>
            <select className="form-control" value={form.currency || 'BDT'} onChange={e => setForm({ ...form, currency: e.target.value })}>
              {['BDT', 'USD', 'EUR'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Save Settings</button>
        </form>
      </div>
    </AppLayout>
  );
}
