const Poza = require('../models/Poza');

exports.obtinePoze = async (req, res) => {
  try {
    const poze = await Poza.find({ utilizator: req.user.id })
      .sort({ data: -1 });
    res.json(poze);
  } catch (error) {
    console.error('Eroare la obținerea pozelor:', error);
    res.status(500).json({ mesaj: 'Eroare la obținerea pozelor' });
  }
};

exports.adaugaPoza = async (req, res) => {
  try {
    const { url, descriere } = req.body;

    if (!url || !descriere) {
      return res.status(400).json({ mesaj: 'URL-ul și descrierea sunt obligatorii' });
    }

    const pozaNoua = new Poza({
      utilizator: req.user.id,
      url,
      descriere
    });

    await pozaNoua.save();
    res.status(201).json(pozaNoua);
  } catch (error) {
    console.error('Eroare la adăugarea pozei:', error);
    res.status(500).json({ mesaj: 'Eroare la adăugarea pozei' });
  }
};

exports.stergePoza = async (req, res) => {
  try {
    const poza = await Poza.findOneAndDelete({
      _id: req.params.id,
      utilizator: req.user.id
    });

    if (!poza) {
      return res.status(404).json({ mesaj: 'Poza nu a fost găsită' });
    }

    res.json({ mesaj: 'Poza ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea pozei:', error);
    res.status(500).json({ mesaj: 'Eroare la ștergerea pozei' });
  }
}; 