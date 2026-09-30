<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conexão ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Tentativa de conexão ao banco enviada.'))
  .catch(err => console.error('❌ Erro de conexão:', err.message));

// ==========================================
// MODELOS DO BANCO DE DADOS
// ==========================================
const Aluno = mongoose.model('Aluno', new mongoose.Schema({ 
  matricula: String, 
  jaVotou: { type: Boolean, default: false } 
}));

const Voto = mongoose.model('Voto', new mongoose.Schema({ 
  chapa: String 
}));

const Chapa = mongoose.model('Chapa', new mongoose.Schema({
  nome: String
}));

// ==========================================
// ROTAS DO SISTEMA
// ==========================================

// ROTA PRINCIPAL: Registrar Voto na Urna
app.post('/api/votar', async (req, res) => {
  const { matricula, chapa } = req.body;

  if (!matricula || !chapa) {
    return res.status(400).json({ erro: 'Matrícula e chapa são obrigatórias.' });
  }

  try {
    const aluno = await Aluno.findOne({ matricula });
    if (!aluno) {
      return res.status(404).json({ erro: 'Matrícula não cadastrada na escola.' });
    }

    if (aluno.jaVotou) {
      return res.status(403).json({ erro: 'Voto já registrado para esta matrícula.' });
    }

    aluno.jaVotou = true;
    await aluno.save();

    const novoVoto = new Voto({ chapa });
    await novoVoto.save();

    return res.json({ sucesso: true, mensagem: 'Voto computado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ROTA DE APURAÇÃO: Conta os votos usando JavaScript clássico (Sem usar \$)
app.get('/api/resultados', async (req, res) => {
  try {
    const todosOsVotos = await Voto.find();
    const contagem = {};

    // Agrupa e soma os votos de cada chapa dinamicamente
    todosOsVotos.forEach(v => {
      contagem[v.chapa] = (contagem[v.chapa] || 0) + 1;
    });

    // Formata o resultado no padrão esperado pelo frontend
    const resultadoFormatado = Object.keys(contagem).map(chapaNome => {
      return { _id: chapaNome, total: contagem[chapaNome] };
    });

    return res.json(resultadoFormatado);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar resultados da apuração.' });
  }
});
// ROTA PÚBLICA: Lista as chapas cadastradas para montar as opções da urna
app.get('/api/chapas', async (req, res) => {
  try {
    const chapas = await Chapa.find();
    return res.json(chapas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar chapas.' });
  }
});

// ROTA SECRETA: Cadastrar Matrículas em lote (Separadas por vírgula)
app.post('/api/cadastrar-matriculas', async (req, res) => {
  const { senha, listaMatriculas } = req.body;
  const SENHA_ADMIN = "gremio2026"; 

  if (senha !== SENHA_ADMIN) {
    return res.status(401).json({ erro: 'Senha de administrador inválida.' });
  }

  if (!listaMatriculas || listaMatriculas.trim() === "") {
    return res.status(400).json({ erro: 'A lista de matrículas está vazia.' });
  }

  try {
    const matriculas = listaMatriculas.split(',').map(m => m.trim()).filter(m => m !== "");
    let cadastrados = 0;

    for (let matricula of matriculas) {
      const existe = await Aluno.findOne({ matricula });
      if (!existe) {
        await Aluno.create({ matricula, jaVotou: false });
        cadastrados++;
      }
    }

    return res.json({ sucesso: true, mensagem: `${cadastrados} novas matrículas cadastradas com sucesso!` });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao salvar matrículas.' });
  }
});

// ROTA SECRETA: Cadastrar uma nova chapa dinamicamente no banco
app.post('/api/cadastrar-chapa', async (req, res) => {
  const { senha, nomeChapa } = req.body;
  const SENHA_ADMIN = "gremio2026";

  if (senha !== SENHA_ADMIN) {
    return res.status(401).json({ erro: 'Senha de administrador inválida.' });
  }

  if (!nomeChapa || nomeChapa.trim() === "") {
    return res.status(400).json({ erro: 'O nome da chapa não pode estar vazio.' });
  }

  try {
    await Chapa.create({ nome: nomeChapa.trim() });
    return res.json({ sucesso: true, mensagem: 'Chapa cadastrada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao salvar a chapa.' });
  }
});

// ROTA DE ENTRADA: Serve a tela inicial (index.html) quando o endereço é acessado
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do Servidor Express
const PORT = process.env.PORT || 3000;
=======
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conexão ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Tentativa de conexão ao banco enviada.'))
  .catch(err => console.error('❌ Erro de conexão:', err.message));

// ==========================================
// MODELOS DO BANCO DE DADOS
// ==========================================
const Aluno = mongoose.model('Aluno', new mongoose.Schema({ 
  matricula: String, 
  jaVotou: { type: Boolean, default: false } 
}));

const Voto = mongoose.model('Voto', new mongoose.Schema({ 
  chapa: String 
}));

const Chapa = mongoose.model('Chapa', new mongoose.Schema({
  nome: String
}));

// ==========================================
// ROTAS DO SISTEMA
// ==========================================

// ROTA PRINCIPAL: Registrar Voto na Urna
app.post('/api/votar', async (req, res) => {
  const { matricula, chapa } = req.body;

  if (!matricula || !chapa) {
    return res.status(400).json({ erro: 'Matrícula e chapa são obrigatórias.' });
  }

  try {
    const aluno = await Aluno.findOne({ matricula });
    if (!aluno) {
      return res.status(404).json({ erro: 'Matrícula não cadastrada na escola.' });
    }

    if (aluno.jaVotou) {
      return res.status(403).json({ erro: 'Voto já registrado para esta matrícula.' });
    }

    aluno.jaVotou = true;
    await aluno.save();

    const novoVoto = new Voto({ chapa });
    await novoVoto.save();

    return res.json({ sucesso: true, mensagem: 'Voto computado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ROTA DE APURAÇÃO: Conta os votos usando JavaScript clássico (Sem usar \$)
app.get('/api/resultados', async (req, res) => {
  try {
    const todosOsVotos = await Voto.find();
    const contagem = {};

    // Agrupa e soma os votos de cada chapa dinamicamente
    todosOsVotos.forEach(v => {
      contagem[v.chapa] = (contagem[v.chapa] || 0) + 1;
    });

    // Formata o resultado no padrão esperado pelo frontend
    const resultadoFormatado = Object.keys(contagem).map(chapaNome => {
      return { _id: chapaNome, total: contagem[chapaNome] };
    });

    return res.json(resultadoFormatado);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar resultados da apuração.' });
  }
});
// ROTA PÚBLICA: Lista as chapas cadastradas para montar as opções da urna
app.get('/api/chapas', async (req, res) => {
  try {
    const chapas = await Chapa.find();
    return res.json(chapas);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar chapas.' });
  }
});

// ROTA SECRETA: Cadastrar Matrículas em lote (Separadas por vírgula)
app.post('/api/cadastrar-matriculas', async (req, res) => {
  const { senha, listaMatriculas } = req.body;
  const SENHA_ADMIN = "gremio2026"; 

  if (senha !== SENHA_ADMIN) {
    return res.status(401).json({ erro: 'Senha de administrador inválida.' });
  }

  if (!listaMatriculas || listaMatriculas.trim() === "") {
    return res.status(400).json({ erro: 'A lista de matrículas está vazia.' });
  }

  try {
    const matriculas = listaMatriculas.split(',').map(m => m.trim()).filter(m => m !== "");
    let cadastrados = 0;

    for (let matricula of matriculas) {
      const existe = await Aluno.findOne({ matricula });
      if (!existe) {
        await Aluno.create({ matricula, jaVotou: false });
        cadastrados++;
      }
    }

    return res.json({ sucesso: true, mensagem: `${cadastrados} novas matrículas cadastradas com sucesso!` });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao salvar matrículas.' });
  }
});

// ROTA SECRETA: Cadastrar uma nova chapa dinamicamente no banco
app.post('/api/cadastrar-chapa', async (req, res) => {
  const { senha, nomeChapa } = req.body;
  const SENHA_ADMIN = "gremio2026";

  if (senha !== SENHA_ADMIN) {
    return res.status(401).json({ erro: 'Senha de administrador inválida.' });
  }

  if (!nomeChapa || nomeChapa.trim() === "") {
    return res.status(400).json({ erro: 'O nome da chapa não pode estar vazio.' });
  }

  try {
    await Chapa.create({ nome: nomeChapa.trim() });
    return res.json({ sucesso: true, mensagem: 'Chapa cadastrada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao salvar a chapa.' });
  }
});

// ROTA DE ENTRADA: Serve a tela inicial (index.html) quando o endereço é acessado
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do Servidor Express
const PORT = process.env.PORT || 3000;
>>>>>>> 3c7eae211b331265ea140e69b038921907be94b7
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));