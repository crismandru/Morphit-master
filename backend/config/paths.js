const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const photosDir = path.join(uploadsDir, 'photos');
const albumsDir = path.join(uploadsDir, 'albums');
 
module.exports = {
    uploadsDir,
    photosDir,
    albumsDir
}; 