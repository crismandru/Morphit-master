// Servire fișiere statice din directorul uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 