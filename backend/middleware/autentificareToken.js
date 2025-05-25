const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ mesaj: 'Nu există token, autorizare refuzată' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Găsim utilizatorul în baza de date
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ mesaj: 'Utilizatorul nu a fost găsit' });
    }

    // Setăm utilizatorul în request
    req.user = user;
    console.log('Utilizator autentificat:', { id: user._id });
    
    next();
  } catch (err) {
    console.error('Eroare la verificarea token-ului:', err.message);
    res.status(401).json({ mesaj: 'Token invalid' });
  }
};