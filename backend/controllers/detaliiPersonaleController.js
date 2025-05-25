const DetaliiPersonale = require('../models/DetaliiPersonale');

exports.creareDetalii = async (req, res) => {
  const userId = req.user.id;
  const { nume, prenume, dataNasterii, gen, inaltime, greutate } = req.body;

  try {
    const existente = await DetaliiPersonale.findOne({ user: userId });
    if (existente) {
      return res.status(409).json({ mesaj: 'Detaliile personale există deja. Folosește endpointul de editare.' });
    }

    const detalii = new DetaliiPersonale({
      user: userId,
      nume,
      prenume,
      dataNasterii,
      gen,
      inaltime,
      greutate
    });

    await detalii.save();
    res.status(201).json({ mesaj: 'Detalii salvate cu succes!', detalii });
  } catch (err) {
    console.error('Eroare la salvarea detaliilor:', err);
    res.status(500).json({ mesaj: 'Eroare de server' });
  }
};

exports.editeazaDetalii = async (req, res) => {
  const userId = req.user.id;
  const { nume, prenume, dataNasterii, gen, inaltime, greutate } = req.body;

  try {
    const detalii = await DetaliiPersonale.findOneAndUpdate(
      { user: userId },
      { nume, prenume, dataNasterii, gen, inaltime, greutate },
      { new: true }
    );

    if (!detalii) {
      return res.status(404).json({ mesaj: 'Nu s-au găsit detalii pentru actualizare.' });
    }

    res.json({ mesaj: 'Detalii actualizate cu succes!', detalii });
  } catch (err) {
    console.error('Eroare la actualizare:', err);
    res.status(500).json({ mesaj: 'Eroare de server' });
  }
};

exports.obtineDetalii = async (req, res) => {
  try {
    console.log('Se încearcă obținerea detaliilor pentru user:', req.user.id);
    const userId = req.user.id;
    const detalii = await DetaliiPersonale.findOne({ user: userId });
    console.log('Detalii găsite:', detalii);

    if (!detalii) {
      console.log('Nu s-au găsit detalii pentru user:', userId);
      return res.status(404).json({ mesaj: 'Nu s-au găsit detaliile personale.' });
    }

    res.json({
      nume: detalii.nume,
      prenume: detalii.prenume,
      dataNasterii: detalii.dataNasterii,
      gen: detalii.gen,
      inaltime: detalii.inaltime,
      greutate: detalii.greutate
    });
  } catch (err) {
    console.error('Eroare în obtineDetalii:', err);
    res.status(500).json({ mesaj: 'Eroare la preluarea datelor personale' });
  }
};