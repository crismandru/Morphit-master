**Morphit** - Aplicație Mobilă pentru gestiunea progresului fitness

Această aplicație a fost dezvoltată ca lucrare de licență în cadrul facultății CSIE, ASE București.

**Morphit** este o aplicație mobilă pentru tracking-ul fitness-ului, dezvoltată cu React Native și Node.js. Oferă o soluție integrată pentru gestionarea antrenamentelor, alimentației, pozelor, somnului și progresului personal.

## Funcționalități

Aplicația include tracking complet pentru antrenamente cu 12 grupe musculare organizate logic, monitorizare alimentație cu calculare TDEE, analiză somn, jurnal personal și statistici avansate cu grafice interactive. Include și o galerie foto pentru progres vizual și un calculator nutrițional personalizat.

## Tehnologii

**Frontend**: React Native 0.76.7, Expo SDK 52, React Navigation 7, React Native Chart Kit, Expo Image Picker, AsyncStorage, Axios.

**Backend**: Express.js 4.21.2, MongoDB + Mongoose 8.14.0, JWT pentru autentificare, bcrypt pentru criptare, Multer pentru upload fișiere, CORS.

**Arhitectură**: RESTful API cu autentificare JWT, arhitectură MVC, middleware securizat, sistem upload pentru imagini.

## Instalare

**Backend**: `cd backend && npm install && node index.js`

**Frontend**: `cd frontend && npm install && npx expo start`

**Cerințe**: Node.js 16+, MongoDB, Expo CLI, Android Studio/Xcode.

## Securitate

Autentificare JWT cu refresh tokens, criptare parole cu bcrypt, validare input pe frontend și backend, middleware de securitate pentru rute protejate. 
