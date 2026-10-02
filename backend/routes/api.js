const express = require('express');
const Aluno = require('../models/Aluno');
const Chapa = require('../models/Chapa');
const Voto = require('../models/Voto');
const router = express.Router();
const jwt = require('jsonwebtoken');

const TEMPO_RESERVA_MS = 5 * 60 * 1000;

function adminAutorizado(req, res) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    res.status(401).json({
      erro: 'Administrador não autenticado.'
    });

    return false;
  }

  const token = autorizacao.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.tipo !== 'administrador') {
      res.status(401).json({
        erro: 'Acesso administrativo inválido.'
      });

      return false;
    }

    return true;
  } catch {
    res.status(401).json({
      erro: 'Sessão do administrador inválida ou expirada.'
    });

    return false;
  }
}


/* =========================================================
   LOGIN DO ADMINISTRADOR
========================================================= */

router.post('/admin/login', (req, res) => {
  const senha = String(req.body.senha || '');

  if (
    !process.env.ADMIN_PASSWORD ||
    senha !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      erro: 'Senha de administrador inválida.'
    });
  }

  const token = jwt.sign(
    {
      tipo: 'administrador'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2h'
    }
  );

  return res.json({
    sucesso: true,
    token
  });
});


/* =========================================================
   VALIDAR MATRÍCULA E RESERVAR A URNA
========================================================= */

router.post('/alunos/validar', async (req, res) => {
  const matricula = String(
    req.body.matricula || ''
  ).trim();

  if (!matricula) {
    return res.status(400).json({
      erro: 'Informe a matrícula.'
    });
  }

  try {
    const agora = new Date();

    const reservaAte = new Date(
      agora.getTime() + TEMPO_RESERVA_MS
    );

    /*
      A matrícula só pode ser reservada se:

      - ainda não votou
      - e não estiver reservada por outra urna

      Caso a reserva antiga tenha expirado,
      ela pode ser reutilizada.
    */

    const aluno = await Aluno.findOneAndUpdate(
      {
        matricula,
        jaVotou: false,
        $or: [
          {
            emVotacao: false
          },
          {
            emVotacao: {
              $exists: false
            }
          },
          {
            reservaAte: {
              $lte: agora
            }
          }
        ]
      },
      {
        $set: {
          emVotacao: true,
          reservaAte
        }
      },
      {
        new: true
      }
    ).select('nome jaVotou emVotacao reservaAte');

    /*
      Se não conseguiu reservar, precisamos descobrir
      se a matrícula não existe, já votou ou está em outra urna.
    */

    if (!aluno) {
      const alunoExistente = await Aluno.findOne({
        matricula
      }).select('jaVotou emVotacao');

      if (!alunoExistente) {
        return res.status(404).json({
          erro: 'Matrícula não cadastrada.'
        });
      }

      if (alunoExistente.jaVotou) {
        return res.status(403).json({
          erro: 'Esta matrícula já registrou um voto.'
        });
      }

      return res.status(409).json({
        erro: 'Esta matrícula já está em processo de votação em outra urna.'
      });
    }

    /*
      Já aproveitamos esta requisição para buscar as chapas.
      Isso elimina uma segunda chamada ao backend.
    */

    const chapas = await Chapa.find()
      .select('numero nome descricao')
      .sort({ numero: 1 });

    return res.json({
      sucesso: true,

      aluno: {
        nome: aluno.nome
      },

      chapas,

      reservaAte: aluno.reservaAte
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro ao validar a matrícula.'
    });
  }
});


/* =========================================================
   CHAPAS
========================================================= */

router.get('/chapas', async (req, res) => {
  try {
    const chapas = await Chapa.find()
      .select('numero nome descricao')
      .sort({ numero: 1 });

    return res.json(chapas);

  } catch {
    return res.status(500).json({
      erro: 'Erro ao buscar as chapas.'
    });
  }
});

/* =========================================================
   REGISTRAR VOTO
========================================================= */

router.post('/votos', async (req, res) => {
  const votoBranco =
    req.body.tipo === 'branco';

  const numeroChapa = String(
    req.body.numeroChapa || ''
  ).trim();

  if (
    !votoBranco &&
    !numeroChapa
  ) {
    return res.status(400).json({
      erro: 'Escolha uma chapa ou vote em branco.'
    });
  }

  try {

    const chapa = votoBranco
      ? null
      : await Chapa.findOne({
          numero: numeroChapa
        });

    if (!votoBranco && !chapa) {
      return res.status(404).json({
        erro: 'Número de chapa não encontrado.'
      });
    }

    await Voto.create({
      chapa: chapa
        ? chapa._id
        : null,

      tipo: votoBranco
        ? 'branco'
        : 'chapa'
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: 'VOTO CONFIRMADO!'
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: 'Não foi possível registrar o voto.'
    });
  }
});



/* =========================================================
   LISTA DE ESTUDANTES — ADMIN
========================================================= */

router.post('/alunos', async (req, res) => {
  if (!adminAutorizado(req, res)) return;

  try {
    const alunos = await Aluno.find(
      {},
      {
        _id: 0,
        matricula: 1,
        nome: 1,
        jaVotou: 1
      }
    ).sort({
      matricula: 1
    });

    return res.json(alunos);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Não foi possível carregar os estudantes.'
    });
  }
});


