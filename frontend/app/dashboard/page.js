'use client';
import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';
import Link from 'next/link';

const Card = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div className="label">{label}</div>
        <div className="value" style={{ color }}>{value}</div>
      </div>
      <div style={{ fontSize: 32, opacity: .7 }}>{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [d, setD] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard').then(r => setD(r.data));
  }, []);

  if (!d) return <AppLayout title="Dashboard"><p style={{ color: '#718096', padding: 40, textAlign: 'center' }}>Loading...</p></AppLayout>;

  return (
    <AppLayout title="📊 Dashboard">
      {/* Top Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
        <Card label="আজকের লাভ" value={`৳${d.todayProfit?.toLocaleString()}`} color="#38a169" icon="💰" />
        <Card label="আজকের বিক্রি" value={`৳${d.todaySales?.toLocaleString()}`} color="#3182ce" icon="🛒" />
        <Card label="স্টক ভ্যালু" value={`৳${d.totalStockValue?.toLocaleString()}`} color="#805ad5" icon="📦" />
        <Card label="মোট মেডিসিন" value={d.totalMedicines} color="#2b6cb0" icon="💊" />
        <Card label="Out of Stock" value={d.outOfStock} color={d.outOfStock > 0 ? '#e53e3e' : '#38a169'} icon="🚫" />
        <Card label="Expiry ≤30 দিন" value={d.expiry30} color={d.expiry30 > 0 ? '#e53e3e' : '#38a169'} icon="⚠️" />
        <Card label="Expiry ≤90 দিন" value={d.expiry90} color={d.expiry90 > 0 ? '#dd6b20' : '#38a169'} icon="📅" />
        <Card label="আজকের অর্ডার" value={d.todayOrders} color="#319795" icon="🧾" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <Link href="/sales" className="btn btn-primary">🛒 New Sale</Link>
        <Link href="/medicines" className="btn btn-success">💊 Add Medicine</Link>
        <Link href="/purchases" className="btn" style={{ background: '#805ad5', color: '#fff' }}>📦 New Purchase</Link>
        <Link href="/medicines" className="btn" style={{ background: '#2d3748', color: '#fff' }}>📋 View Stock</Link>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Low Stock */}
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, color: '#e53e3e' }}>⚠️ Low Stock Medicines</h3>
          {d.lowStockList.length === 0
            ? <p style={{ color: '#718096', fontSize: 14 }}>সব মেডিসিন স্বাভাবিক ✅</p>
            : <table>
                <thead><tr><th>Name</th><th>Stock</th><th>Min</th></tr></thead>
                <tbody>{d.lowStockList.map(m => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td><span className="badge badge-red">{m.stock} {m.unit}</span></td>
                    <td style={{ color: '#a0aec0' }}>{m.lowStockAlert}</td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </div>

        {/* Near Expiry */}
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, color: '#dd6b20' }}>📅 Near Expiry (30 days)</h3>
          {d.expiry30List.length === 0
            ? <p style={{ color: '#718096', fontSize: 14 }}>কোনো মেডিসিন নেই ✅</p>
            : <table>
                <thead><tr><th>Name</th><th>Expiry</th><th>Stock</th></tr></thead>
                <tbody>{d.expiry30List.map(m => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td><span className="badge badge-red">{m.expiryDate?.slice(0,10)}</span></td>
                    <td>{m.stock}</td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Sales */}
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, color: '#3182ce' }}>🧾 Recent Sales</h3>
          <table>
            <thead><tr><th>Invoice</th><th>Total</th><th>Payment</th><th>Time</th></tr></thead>
            <tbody>
              {d.recentSales.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.invoiceNo}</strong></td>
                  <td>৳{s.total}</td>
                  <td><span className="badge badge-blue">{s.paymentMethod}</span></td>
                  <td style={{ fontSize: 12, color: '#718096' }}>{new Date(s.createdAt).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
              {d.recentSales.length === 0 && <tr><td colSpan={4} style={{ color: '#a0aec0', textAlign: 'center' }}>কোনো বিক্রি নেই</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Top Selling */}
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, color: '#38a169' }}>🏆 Top Selling (This Month)</h3>
          <table>
            <thead><tr><th>#</th><th>Medicine</th><th>Qty Sold</th></tr></thead>
            <tbody>
              {d.topSelling.map((m, i) => (
                <tr key={i}>
                  <td><span className="badge badge-green">{i + 1}</span></td>
                  <td>{m.name}</td>
                  <td><strong>{m.qty}</strong></td>
                </tr>
              ))}
              {d.topSelling.length === 0 && <tr><td colSpan={3} style={{ color: '#a0aec0', textAlign: 'center' }}>কোনো ডেটা নেই</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
