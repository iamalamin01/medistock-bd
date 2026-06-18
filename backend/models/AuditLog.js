const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  action: String,
  target: String,
  detail: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditSchema);
