const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  console.log('Cerere primită pentru înregistrare:', req.body);
  const { nrTelefon, parola } = req.body;

  if (!nrTelefon || !parola) {
    return res.status(400).json({ mesaj: 'Toate câmpurile sunt obligatorii!' });
  }

  try {
    const userExist = await User.findOne({ nrTelefon });
    if (userExist) {
      return res.status(409).json({ mesaj: 'Număr de telefon deja folosit!' });
    }

    const salt = await bcrypt.genSalt(10);
    const parolaCriptata = await bcrypt.hash(parola, salt);

    const user = new User({
      nrTelefon,
      parola: parolaCriptata
    });

    await user.save();
    res.status(201).json({ mesaj: 'Utilizator creat cu succes!' });
  } catch (err) {
    console.error('Eroare la salvare în MongoDB:', err);
    res.status(500).json({ mesaj: 'Eroare de server' });
  }
};

exports.login = async (req, res) => {
  console.log('Date primite la login:', req.body);
  const { nrTelefon, parola } = req.body;

  try {
    const user = await User.findOne({ nrTelefon });
    if (!user) {
      return res.status(400).json({ mesaj: 'User inexistent!' });
    }

    if (!parola) {
      return res.status(400).json({ mesaj: 'Parola este obligatorie!' });
    }

    const parolaValida = await bcrypt.compare(parola, user.parola);
    if (!parolaValida) {
      return res.status(400).json({ mesaj: 'Parolă incorectă!' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error('Eroare la autentificare:', err);
    res.status(500).json({ mesaj: 'Eroare la autentificare!' });
  }
};