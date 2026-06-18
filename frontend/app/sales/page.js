'use client';
import { useState, useEffect, Fragment } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../lib/api';

export default function Sales() {
  const [tab, setTab] = useState('pos');
  const [meds, setMeds] = useState([]);
  const [q, setQ] = useState('');
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState('cash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [sales, setSales] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (q) api.get(`/medicines?q=${q}`).then(r => setMeds(r.data));
    else setMeds([]);
  }, [q]);

  useEffect(() => {
    if (tab === 'history') api.get('/sales?limit=30').then(r => setSales(r.data.sales));
  }, [tab]);

  const addToCart = med => {
    setCart(prev => {
      const ex = prev.find(x => x.medicine === med._id);
      if (ex) return prev.map(x => x.medicine === med._id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { medicine: med._id, name: med.name, price: med.sellingPrice, qty: 1, stock: med.stock }];
    });
    setQ(''); setMeds([]);
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setCart(prev => prev.map(x => x.medicine === id ? { ...x, qty } : x));
  };

  const removeItem = id => setCart(prev => prev.filter(x => x.medicine !== id));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const total = subtotal - (Number(discount) || 0);

  const checkout = async () => {
    if (cart.length === 0) return setError('Cart is empty!');
    setError('');
    try {
      const { data } = await api.post('/sales', {
        items: cart.map(x => ({ medicine: x.medicine, qty: x.qty })),
        discount: Number(discount) || 0,
        paymentMethod: payment, customerPhone
      });
      setSuccess(`Invoice: ${data.invoiceNo} | Total: ৳${data.total}`);
      setCart([]); setDiscount(0); setCustomerPhone('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Sale failed');
    }
  };

  return (
    <AppLayout title="🛒 Sales / POS">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className={`btn ${tab === 'pos' ? 'btn-primary' : ''}`} onClick={() => setTab('pos')}>New Sale</button>
        <button className={`btn ${tab === 'history' ? 'btn-primary' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>

      {tab === 'pos' && (
        <div className="pos-grid">
          <div>
            {success && <div className="alert" style={{ background: '#f0fff4', color: '#276749', border: '1px solid #9ae6b4' }}>✅ {success}</div>}
            {error && <div className="alert alert-red">{error}</div>}
            <div className="pos-items">
              <div style={{ position: 'relative' }}>
                <input className="search-input" style={{ width: '100%', marginBottom: 8 }}
                  placeholder="Medicine name diye search koro..." value={q}
                  onChange={e => setQ(e.target.value)} />
                {meds.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                    {meds.map(m => (
                      <div key={m._id} onClick={() => addToCart(m)}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f7fafc' }}
                        onMouseEnter={e => e.target.style.background = '#f7fafc'}
                        onMouseLeave={e => e.target.style.background = '#fff'}>
                        <strong>{m.name}</strong> — ৳{m.sellingPrice} <span style={{ color: '#718096' }}>(Stock: {m.stock})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#a0aec0', padding: '40px 0' }}>Search kore medicine add koro</p>
              ) : (
                <table>
                  <thead><tr><th>Medicine</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.medicine}>
                        <td>{item.name}</td>
                        <td>৳{item.price}</td>
                        <td>
                          <div className="cart-qty">
                            <button onClick={() => updateQty(item.medicine, item.qty - 1)}>−</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQty(item.medicine, item.qty + 1)}>+</button>
                          </div>
                        </td>
                        <td>৳{item.price * item.qty}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => removeItem(item.medicine)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="pos-cart">
            <h3 style={{ marginBottom: 12 }}>Order Summary</h3>
            <div className="form-group">
              <label>Customer Phone</label>
              <input className="form-control" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label>Discount (৳)</label>
              <input className="form-control" type="number" value={discount} onChange={e => setDiscount(e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select className="form-control" value={payment} onChange={e => setPayment(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="bkash">bKash</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div className="cart-total">
              <div className="cart-total-row"><span>Subtotal</span><span>৳{subtotal}</span></div>
              <div className="cart-total-row"><span>Discount</span><span>−৳{discount || 0}</span></div>
              <div className="cart-total-row grand"><span>Total</span><span>৳{total}</span></div>
            </div>
            <button className="btn btn-success" style={{ width: '100%', marginTop: 16, padding: 12, fontSize: 16 }} onClick={checkout}>
              ✅ Checkout
            </button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <table>
            <thead><tr><th>Invoice</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Cashier</th></tr></thead>
            <tbody>
              {sales.map(s => (
                <Fragment key={s._id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === s._id ? null : s._id)}>
                    <td><strong>{s.invoiceNo}</strong></td>
                    <td>{new Date(s.createdAt).toLocaleString('bn-BD')}</td>
                    <td>{s.items.length} items {expanded === s._id ? '▲' : '▼'}</td>
                    <td>৳{s.total}</td>
                    <td><span className="badge badge-blue">{s.paymentMethod}</span></td>
                    <td>{s.cashier?.name}</td>
                  </tr>
                  {expanded === s._id && (
                    <tr key={s._id + '-detail'}>
                      <td colSpan={6} style={{ background: '#f7fafc', padding: '10px 20px' }}>
                        <table style={{ width: '100%' }}>
                          <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                          <tbody>
                            {s.items.map((item, i) => (
                              <tr key={i}>
                                <td>{item.name}</td>
                                <td>{item.qty}</td>
                                <td>৳{item.price}</td>
                                <td>৳{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {s.discount > 0 && <div style={{ textAlign: 'right', marginTop: 6, fontSize: 13 }}>Discount: ৳{s.discount}</div>}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
