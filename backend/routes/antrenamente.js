const express = require('express');
const router = express.Router();
const antrenamenteController = require('../controllers/antrenamenteController');
const autentificareToken = require('../middleware/autentificareToken');

router.use(autentificareToken);
router.post('/', antrenamenteController.creareAntrenament);
router.get('/', antrenamenteController.getAntrenamente);
router.get('/:id', antrenamenteController.getAntrenament);
router.put('/:id', antrenamenteController.actualizareAntrenament);
router.delete('/:id', antrenamenteController.stergereAntrenament);

module.exports = router; 