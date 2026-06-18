# 💊 MediStock BD — Oushadh Dokan Management System

Bangladesh-er medicine shop er jonno complete stock, sales o accounts management system.

---

## 🚀 Features

| Feature | Details |
|---------|---------|
| **Dashboard** | Aajker bikri, low stock & expiry alerts |
| **POS / Sales** | Fast billing, cart, discount, bKash/cash/card |
| **Medicine CRUD** | Add/edit/search medicines with expiry tracking |
| **Purchase Management** | Supplier purchase, stock auto-update |
| **Reports** | Sales summary, stock value, expiry, Profit & Loss |
| **User Management** | Role-based access (Admin/Pharmacist/Cashier/Manager) |
| **Settings** | Shop name, address, phone |

## 👤 User Roles

| Role | Access |
|------|--------|
| Admin | Full access |
| Pharmacist | Medicines + Purchases |
| Cashier | Sales only |
| Manager | View all + Reports |

---

## 🛠️ Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Backend

```bash
cd medistock-bd/backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run seed    # Insert sample data
npm run dev     # Start server on :5000
```

### Frontend

```bash
cd medistock-bd/frontend
npm install
npm run dev     # Start on :3000
```

### Open Browser
```
http://localhost:3000
```

---

## 🔐 Default Login Credentials

| Role | Phone | Password |
|------|-------|----------|
| Admin | 01700000000 | admin123 |
| Pharmacist | 01700000001 | pharm123 |
| Cashier | 01700000002 | cash123 |
| Manager | 01700000003 | mgr123 |

---

## 📁 Project Structure

```
medistock-bd/
├── backend/
│   ├── models/          # User, Medicine, Sale, Purchase, AuditLog, Settings
│   ├── routes/          # auth, medicines, sales, purchases, users, reports, settings
│   ├── middleware/      # JWT auth + role check
│   ├── server.js
│   ├── seed.js          # Sample data
│   └── .env
└── frontend/
    ├── app/
    │   ├── page.js          # Login
    │   ├── dashboard/
    │   ├── medicines/
    │   ├── sales/           # POS
    │   ├── purchases/
    │   ├── reports/
    │   ├── users/
    │   └── settings/
    ├── components/
    │   ├── AppLayout.js
    │   └── Sidebar.js
    └── lib/api.js
```

---

## 📦 Sample Data (included in seed.js)

- 8 real Bangladeshi medicines (Napa, Seclo, Amodis, etc.)
- 4 users (admin, pharmacist, cashier, manager)
- Shop settings

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/medicines | List medicines |
| POST | /api/medicines | Add medicine |
| POST | /api/sales | Create sale (auto deducts stock) |
| GET | /api/sales | Sale history |
| POST | /api/purchases | Add purchase (auto adds stock) |
| GET | /api/reports/sales-summary | Sales stats |
| GET | /api/reports/stock | Stock report |
| GET | /api/reports/expiry | Expiry report |
| GET | /api/reports/profit-loss | P&L report |

---

## 📞 Support
For issues: admin@medistock.bd
