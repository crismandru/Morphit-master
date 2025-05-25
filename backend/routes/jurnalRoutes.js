const express = require('express');
const router = express.Router();
const jurnalController = require('../controllers/jurnalController');
const auth = require('../middleware/autentificareToken');

router.use(auth);
router.get('/', jurnalController.obtineNotite);
router.post('/', jurnalController.adaugaNotita);
router.delete('/:id', jurnalController.stergeNotita);
router.put('/:id', jurnalController.actualizeazaNotita);

module.exports = router; 