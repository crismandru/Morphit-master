const express = require('express');
const router = express.Router();
const autentificareToken = require('../middleware/autentificareToken');

router.post('/calculeaza', autentificareToken, async (req, res) => {
  try {
    const { greutate, inaltime, varsta, gen, activitate, obiectiv } = req.body;

    // Calculăm BMR (Basal Metabolic Rate) folosind formula Mifflin-St Jeor
    let bmr;
    if (gen === 'male') {
      bmr = 10 * greutate + 6.25 * inaltime - 5 * varsta + 5;
    } else {
      bmr = 10 * greutate + 6.25 * inaltime - 5 * varsta - 161;
    }

    // Calculăm TDEE (Total Daily Energy Expenditure)
    let tdee = bmr * activitate;

    switch (obiectiv) {
      case 'slabire':
        tdee -= 500;
        break;
      case 'masa':
        tdee += 500;
        break;
    }

    const proteine = Math.round(greutate * 2);
    const grasimi = Math.round((tdee * 0.25) / 9); 
    const carbohidrati = Math.round((tdee - (proteine * 4) - (grasimi * 9)) / 4); 

    res.json({
      calorii: Math.round(tdee),
      proteine,
      carbohidrati,
      grasimi
    });
  } catch (error) {
    console.error('Eroare la calcularea caloriilor:', error);
    res.status(500).json({ mesaj: 'Eroare la calcularea caloriilor' });
  }
});

router.get('/rezultate', autentificareToken, async (req, res) => {
  try {
    res.json({ mesaj: 'Funcționalitate în dezvoltare' });
  } catch (error) {
    console.error('Eroare la obținerea rezultatelor:', error);
    res.status(500).json({ mesaj: 'Eroare la obținerea rezultatelor' });
  }
});

module.exports = router; 