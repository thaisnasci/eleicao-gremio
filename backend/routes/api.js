const express = require('express');
const Aluno = require('../models/Aluno');
const Chapa = require('../models/Chapa');
const Voto = require('../models/Voto');
const router = express.Router();

function adminAutorizado(req, res) {
  if (!process.env.ADMIN_PASSWORD || req.body.senha !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ erro: 'Senha de administrador inválida.' });
    return false;
  }
  return true;
}

router.post('/admin/validar', (req, res) => {
  if (!adminAutorizado(req, res)) return;
  return res.json({ sucesso: true });
});

router.post('/alunos/validar', async (req, res) => {
  const matricula = String(req.body.matricula || '').trim();
  if (!matricula) return res.status(400).json({ erro: 'Informe a matrícula.' });
  try {
    const aluno = await Aluno.findOne({ matricula }).select('nome jaVotou');
    if (!aluno) return res.status(404).json({ erro: 'Matrícula não cadastrada.' });
    if (aluno.jaVotou) return res.status(403).json({ erro: 'Esta matrícula já registrou um voto.' });
    return res.json({ sucesso: true, aluno: { nome: aluno.nome } });
  } catch { return res.status(500).json({ erro: 'Erro ao validar a matrícula.' }); }
});

router.get('/chapas', async (req, res) => {
  try { return res.json(await Chapa.find().select('numero nome descricao').sort({ numero: 1 })); }
  catch { return res.status(500).json({ erro: 'Erro ao buscar as chapas.' }); }
});

router.post('/votos', async (req, res) => {
  const matricula = String(req.body.matricula || '').trim();
  const votoBranco = req.body.tipo === 'branco';
  const numeroChapa = String(req.body.numeroChapa || '').trim();
  if (!matricula || (!votoBranco && !numeroChapa)) return res.status(400).json({ erro: 'Matrícula e opção de voto são obrigatórias.' });
  try {
    const chapa = votoBranco ? null : await Chapa.findOne({ numero: numeroChapa });
    if (!votoBranco && !chapa) return res.status(404).json({ erro: 'Número de chapa não encontrado.' });
    const aluno = await Aluno.findOneAndUpdate({ matricula, jaVotou: false }, { $set: { jaVotou: true } }, { new: true });
    if (!aluno) return res.status(403).json({ erro: 'Matrícula inválida ou voto já registrado.' });
    try { await Voto.create({ chapa: chapa ? chapa._id : null, tipo: votoBranco ? 'branco' : 'chapa' }); }
    catch (error) { await Aluno.updateOne({ _id: aluno._id, jaVotou: true }, { $set: { jaVotou: false } }); throw error; }
    return res.status(201).json({ sucesso: true, mensagem: 'VOTO CONFIRMADO!' });
  } catch { return res.status(500).json({ erro: 'Não foi possível registrar o voto.' }); }
});

router.get('/resultados', async (req, res) => {
  try {
    const votos = await Voto.aggregate([
      { $group: { _id: { chapa: '$chapa', tipo: '$tipo' }, total: { $sum: 1 } } },
      { $lookup: { from: 'chapas', localField: '_id.chapa', foreignField: '_id', as: 'chapa' } },
      { $unwind: { path: '$chapa', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, numero: { $cond: [{ $eq: ['$_id.tipo', 'branco'] }, 'BRANCO', '$chapa.numero'] }, nome: { $cond: [{ $eq: ['$_id.tipo', 'branco'] }, 'Votos em branco', '$chapa.nome'] }, total: 1 } },
      { $sort: { numero: 1 } }
    ]);
    return res.json(votos);
  } catch { return res.status(500).json({ erro: 'Erro ao buscar os resultados.' }); }
});

router.post('/cadastrar-matriculas', async (req, res) => {
  if (!adminAutorizado(req, res)) return;
  const lista = String(req.body.listaMatriculas || '').trim();
  if (!lista) return res.status(400).json({ erro: 'A lista de matrículas está vazia.' });
  const matriculas = [...new Set(lista.split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean))];
  try {
    const resultado = await Aluno.bulkWrite(matriculas.map((matricula) => ({ updateOne: { filter: { matricula }, update: { $setOnInsert: { matricula, jaVotou: false } }, upsert: true } })));
    return res.json({ sucesso: true, mensagem: `${resultado.upsertedCount} nova(s) matrícula(s) cadastrada(s).` });
  } catch { return res.status(500).json({ erro: 'Erro ao cadastrar matrículas.' }); }
});

router.post('/cadastrar-chapa', async (req, res) => {
  if (!adminAutorizado(req, res)) return;
  const numero = String(req.body.numero || '').trim();
  const nome = String(req.body.nomeChapa || req.body.nome || '').trim();
  const descricao = String(req.body.descricao || '').trim();
  if (!numero || !nome) return res.status(400).json({ erro: 'Número e nome da chapa são obrigatórios.' });
  try { return res.status(201).json({ sucesso: true, chapa: await Chapa.create({ numero, nome, descricao }) }); }
  catch (error) { return res.status(400).json({ erro: error.code === 11000 ? 'Já existe uma chapa com este número.' : 'Erro ao cadastrar a chapa.' }); }
});

module.exports = router;
