require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Settings = require('./models/Settings');

const medicines = [
  { name: 'Napa 500mg', genericName: 'Paracetamol', company: 'Beximco', batchNo: 'BX001', expiryDate: '2027-06-01', purchasePrice: 3, sellingPrice: 5, stock: 500, unit: 'pcs', lowStockAlert: 50 },
  { name: 'Seclo 20mg', genericName: 'Omeprazole', company: 'Square', batchNo: 'SQ002', expiryDate: '2026-12-01', purchasePrice: 8, sellingPrice: 12, stock: 200, unit: 'pcs', lowStockAlert: 30 },
  { name: 'Amodis 400mg', genericName: 'Metronidazole', company: 'ACI', batchNo: 'AC003', expiryDate: '2027-01-01', purchasePrice: 6, sellingPrice: 10, stock: 150, unit: 'pcs', lowStockAlert: 20 },
  { name: 'Cef-3 250mg', genericName: 'Ceftriaxone', company: 'Opsonin', batchNo: 'OP004', expiryDate: '2025-09-01', purchasePrice: 120, sellingPrice: 150, stock: 8, unit: 'vial', lowStockAlert: 10 },
  { name: 'Losartan 50mg', genericName: 'Losartan', company: 'Renata', batchNo: 'RN005', expiryDate: '2026-03-01', purchasePrice: 12, sellingPrice: 18, stock: 300, unit: 'pcs', lowStockAlert: 50 },
  { name: 'Metformin 500mg', genericName: 'Metformin HCl', company: 'Square', batchNo: 'SQ006', expiryDate: '2027-08-01', purchasePrice: 5, sellingPrice: 8, stock: 400, unit: 'pcs', lowStockAlert: 50 },
  { name: 'Neoceptin-R', genericName: 'Ranitidine', company: 'Beximco', batchNo: 'BX007', expiryDate: '2025-10-01', purchasePrice: 4, sellingPrice: 6, stock: 5, unit: 'pcs', lowStockAlert: 20 },
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', company: 'ACI', batchNo: 'AC008', expiryDate: '2027-03-01', purchasePrice: 7, sellingPrice: 12, stock: 250, unit: 'pcs', lowStockAlert: 30 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany(); await Medicine.deleteMany(); await Settings.deleteMany();

  await User.create([
    { name: 'Admin User', phone: '01700000000', password: 'admin123', role: 'admin' },
    { name: 'Pharmacist Rahim', phone: '01700000001', password: 'pharm123', role: 'pharmacist' },
    { name: 'Cashier Karim', phone: '01700000002', password: 'cash123', role: 'cashier' },
    { name: 'Manager Salam', phone: '01700000003', password: 'mgr123', role: 'manager' },
  ]);

  await Medicine.create(medicines);
  await Settings.create({ shopName: 'MediStock BD Pharmacy', address: 'Dhaka, Bangladesh', phone: '01700000000', currency: 'BDT' });

  console.log('✅ Seed data inserted successfully');
  console.log('Admin login: 01700000000 / admin123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
