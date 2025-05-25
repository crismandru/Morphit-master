const multer = require('multer');
const path = require('path');

// Configurare storage pentru multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/exercitii/');
  },
  filename: function (req, file, cb) {
    // Generăm un nume unic pentru fișier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtru pentru a accepta doar imagini
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Doar fișierele de tip imagine sunt acceptate!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limita de 5MB
  }
});

module.exports = upload; 