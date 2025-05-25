const express = require('express');
const router = express.Router();
const antrenamenteController = require('../controllers/antrenamenteController');
const autentificareToken = require('../middleware/autentificareToken');

// Toate rutele necesită autentificare
router.use(autentificareToken);

// Creare antrenament nou
router.post('/', antrenamenteController.creareAntrenament);

// Obține toate antrenamentele utilizatorului
router.get('/', antrenamenteController.getAntrenamente);

// Obține un antrenament specific
router.get('/:id', antrenamenteController.getAntrenament);

// Actualizare antrenament
router.put('/:id', antrenamenteController.actualizareAntrenament);

// Ștergere antrenament
router.delete('/:id', antrenamenteController.stergereAntrenament);

module.exports = router; 