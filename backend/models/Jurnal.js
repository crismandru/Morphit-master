const mongoose = require('mongoose');

const jurnalSchema = new mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  data: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Data trebuie să fie o dată validă'
    }
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