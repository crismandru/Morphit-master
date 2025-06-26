const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const photosDir = path.join(uploadsDir, 'photos');
 
module.exports = {
    uploadsDir,
    photosDir
}; 