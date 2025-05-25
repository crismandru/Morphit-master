const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const Poza = require('../models/Poza');
const autentificareToken = require('../middleware/autentificareToken');
const path = require('path');
const fs = require('fs');
const { uploadsDir, photosDir, albumsDir } = require('../config/paths');

// Eliminăm crearea redundantă a directoarelor deoarece sunt create în index.js

// Obține toate albumele utilizatorului
router.get('/', autentificareToken, async (req, res) => {
  try {
    const albums = await Album.find({ user: req.user.id })
      .populate('photos')
      .sort({ createdAt: -1 });
    res.json(albums);
  } catch (error) {
    console.error('Eroare la obținerea albumelor:', error);
    res.status(500).json({ message: 'Eroare la obținerea albumelor' });
  }
});

// Creează un album nou
router.post('/', autentificareToken, async (req, res) => {
  try {
    const { name } = req.body;
    const album = new Album({
      name,
      user: req.user.id
    });
    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.error('Eroare la crearea albumului:', error);
    res.status(500).json({ message: 'Eroare la crearea albumului' });
  }
});

// Obține un album specific
router.get('/:id', autentificareToken, async (req, res) => {
  try {
    const album = await Album.findOne({ _id: req.params.id, user: req.user.id })
      .populate('photos');
    if (!album) {
      return res.status(404).json({ message: 'Albumul nu a fost găsit' });
    }
    res.json(album);
  } catch (error) {
    console.error('Eroare la obținerea albumului:', error);
    res.status(500).json({ message: 'Eroare la obținerea albumului' });
  }
});

// Adaugă poze în album
router.post('/:id/photos', autentificareToken, async (req, res) => {
  try {
    const { photoIds } = req.body;
    const album = await Album.findOne({ _id: req.params.id, user: req.user.id });
    if (!album) {
      return res.status(404).json({ message: 'Albumul nu a fost găsit' });
    }

    // Verifică dacă pozele aparțin utilizatorului
    const photos = await Poza.find({
      _id: { $in: photoIds },
      user: req.user.id
    });

    if (photos.length !== photoIds.length) {
      return res.status(400).json({ message: 'Unele poze nu au fost găsite sau nu aparțin utilizatorului' });
    }

    // Adaugă pozele în album
    album.photos = [...album.photos, ...photoIds];
    if (!album.coverPhoto && photos.length > 0) {
      album.coverPhoto = photos[0].url;
    }

    await album.save();
    res.json(album);
  } catch (error) {
    console.error('Eroare la adăugarea pozelor:', error);
    res.status(500).json({ message: 'Eroare la adăugarea pozelor' });
  }
});

// Șterge o poză din album
router.delete('/:albumId/photos/:photoId', autentificareToken, async (req, res) => {
  try {
    const album = await Album.findOne({ _id: req.params.albumId, user: req.user.id });
    if (!album) {
      return res.status(404).json({ message: 'Albumul nu a fost găsit' });
    }

    album.photos = album.photos.filter(id => id.toString() !== req.params.photoId);
    if (album.coverPhoto && album.photos.length > 0) {
      const firstPhoto = await Poza.findById(album.photos[0]);
      album.coverPhoto = firstPhoto.url;
    } else {
      album.coverPhoto = null;
    }

    await album.save();
    res.json(album);
  } catch (error) {
    console.error('Eroare la ștergerea pozei din album:', error);
    res.status(500).json({ message: 'Eroare la ștergerea pozei din album' });
  }
});

// Setează poza de copertă
router.put('/:id/cover', autentificareToken, async (req, res) => {
  try {
    const { photoId } = req.body;
    const album = await Album.findOne({ _id: req.params.id, user: req.user.id });
    if (!album) {
      return res.status(404).json({ message: 'Albumul nu a fost găsit' });
    }

    const photo = await Poza.findOne({ _id: photoId, user: req.user.id });
    if (!photo) {
      return res.status(404).json({ message: 'Poza nu a fost găsită' });
    }

    if (!album.photos.includes(photoId)) {
      return res.status(400).json({ message: 'Poza nu face parte din album' });
    }

    album.coverPhoto = photo.url;
    await album.save();
    res.json(album);
  } catch (error) {
    console.error('Eroare la setarea pozei de copertă:', error);
    res.status(500).json({ message: 'Eroare la setarea pozei de copertă' });
  }
});

// Șterge un album
router.delete('/:id', autentificareToken, async (req, res) => {
  try {
    const album = await Album.findOne({ _id: req.params.id, user: req.user.id });
    if (!album) {
      return res.status(404).json({ message: 'Albumul nu a fost găsit' });
    }

    await Album.deleteOne({ _id: album._id });
    res.json({ message: 'Album șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea albumului:', error);
    res.status(500).json({ message: 'Eroare la ștergerea albumului' });
  }
});

module.exports = router; 