/* =========================================================
   RESULTADOS — ADMIN
========================================================= */

router.post('/resultados', async (req, res) => {
  if (!adminAutorizado(req, res)) return;

  try {
    const votos = await Voto.aggregate([
      {
        $group: {
          _id: {
            chapa: '$chapa',
            tipo: '$tipo'
          },

          total: {
            $sum: 1
          }
        }
      },

      {
        $lookup: {
          from: 'chapas',
          localField: '_id.chapa',
          foreignField: '_id',
          as: 'chapa'
        }
      },

      {
        $unwind: {
          path: '$chapa',
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $project: {
          _id: 0,

          numero: {
            $cond: [
              {
                $eq: [
                  '$_id.tipo',
                  'branco'
                ]
              },

              'BRANCO',

              '$chapa.numero'
            ]
          },

          nome: {
            $cond: [
              {
                $eq: [
                  '$_id.tipo',
                  'branco'
                ]
              },

              'Votos em branco',

              '$chapa.nome'
            ]
          },

          total: 1
        }
      },

      {
        $sort: {
          numero: 1
        }
      }
    ]);

    return res.json(votos);

  } catch {
    return res.status(500).json({
      erro: 'Erro ao buscar os resultados.'
    });
  }
});


/* =========================================================
   CADASTRAR ESTUDANTES — ADMIN
========================================================= */

router.post(
  '/cadastrar-matriculas',
  async (req, res) => {

    if (!adminAutorizado(req, res)) return;

    try {
      const listaAlunos =
        Array.isArray(req.body.alunos)
          ? req.body.alunos
          : [];

      if (!listaAlunos.length) {
        return res.status(400).json({
          erro: 'Nenhum estudante informado.'
        });
      }

      const alunosParaCadastrar = [];

      for (const aluno of listaAlunos) {

        const matricula = String(
          aluno.matricula || ''
        ).trim();

        const nome = String(
          aluno.nome || ''
        ).trim();

        if (!matricula || !nome) {
          continue;
        }

        alunosParaCadastrar.push({
          matricula,
          nome
        });
      }

      if (!alunosParaCadastrar.length) {
        return res.status(400).json({
          erro: 'Informe matrícula e nome para os estudantes.'
        });
      }

      let cadastrados = 0;
      let existentes = 0;

      for (const aluno of alunosParaCadastrar) {

        const existente =
          await Aluno.findOne({
            matricula: aluno.matricula
          });

        if (existente) {

          existentes++;

          /*
            Atualiza somente o nome.

            NÃO altera:
            - jaVotou
            - emVotacao
            - reservaAte
          */

          existente.nome = aluno.nome;

          await existente.save();

        } else {

          await Aluno.create({
            matricula: aluno.matricula,
            nome: aluno.nome,
            jaVotou: false,
            emVotacao: false,
            reservaAte: null
          });

          cadastrados++;
        }
      }

      return res.json({
        sucesso: true,

        mensagem:
          `${cadastrados} estudante(s) cadastrado(s). ` +
          `${existentes} estudante(s) já existiam e tiveram o nome atualizado.`
      });

    } catch (erro) {

      console.error(erro);

      return res.status(500).json({
        erro: 'Não foi possível cadastrar os estudantes.'
      });
    }
  }
);


/* =========================================================
   CADASTRAR CHAPA — ADMIN
========================================================= */

router.post(
  '/cadastrar-chapa',
  async (req, res) => {

    if (!adminAutorizado(req, res)) return;

    const numero = String(
      req.body.numero || ''
    ).trim();

    const nome = String(
      req.body.nomeChapa ||
      req.body.nome ||
      ''
    ).trim();

    const descricao = String(
      req.body.descricao || ''
    ).trim();

    if (!numero || !nome) {
      return res.status(400).json({
        erro: 'Número e nome da chapa são obrigatórios.'
      });
    }

    try {

      const chapa = await Chapa.create({
        numero,
        nome,
        descricao
      });

      return res.status(201).json({
        sucesso: true,
        chapa
      });

    } catch (error) {

      return res.status(400).json({
        erro:
          error.code === 11000
            ? 'Já existe uma chapa com este número.'
            : 'Erro ao cadastrar a chapa.'
      });
    }
  }
);


/* =========================================================
   LIMPAR BANCO — ADMIN
========================================================= */

router.post(
  '/admin/limpar-tudo',
  async (req, res) => {

    if (!adminAutorizado(req, res)) return;

    const senhaReset = String(
      req.body.senhaReset || ''
    );

    if (
      !process.env.RESET_PASSWORD ||
      senhaReset !== process.env.RESET_PASSWORD
    ) {
      return res.status(401).json({
        erro: 'Senha de limpeza inválida.'
      });
    }

    try {

      await Promise.all([
        Aluno.deleteMany({}),
        Chapa.deleteMany({}),
        Voto.deleteMany({})
      ]);

      return res.json({
        sucesso: true,
        mensagem: 'Banco de dados limpo com sucesso.'
      });

    } catch {

      return res.status(500).json({
        erro: 'Não foi possível limpar o banco de dados.'
      });
    }
  }
);


module.exports = router;