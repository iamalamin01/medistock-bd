'use client';
import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';

const empty = { name: '', phone: '', password: '', role: 'cashier' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/users').then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); setError(''); };
  const openEdit = u => { setForm({ name: u.name, phone: u.phone, role: u.role, password: '' }); setEditing(u._id); setModal(true); setError(''); };

  const save = async e => {
    e.preventDefault(); setError('');
    try {
      if (editing) await api.put(`/users/${editing}`, form);
      else await api.post('/users', form);
      setModal(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const deactivate = async id => {
    if (!confirm('Deactivate user?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  const roleColors = { admin: 'badge-red', pharmacist: 'badge-blue', cashier: 'badge-green', manager: 'badge-orange' };

  return (
    <AppLayout title="👥 User Management">
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.phone}</td>
                <td><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                <td><span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => openEdit(u)} style={{ marginRight: 6 }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deactivate(u._id)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit User' : 'Add User'}</h2>
            {error && <div className="alert alert-red">{error}</div>}
            <form onSubmit={save}>
              <div className="form-group"><label>Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
              <div className="form-group">
                <label>Password {editing && '(blank = no change)'}</label>
                <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {['admin', 'pharmacist', 'cashier', 'manager'].map(r => <option key={r}>{r}</option>)}
                </select>
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
