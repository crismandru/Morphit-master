const mongoose = require('mongoose');

const meseAnterioareSchema = new mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  data: {
    type: String,
    required: true
  },
  mese: [{
    nume: {
      type: String,
      required: true
    },
    tip: {
      type: String,
      enum: ['Mic dejun', 'Prânz', 'Cină', 'Gustare'],
      required: true
    },
    calorii: {
      type: Number,
      required: true
    },
    proteine: {
      type: Number,
      required: true
    },
    carbohidrati: {
      type: Number,
      required: true
    },
    grasimi: {
      type: Number,
      required: true
    },
    culoare: {
      type: String,
      required: true
    }
  }],
  obiective: {
    calorii: {
      type: Number,
      required: true
    },
    proteine: {
      type: Number,
      required: true
    },
    carbohidrati: {
      type: Number,
      required: true
    },
    grasimi: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MeseAnterioare', meseAnterioareSchema); 