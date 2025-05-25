const express = require('express');
const router = express.Router();
const alimentatieController = require('../controllers/alimentatieController');
const autentificareToken = require('../middleware/autentificareToken');

router.get('/mese/:data', autentificareToken, alimentatieController.obtineMese);
router.post('/mese/:data', autentificareToken, alimentatieController.adaugaMasa);
router.delete('/mese/:idMasa', autentificareToken, alimentatieController.stergeMasa);
router.delete('/mese/data/:data', autentificareToken, alimentatieController.stergeMeseDupaData);
router.put('/obiective/:data', autentificareToken, alimentatieController.actualizeazaObiective);
router.get('/istoric', autentificareToken, alimentatieController.obtineIstoric);
router.get('/obiective/:data', autentificareToken, alimentatieController.obtineObiective);
router.post('/obiective/:data', autentificareToken, alimentatieController.salveazaObiective);

module.exports = router; 