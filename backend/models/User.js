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
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);
      },
      message: 'Parola trebuie să aibă minim 8 caractere, o literă mare și o cifră!'
    }
  }
});

module.exports = mongoose.model('User', userSchema);


