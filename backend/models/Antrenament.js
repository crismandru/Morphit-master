const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  repetari: {
    type: Number,
    required: true,
    min: 1
  },
  greutate: {
    type: Number,
    required: true,
    min: 0
  }
});

const exercitiuAntrenamentSchema = new mongoose.Schema({
  exercitiu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercitiu',
    required: true
  },
  numeExercitiu: {
    type: String,
    required: true
  },
  grupaDeMuschi: {
    type: String,
    required: true,
    enum: [
      'Abdomen', 'Umeri', 'Piept', 'Biceps', 'Antebrațe', 
      'Cvadriceps', 'Trapez', 'Triceps', 'Spate', 'Fesieri', 
      'Femural', 'Gambe'
    ]
  },
  seturi: [setSchema]
});

const antrenamentSchema = new mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  tip: {
    type: String,
    required: true,
    enum: ['Leg Day', 'Pull Day', 'Push Day', 'Personalizat'],
    trim: true
  },
  data: {
    type: Date,
    required: true,
    default: Date.now
  },
  timp: {
    type: Number,
    required: true,
    min: 1,
    comment: 'Timpul antrenamentului în minute'
  },
  exercitii: [exercitiuAntrenamentSchema]
}, {
  timestamps: true
});

// Indexuri pentru căutări rapide
antrenamentSchema.index({ utilizator: 1, data: -1 });
antrenamentSchema.index({ tip: 1 });

const Antrenament = mongoose.model('Antrenament', antrenamentSchema);

module.exports = Antrenament; 