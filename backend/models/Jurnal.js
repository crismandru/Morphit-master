const mongoose = require('mongoose');

const jurnalSchema = new mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  titlu: {
    type: String,
    required: true
  },
  continut: {
    type: String,
    required: true
  },
  stare: {
    type: String,
    enum: ['fericit', 'trist', 'neutru'],
    default: 'neutru'
  }
});

module.exports = mongoose.model('Jurnal', jurnalSchema); 