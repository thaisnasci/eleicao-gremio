const mongoose = require('mongoose');

module.exports = mongoose.model('Aluno', new mongoose.Schema({
  matricula: { type: String, required: true, unique: true, trim: true },
  nome: { type: String, trim: true, default: '' },
  jaVotou: { type: Boolean, default: false }
}, { timestamps: true }));
