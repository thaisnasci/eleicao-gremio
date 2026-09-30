const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const app = express();
const PORT = process.env.PORT || 3000;
const origensPermitidas = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  ...String(process.env.FRONTEND_URL || '').split(',').map((url) => url.trim()).filter(Boolean)
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || origensPermitidas.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS.'));
  }
}));
app.use(express.json());
app.use('/api', apiRoutes);

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI não foi definida. Configure backend/.env antes de iniciar o sistema.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado.'))
  .catch((error) => {
    console.error('Não foi possível conectar ao MongoDB:', error.message);
    process.exit(1);
  });

app.listen(PORT, () => console.log(`API disponível em http://localhost:${PORT}`));
