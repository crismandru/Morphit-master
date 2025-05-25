const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); 
const { uploadsDir, photosDir, albumsDir } = require('./config/paths');
const exercitiiDir = path.join(uploadsDir, 'exercitii');

const app = express(); 

// Connect Database
console.log('Se încearcă conectarea la MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectat la MongoDB'))
  .catch((err) => {
    console.error('Eroare la conectare la MongoDB:', err);
    process.exit(1);
  });

// Init Middleware
app.use(express.json());
app.use(cors());

// Creează directoarele necesare dacă nu există
console.log('Calea directorului uploads:', uploadsDir);
console.log('Calea directorului photos:', photosDir);
console.log('Calea directorului albums:', albumsDir);
console.log('Calea directorului exercitii:', exercitiiDir);

[uploadsDir, photosDir, albumsDir, exercitiiDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creare director ${dir.split('/').pop()}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Servire fișiere statice din directorul uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware pentru logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error('Eroare globală:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    mesaj: err.message || 'Eroare internă a serverului',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

const autentificareRoutes = require('./routes/autentificare');
app.use('/autentificare', autentificareRoutes);

const detaliiRoutes = require('./routes/detaliiPersonale');
app.use('/detalii', detaliiRoutes);

const jurnalRoutes = require('./routes/jurnalRoutes');
app.use('/jurnal', jurnalRoutes);

const somnRoutes = require('./routes/somnRoutes');
app.use('/somn', somnRoutes);

const pozaRoutes = require('./routes/pozaRoutes');
app.use('/poze', pozaRoutes);

const albumeRoutes = require('./routes/albume');
app.use('/albume', albumeRoutes);

const alimentatieRoutes = require('./routes/alimentatie');
app.use('/alimentatie', alimentatieRoutes);

const exercitiiRoutes = require('./routes/exercitii');
app.use('/exercitii', exercitiiRoutes);

const calculatorRoutes = require('./routes/calculator');
app.use('/calculator', calculatorRoutes);

const antrenamenteRoutes = require('./routes/antrenamente');
app.use('/api/antrenamente', antrenamenteRoutes);

const PORT = process.env.PORT || 5000;
const HOST = '172.20.10.3';
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
  console.log(`URL pentru acces: http://${HOST}:${PORT}`);
  console.log(`Directorul pentru fișiere statice: ${uploadsDir}`);
});