const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Aluno',
  new mongoose.Schema(
    {
      matricula: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },

      nome: {
        type: String,
        trim: true,
        default: ''
      },

      jaVotou: {
        type: Boolean,
        default: false
      },

      // Indica que o aluno já entrou em uma urna
      // e está no processo de votação.
      emVotacao: {
        type: Boolean,
        default: false
      },

      // Horário até o qual a reserva da urna é válida.
      reservaAte: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  )
);