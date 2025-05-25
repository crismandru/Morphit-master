const express = require('express');
const router = express.Router();
const detaliiController = require('../controllers/detaliiPersonaleController');
const autentificareToken = require('../middleware/autentificareToken');

router.post('/adauga', autentificareToken, detaliiController.creareDetalii);
router.put('/actualizeaza', autentificareToken, detaliiController.editeazaDetalii);
router.get('/obtine', autentificareToken, detaliiController.obtineDetalii);

module.exports = router;