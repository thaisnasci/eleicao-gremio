const mongoose = require('mongoose');

// A matrícula nunca é armazenada no voto: ela serve apenas para validar o eleitor.
module.exports = mongoose.model('Voto', new mongoose.Schema({
  chapa: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapa', default: null },
  tipo: { type: String, enum: ['chapa', 'branco'], required: true },
  data: { type: Date, default: Date.now }
}));
