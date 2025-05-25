const mongoose = require('mongoose');

const detaliiPersonaleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nume: String,
  prenume: String,
  dataNasterii: String,
  gen: String,
  inaltime: Number,
  greutate: Number
});

module.exports = mongoose.model('DetaliiPersonale', detaliiPersonaleSchema);