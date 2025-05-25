const MeseAnterioare = require('../models/MeseAnterioare');

exports.salveazaMese = async (req, res) => {
  try {
    console.log('Început salveazaMese - Date primite:', {
      body: req.body,
      userId: req.user?.id
    });

    const { data, mese, obiective } = req.body;

    // Verificăm dacă există deja mese pentru această dată
    const meseExistente = await MeseAnterioare.findOne({
      utilizator: req.user.id,
      data
    });

    if (meseExistente) {
      console.log('Actualizare mese existente pentru data:', data);
      meseExistente.mese = mese;
      meseExistente.obiective = obiective;
      await meseExistente.save();
    } else {
      console.log('Creare înregistrare nouă pentru data:', data);
      const meseNoi = new MeseAnterioare({
        utilizator: req.user.id,
        data,
        mese,
        obiective
      });
      await meseNoi.save();
    }

    console.log('Mese salvate cu succes');
    res.json({ mesaj: 'Mese salvate cu succes' });
  } catch (error) {
    console.error('Eroare detaliată la salvarea meselor:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.id
    });
    res.status(500).json({ 
      mesaj: 'Eroare la salvarea meselor',
      detalii: error.message 
    });
  }
};

exports.obtineMese = async (req, res) => {
  try {
    console.log('Început obtineMese pentru utilizator:', req.user.id);
    const mese = await MeseAnterioare.find({ 
      utilizator: req.user.id 
    }).sort({ data: -1 });
    
    console.log('Mese găsite:', mese.length, 'înregistrări');
    res.json(mese);
  } catch (error) {
    console.error('Eroare detaliată la obținerea meselor:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ 
      mesaj: 'Eroare la obținerea meselor',
      detalii: error.message 
    });
  }
};

exports.stergeZi = async (req, res) => {
  try {
    console.log('Început stergeZi - Date primite:', {
      params: req.params,
      userId: req.user?.id
    });

    const { id } = req.params;

    const mese = await MeseAnterioare.findOneAndDelete({
      _id: id,
      utilizator: req.user.id
    });

    if (!mese) {
      console.log('Nu s-au găsit mese pentru ID-ul specificat');
      return res.status(404).json({ mesaj: 'Nu s-au găsit mese pentru această zi' });
    }

    console.log('Mese șterse cu succes');
    res.json({ mesaj: 'Mese șterse cu succes' });
  } catch (error) {
    console.error('Eroare detaliată la ștergerea meselor:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      userId: req.user?.id
    });
    res.status(500).json({ 
      mesaj: 'Eroare la ștergerea meselor',
      detalii: error.message 
    });
  }
};

exports.actualizeazaMese = async (req, res) => {
  try {
    console.log('Început actualizeazaMese - Date primite:', {
      params: req.params,
      body: req.body,
      userId: req.user?.id
    });

    const { id } = req.params;
    const { data, mese, obiective } = req.body;

    const meseActualizate = await MeseAnterioare.findOneAndUpdate(
      { _id: id, utilizator: req.user.id },
      { data, mese, obiective },
      { new: true }
    );

    if (!meseActualizate) {
      console.log('Nu s-au găsit mese pentru ID-ul specificat');
      return res.status(404).json({ mesaj: 'Nu s-au găsit mese pentru această zi' });
    }

    console.log('Mese actualizate cu succes');
    res.json(meseActualizate);
  } catch (error) {
    console.error('Eroare detaliată la actualizarea meselor:', {
      message: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body,
      userId: req.user?.id
    });
    res.status(500).json({ 
      mesaj: 'Eroare la actualizarea meselor',
      detalii: error.message 
    });
  }
}; 