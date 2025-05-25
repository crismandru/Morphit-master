const express = require('express');
const router = express.Router();
const somnController = require('../controllers/somnController');
const auth = require('../middleware/autentificareToken');

router.use(auth);
router.get('/', somnController.obtineInregistrari);
router.post('/', somnController.adaugaInregistrare);
router.delete('/:id', somnController.stergeInregistrare);
router.put('/:id', somnController.actualizeazaInregistrare);

module.exports = router; 