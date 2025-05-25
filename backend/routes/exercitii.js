const express = require('express');
const router = express.Router();
const exercitiiController = require('../controllers/exercitiiController');
const autentificareToken = require('../middleware/autentificareToken');
const upload = require('../middleware/upload');

router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

router.use(autentificareToken);

router.get('/verifica/:nume', (req, res, next) => {
  console.log('Procesez ruta /verifica/:nume pentru:', req.params.nume);
  exercitiiController.verificaExercitiu(req, res, next);
});

router.get('/grupa/:grupa', exercitiiController.getExercitiiGrupa);

router.post('/', exercitiiController.adaugaExercitiu);
router.get('/', exercitiiController.getExercitii);
router.get('/:nume', exercitiiController.getExercitiu);
router.put('/:nume', exercitiiController.actualizeazaExercitiu);
router.delete('/:nume', exercitiiController.stergeExercitiu);

// Ruta pentru încărcarea imaginii unui exercițiu
router.post('/:nume/imagine', upload.single('imagine'), exercitiiController.incarcaImagine);

module.exports = router; 