const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Poza = require('../models/Poza');
const Album = require('../models/Album');
const autentificareToken = require('../middleware/autentificareToken');
const { uploadsDir, photosDir, albumsDir } = require('../config/paths');

console.log('Calea directorului uploads:', uploadsDir);
console.log('Calea directorului photos:', photosDir);

// Asigură existența directoarelor
[uploadsDir, photosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Salvare fișier în:', photosDir);
    cb(null, photosDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Nume fișier generat:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Doar fișierele de tip imagine sunt permise!'), false);
    }
    cb(null, true);
  }
});

router.get('/', autentificareToken, async (req, res) => {
  try {
    const poze = await Poza.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(poze);
  } catch (error) {
    console.error('Eroare la obținerea pozelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea pozelor' });
  }
});

router.post('/', autentificareToken, upload.single('photo'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Nu s-a încărcat nicio poză' });
    }

    const { width, height } = req.body;
    if (!width || !height) {
      return res.status(400).json({ message: 'Lățimea și înălțimea sunt obligatorii' });
    }

    const filePath = path.join(photosDir, req.file.filename);
    console.log('Verificare fișier la:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error('Fișierul nu există la calea:', filePath);
      return res.status(500).json({ message: 'Eroare la salvarea fișierului' });
    }

    const poza = new Poza({
      user: req.user.id,
      url: `/uploads/photos/${req.file.filename}`,
      width: parseInt(width),
      height: parseInt(height)
    });

    await poza.save();
    console.log('Poză salvată:', poza);
    res.status(201).json(poza);
  } catch (error) {
    console.error('Eroare la încărcarea pozei:', error);
    res.status(500).json({ message: 'Eroare la încărcarea pozei' });
  }
});

router.delete('/:id', autentificareToken, async (req, res) => {
  try {
    console.log('Încercare ștergere poză:', req.params.id);
    const poza = await Poza.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!poza) {
      console.log('Poza nu a fost găsită');
      return res.status(404).json({ message: 'Poza nu a fost găsită' });
    }

    await Album.updateMany(
      { photos: poza._id },
      { $pull: { photos: poza._id } }
    );

    const photoPath = path.join(__dirname, '../..', poza.url);
    console.log('Cale fișier pentru ștergere:', photoPath);
    
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
      console.log('Fișier șters');
    } else {
      console.log('Fișierul nu există');
    }

    await Poza.deleteOne({ _id: poza._id });
    console.log('Poza ștearsă din baza de date');
    
    res.json({ message: 'Poza ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea pozei:', error);
    res.status(500).json({ message: 'Eroare la ștergerea pozei' });
  }
});

module.exports = router; 