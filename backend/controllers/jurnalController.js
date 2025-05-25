const Jurnal = require('../models/Jurnal');

exports.obtineNotite = async (req, res) => {
  try {
    const notite = await Jurnal.find({ utilizator: req.user.id })
      .sort({ data: -1 });
    res.json(notite);
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la obținerea notițelor' });
  }
};

exports.adaugaNotita = async (req, res) => {
  try {
    const { titlu, continut, stare } = req.body;
    const notitaNoua = new Jurnal({
      utilizator: req.user.id,
      titlu,
      continut,
      stare
    });
    await notitaNoua.save();
    res.status(201).json(notitaNoua);
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la adăugarea notiței' });
  }
};

exports.stergeNotita = async (req, res) => {
  try {
    const notita = await Jurnal.findById(req.params.id);
    if (!notita) {
      return res.status(404).json({ mesaj: 'Notița nu a fost găsită' });
    }
    if (notita.utilizator.toString() !== req.user.id) {
      return res.status(401).json({ mesaj: 'Nu aveți permisiunea de a șterge această notiță' });
    }
    await Jurnal.findByIdAndDelete(req.params.id);
    res.json({ mesaj: 'Notița a fost ștearsă' });
  } catch (error) {
    console.error('Eroare la ștergerea notiței:', error);
    res.status(500).json({ mesaj: 'Eroare la ștergerea notiței' });
  }
};

exports.actualizeazaNotita = async (req, res) => {
  try {
    const { titlu, continut, stare } = req.body;
    const notita = await Jurnal.findById(req.params.id);
    if (!notita) {
      return res.status(404).json({ mesaj: 'Notița nu a fost găsită' });
    }
    if (notita.utilizator.toString() !== req.user.id) {
      return res.status(401).json({ mesaj: 'Nu aveți permisiunea de a actualiza această notiță' });
    }
    notita.titlu = titlu || notita.titlu;
    notita.continut = continut || notita.continut;
    notita.stare = stare || notita.stare;
    await notita.save();
    res.json(notita);
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la actualizarea notiței' });
  }
}; 