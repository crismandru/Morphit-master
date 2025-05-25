const mongoose = require('mongoose');

const somnSchema = new mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  oraAdormire: {
    type: String,
    required: true
  },
  oraTrezire: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  detaliiCalitate: {
    adormire: {
      type: String,
      enum: ['rapid', 'normal', 'încet', 'foarte greu'],
      default: 'normal'
    },
    continuitate: {
      type: String,
      enum: ['continuu', 'câteva întreruperi', 'multe întreruperi', 'foarte fragmentat'],
      default: 'continuu'
    },
    odihnă: {
      type: String,
      enum: ['complet odihnit', 'moderat odihnit', 'puțin odihnit', 'deloc odihnit'],
      default: 'moderat odihnit'
    },
    visare: {
      type: String,
      enum: ['multe vise', 'câteva vise', 'puține vise', 'fără vise'],
      default: 'câteva vise'
    },
    stres: {
      type: String,
      enum: ['fără stres', 'puțin stres', 'moderat stres', 'mult stres'],
      default: 'puțin stres'
    }
  }
});

// Validare pentru a preveni sesiuni multiple în aceeași zi
somnSchema.pre('save', async function(next) {
  const data = new Date(this.data);
  data.setHours(0, 0, 0, 0);
  const dataUrmatoare = new Date(data);
  dataUrmatoare.setDate(dataUrmatoare.getDate() + 1);

  const sesiuneExistenta = await this.constructor.findOne({
    utilizator: this.utilizator,
    data: {
      $gte: data,
      $lt: dataUrmatoare
    }
  });

  if (sesiuneExistenta && !this.isModified('data')) {
    next(new Error('Există deja o sesiune de somn pentru această zi'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Somn', somnSchema); 