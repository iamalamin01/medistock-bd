'use client';
import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);

  useEffect(() => {
    api.get('/reports/sales-summary?period=today').then(r => setStats(r.data));
    api.get('/medicines?lowStock=true').then(r => setLowStock(r.data));
    api.get('/reports/expiry?days=90').then(r => setNearExpiry(r.data));
  }, []);

  return (
    <AppLayout title="Dashboard">
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="label">আজকের বিক্রি</div>
          <div className="value">৳{stats.totalSales?.toLocaleString()}</div>
        </div>
        <div className="stat-card green">
          <div className="label">আজকের অর্ডার</div>
          <div className="value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card red">
          <div className="label">Low Stock</div>
          <div className="value">{lowStock.length}</div>
        </div>
        <div className="stat-card orange">
          <div className="label">Expiry Soon (90d)</div>
          <div className="value">{nearExpiry.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>⚠️ Low Stock Medicines</h3>
          {lowStock.length === 0 ? <p style={{ color: '#718096', fontSize: 14 }}>সব মেডিসিন স্বাভাবিক আছে ✅</p> :
            <table>
              <thead><tr><th>Name</th><th>Stock</th><th>Alert</th></tr></thead>
              <tbody>{lowStock.map(m => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td><span className="badge badge-red">{m.stock}</span></td>
                  <td>{m.lowStockAlert}</td>
                </tr>
              ))}</tbody>
            </table>
          }
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>📅 Near Expiry Medicines</h3>
          {nearExpiry.length === 0 ? <p style={{ color: '#718096', fontSize: 14 }}>কোনো মেডিসিন শীঘ্রই মেয়াদ শেষ হবে না ✅</p> :
            <table>
              <thead><tr><th>Name</th><th>Expiry</th></tr></thead>
              <tbody>{nearExpiry.slice(0, 8).map(m => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td><span className="badge badge-orange">{new Date(m.expiryDate).toLocaleDateString('bn-BD')}</span></td>
                </tr>
              ))}</tbody>
            </table>
          }
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
        <Link href="/sales" className="btn btn-primary">🛒 New Sale</Link>
        <Link href="/medicines" className="btn btn-success">💊 View Stock</Link>
      </div>
    </AppLayout>
  );
}
