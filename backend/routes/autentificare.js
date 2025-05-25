const express = require('express');
const router = express.Router();
const autentificareController = require('../controllers/autentificareController');

router.post('/register', autentificareController.register);
router.post('/login', autentificareController.login);

module.exports = router;