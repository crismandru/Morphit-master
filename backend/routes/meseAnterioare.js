const express = require('express');
const router = express.Router();
const meseAnterioareController = require('../controllers/meseAnterioareController');
const autentificareToken = require('../middleware/autentificareToken');

router.post('/', autentificareToken, meseAnterioareController.salveazaMese);
router.put('/:id', autentificareToken, meseAnterioareController.actualizeazaMese);
router.get('/', autentificareToken, meseAnterioareController.obtineMese);
router.delete('/:id', autentificareToken, meseAnterioareController.stergeZi);

module.exports = router; 