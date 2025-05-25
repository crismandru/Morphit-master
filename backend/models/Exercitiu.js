const mongoose = require('mongoose');

const exercitiuSchema = new mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: false
  },
  nume: {
    type: String,
    required: true,
    trim: true
  },
  descriere: {
    type: String,
    required: true,
    trim: true
  },
  muschiAntrenati: {
    type: String,
    required: true,
    trim: true
  },
  echipament: {
    type: String,
    required: true,
    trim: true
  },
  video: {
    type: String,
    trim: true
  },
  animatie: {
    type: String,
    trim: true
  },
  imagine: {
    type: String,
    trim: true
  },
  grupaMusculara: {
    type: String,
    required: true,
    enum: [
      'Abdomen', 'Umeri', 'Piept', 'Biceps', 'Antebrațe', 
      'Cvadriceps', 'Trapez', 'Triceps', 'Spate', 'Fesieri', 
      'Femural', 'Gambe', 'Cardio'
    ]
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexuri pentru căutări rapide
exercitiuSchema.index({ grupaMusculara: 1 });
exercitiuSchema.index({ nume: 1 });

const Exercitiu = mongoose.model('Exercitiu', exercitiuSchema);

module.exports = Exercitiu; 