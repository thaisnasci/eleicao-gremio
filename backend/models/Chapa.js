const mongoose = require('mongoose');

module.exports = mongoose.model('Chapa', new mongoose.Schema({
  numero: { type: String, required: true, unique: true, trim: true },
  nome: { type: String, required: true, trim: true },
  descricao: { type: String, trim: true, default: '' }
}, { timestamps: true }));
