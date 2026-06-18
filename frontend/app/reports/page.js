'use client';
import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';

export default function Reports() {
  const [tab, setTab] = useState('sales');
  const [period, setPeriod] = useState('today');
  const [salesData, setSalesData] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [expiryData, setExpiryData] = useState([]);
  const [plData, setPlData] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (tab === 'sales') api.get(`/reports/sales-summary?period=${period}`).then(r => setSalesData(r.data));
    if (tab === 'stock') api.get('/reports/stock').then(r => setStockData(r.data));
    if (tab === 'expiry') api.get('/reports/expiry?days=90').then(r => setExpiryData(r.data));
  }, [tab, period]);

  const loadPL = () => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    api.get(`/reports/profit-loss?${params}`).then(r => setPlData(r.data));
  };

  const tabs = ['sales', 'stock', 'expiry', 'profit-loss'];

  return (
    <AppLayout title="📈 Reports">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t.replace('-', ' & ')}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['today', 'week', 'month'].map(p => (
              <button key={p} className={`btn ${period === p ? 'btn-success' : ''}`} onClick={() => setPeriod(p)} style={{ textTransform: 'capitalize' }}>{p}</button>
            ))}
          </div>
          {salesData && (
            <div className="stat-grid">
              <div className="stat-card green">
                <div className="label">Total Sales ({salesData.period})</div>
                <div className="value">৳{salesData.totalSales?.toLocaleString()}</div>
              </div>
              <div className="stat-card blue">
                <div className="label">Total Orders</div>
                <div className="value">{salesData.totalOrders}</div>
              </div>
              {salesData.totalOrders > 0 && (
                <div className="stat-card orange">
                  <div className="label">Avg Order Value</div>
                  <div className="value">৳{Math.round(salesData.totalSales / salesData.totalOrders)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'stock' && stockData && (
        <div>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card blue">
              <div className="label">Total Medicines</div>
              <div className="value">{stockData.medicines?.length}</div>
            </div>
            <div className="stat-card green">
              <div className="label">Total Stock Value</div>
              <div className="value">৳{stockData.totalValue?.toLocaleString()}</div>
            </div>
          </div>
          <div className="card">
            <table>
              <thead><tr><th>Name</th><th>Generic</th><th>Stock</th><th>Buy Price</th><th>Sell Price</th><th>Expiry</th></tr></thead>
              <tbody>
                {stockData.medicines?.map(m => (
                  <tr key={m._id}>
                    <td>{m.name}</td><td>{m.genericName}</td>
                    <td><span className={`badge ${m.stock <= m.lowStockAlert ? 'badge-red' : 'badge-green'}`}>{m.stock}</span></td>
                    <td>৳{m.purchasePrice}</td><td>৳{m.sellingPrice}</td>
                    <td>{m.expiryDate?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'expiry' && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Medicines expiring within 90 days</h3>
          <table>
            <thead><tr><th>Name</th><th>Expiry Date</th><th>Stock</th><th>Company</th></tr></thead>
            <tbody>
              {expiryData.map(m => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td><span className={`badge ${new Date(m.expiryDate) < new Date() ? 'badge-red' : 'badge-orange'}`}>{m.expiryDate?.slice(0, 10)}</span></td>
                  <td>{m.stock}</td><td>{m.company}</td>
                </tr>
              ))}
              {expiryData.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#718096' }}>কোনো মেডিসিন শীঘ্রই মেয়াদ শেষ হবে না ✅</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'profit-loss' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>From</label>
              <input className="form-control" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>To</label>
              <input className="form-control" type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={loadPL}>Calculate</button>
          </div>
          {plData && (
            <div className="stat-grid">
              <div className="stat-card green"><div className="label">Revenue</div><div className="value">৳{plData.revenue?.toLocaleString()}</div></div>
              <div className="stat-card red"><div className="label">Cost</div><div className="value">৳{plData.cost?.toLocaleString()}</div></div>
              <div className={`stat-card ${plData.profit >= 0 ? 'blue' : 'red'}`}>
                <div className="label">Profit</div>
                <div className="value">৳{plData.profit?.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
