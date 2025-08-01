const Somn = require('../models/Somn');

exports.obtineInregistrari = async (req, res) => {
  try {
    const inregistrari = await Somn.find({ utilizator: req.user.id })
      .sort({ data: -1 });
    res.json(inregistrari);
  } catch (error) {
    console.error('Eroare la obținerea înregistrărilor:', error);
    res.status(500).json({ mesaj: 'Eroare la obținerea înregistrărilor' });
  }
};

exports.adaugaInregistrare = async (req, res) => {
  try {
    const { oraAdormire, oraTrezire, rating, detaliiCalitate, data } = req.body;
    if (!rating) {
      return res.status(400).json({ mesaj: 'Rating-ul este obligatoriu' });
    }
    if (!oraAdormire || !oraTrezire) {
      return res.status(400).json({ mesaj: 'Orele de adormire și trezire sunt obligatorii' });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ mesaj: 'Utilizator neautentificat' });
    }
    const dataSesiune = data ? new Date(data) : new Date();
    const dataInceput = new Date(dataSesiune);
    dataInceput.setHours(0, 0, 0, 0);
    const dataUrmatoare = new Date(dataInceput);
    dataUrmatoare.setDate(dataUrmatoare.getDate() + 1);
    const sesiuneExistenta = await Somn.findOne({
      utilizator: req.user.id,
      data: {
        $gte: dataInceput,
        $lt: dataUrmatoare
      }
    });
    if (sesiuneExistenta) {
      return res.status(400).json({ 
        mesaj: 'Nu poți adăuga mai multe sesiuni de somn în aceeași zi',
        cod: 'SESIUNE_EXISTENTA'
      });
    }
    const inregistrareNoua = new Somn({
      utilizator: req.user.id,
      data: dataSesiune,
      oraAdormire,
      oraTrezire,
      rating,
      detaliiCalitate
    });
    try {
      await inregistrareNoua.save();
      res.status(201).json(inregistrareNoua);
    } catch (saveError) {
      console.error('Eroare la salvarea înregistrării:', saveError);
      res.status(500).json({ 
        mesaj: 'Eroare la salvarea înregistrării',
        detalii: saveError.message,
        stack: saveError.stack
      });
    }
  } catch (error) {
    console.error('Eroare detaliată la adăugarea înregistrării:', error);
    res.status(500).json({ 
      mesaj: 'Eroare la adăugarea înregistrării',
      detalii: error.message,
      stack: error.stack
    });
  }
};

exports.stergeInregistrare = async (req, res) => {
  try {
    const inregistrare = await Somn.findById(req.params.id);
    if (!inregistrare) {
      return res.status(404).json({ mesaj: 'Înregistrarea nu a fost găsită' });
    }
    if (inregistrare.utilizator.toString() !== req.user.id) {
      return res.status(401).json({ mesaj: 'Nu aveți permisiunea de a șterge această înregistrare' });
    }
    await Somn.findByIdAndDelete(req.params.id);
    res.json({ mesaj: 'Înregistrarea a fost ștearsă' });
  } catch (error) {
    console.error('Eroare la ștergerea înregistrării:', error);
    res.status(500).json({ mesaj: 'Eroare la ștergerea înregistrării' });
  }
};

exports.actualizeazaInregistrare = async (req, res) => {
  try {
    const { 
      oraAdormire, 
      oraTrezire, 
      rating, 
      detaliiCalitate
    } = req.body;
    const inregistrare = await Somn.findById(req.params.id);
    if (!inregistrare) {
      return res.status(404).json({ mesaj: 'Înregistrarea nu a fost găsită' });
    }
    if (inregistrare.utilizator.toString() !== req.user.id) {
      return res.status(401).json({ mesaj: 'Nu aveți permisiunea de a actualiza această înregistrare' });
    }
    inregistrare.oraAdormire = oraAdormire || inregistrare.oraAdormire;
    inregistrare.oraTrezire = oraTrezire || inregistrare.oraTrezire;
    inregistrare.rating = rating || inregistrare.rating;
    inregistrare.detaliiCalitate = detaliiCalitate || inregistrare.detaliiCalitate;
    await inregistrare.save();
    res.json(inregistrare);
  } catch (error) {
    console.error('Eroare la actualizarea înregistrării:', error);
    res.status(500).json({ mesaj: 'Eroare la actualizarea înregistrării' });
  }
}; 