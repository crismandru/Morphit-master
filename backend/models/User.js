const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nrTelefon: {
    type: String,
    required: true,
    unique: true,
    validate: {
    validator: function(v) {
      return /^07\d{8}$/.test(v);
      },
    message: props => `${props.value} nu este un număr de telefon valid!`
    }
  },
  parola: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);