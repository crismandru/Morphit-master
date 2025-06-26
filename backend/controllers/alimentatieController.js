const Alimentatie = require('../models/Alimentatie');

exports.obtineMese = async (req, res) => {
  try {
    const { data } = req.params;
    
    // Verificăm dacă data este în formatul corect (DD.MM.YYYY)
    if (!data.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return res.status(400).json({ 
        mesaj: 'Formatul datei este invalid. Trebuie să fie în formatul DD.MM.YYYY' 
      });
    }

    const alimentatie = await Alimentatie.findOne({ 
      utilizator: req.user.id,
      data 
    });
    
    if (!alimentatie) {
      return res.status(404).json({ mesaj: 'Nu s-au găsit mese pentru această dată' });
    }
    
    res.json(alimentatie.mese);
  } catch (error) {
    console.error('Eroare la obținerea meselor:', error);
    res.status(500).json({ mesaj: 'Eroare la obținerea meselor' });
  }
};

exports.adaugaMasa = async (req, res) => {
  try {
    const { nume, tip, calorii, proteine, carbohidrati, grasimi, culoare } = req.body;
    const data = req.params.data;

    // Verificăm dacă data este în formatul corect (DD.MM.YYYY)
    if (!data.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return res.status(400).json({ 
        mesaj: 'Formatul datei este invalid. Trebuie să fie în formatul DD.MM.YYYY' 
      });
    }

    let alimentatie = await Alimentatie.findOne({ 
      utilizator: req.user.id,
      data 
    });

    if (!alimentatie) {
      alimentatie = new Alimentatie({
        utilizator: req.user.id,
        data,
        mese: [],
        obiective: {
          calorii: 2000,
          proteine: 150,
          carbohidrati: 250,
          grasimi: 70
        }
      });
    }

    alimentatie.mese.push({
      nume,
      tip,
      calorii,
      proteine,
      carbohidrati,
      grasimi,
      culoare
    });

    await alimentatie.save();
    res.status(201).json(alimentatie.mese[alimentatie.mese.length - 1]);
  } catch (error) {
    console.error('Eroare detaliată la adăugarea mesei:', error);
    res.status(500).json({ 
      mesaj: 'Eroare la adăugarea mesei',
      detalii: error.message 
    });
  }
};

exports.stergeMasa = async (req, res) => {
  try {
    const { idMasa } = req.params;
    const alimentatie = await Alimentatie.findOne({ 
      utilizator: req.user.id,
      'mese._id': idMasa 
    });

    if (!alimentatie) {
      return res.status(404).json({ mesaj: 'Masă negăsită' });
    }

    alimentatie.mese = alimentatie.mese.filter(masa => masa._id.toString() !== idMasa);
    await alimentatie.save();
    
    res.json({ mesaj: 'Masă ștearsă cu succes' });
  } catch (error) {
    res.status(500).json({ mesaj: 'Eroare la ștergerea mesei' });
  }
};

exports.stergeMeseDupaData = async (req, res) => {
  try {
    const { data } = req.params;
    console.log('Încercăm să ștergem mesele pentru data:', data);

    // Verificăm dacă data este în formatul corect (DD.MM.YYYY)
    if (!data.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      console.log('Formatul datei este invalid:', data);
      return res.status(400).json({ 
        mesaj: 'Formatul datei este invalid. Trebuie să fie în formatul DD.MM.YYYY' 
      });
    }

    // Căutăm documentul pentru ștergere
    const rezultat = await Alimentatie.findOneAndDelete({ 
      utilizator: req.user.id,
      data 
    });

    console.log('Rezultat ștergere:', rezultat);

    if (!rezultat) {
      console.log('Nu s-au găsit mese pentru data:', data);
      return res.status(404).json({ mesaj: 'Nu s-au găsit mese pentru această dată' });
    }

    res.json({ mesaj: 'Toate mesele pentru această dată au fost șterse' });
  } catch (error) {
    console.error('Eroare la ștergerea meselor:', error);
    res.status(500).json({ mesaj: 'Eroare la ștergerea meselor' });
  }
};

exports.actualizeazaObiective = async (req, res) => {
  try {
    const { calorii, proteine, carbohidrati, grasimi } = req.body;
    const { data } = req.params;

    // Verificăm dacă data este în formatul corect (DD.MM.YYYY)
    if (!data.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return res.status(400).json({ 
        mesaj: 'Formatul datei este invalid. Trebuie să fie în formatul DD.MM.YYYY' 
      });
    }

    const alimentatie = await Alimentatie.findOne({ 
      utilizator: req.user.id,
      data 
    });

    if (!alimentatie) {
      return res.status(404).json({ mesaj: 'Nu s-au găsit date pentru această dată' });
    }

    alimentatie.obiective = {
      calorii,
      proteine,
      carbohidrati,
      grasimi
    };

    await alimentatie.save();
    res.json({ mesaj: 'Obiective actualizate cu succes' });
  } catch (error) {
    console.error('Eroare la actualizarea obiectivelor:', error);
    res.status(500).json({ mesaj: 'Eroare la actualizarea obiectivelor' });
  }
};

exports.obtineIstoric = async (req, res) => {
  try {
    console.log('Se preiau datele pentru istoricul alimentației');
    const alimentatie = await Alimentatie.find({ 
      utilizator: req.user.id 
    }).sort({ data: 1 });

    console.log('Date găsite în baza de date:', alimentatie.length);
    console.log('Primele 3 înregistrări:', alimentatie.slice(0, 3).map(item => ({
      data: item.data,
      updatedAt: item.updatedAt,
      meseCount: item.mese.length
    })));

    // Normalizăm datele și eliminăm duplicatele
    const dateNormalizate = new Map();
    
    alimentatie.forEach(zi => {
      // Convertim data în formatul DD.MM.YYYY
      let dataNormalizata;
      if (zi.data.includes('-')) {
        const [an, luna, ziua] = zi.data.split('-');
        dataNormalizata = `${ziua}.${luna}.${an}`;
      } else {
        dataNormalizata = zi.data;
      }

      console.log(`Data originală: ${zi.data} -> Data normalizată: ${dataNormalizata}`);

      // Păstrăm doar cea mai recentă înregistrare pentru fiecare dată
      if (!dateNormalizate.has(dataNormalizata) || 
          new Date(zi.updatedAt) > new Date(dateNormalizate.get(dataNormalizata).updatedAt)) {
        dateNormalizate.set(dataNormalizata, {
          ...zi.toObject(),
          data: dataNormalizata
        });
      }
    });

    // Convertim Map-ul în array și sortăm după dată crescător
    const rezultat = Array.from(dateNormalizate.values())
      .sort((a, b) => new Date(a.data.split('.').reverse().join('-')) - 
                     new Date(b.data.split('.').reverse().join('-')));
    
    console.log('Rezultat final:', rezultat.length, 'zile');
    console.log('Primele 3 zile din rezultat:', rezultat.slice(0, 3).map(item => ({
      data: item.data,
      meseCount: item.mese.length
    })));
    
    res.json(rezultat);
  } catch (error) {
    console.error('Eroare la obținerea istoricului:', error);
    res.status(500).json({ mesaj: 'Eroare la obținerea istoricului' });
  }
};

exports.obtineObiective = async (req, res) => {
  try {
    const { data } = req.params;

    // Verificăm dacă data este în formatul corect (DD.MM.YYYY)
    if (!data.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return res.status(400).json({ 
        mesaj: 'Formatul datei este invalid. Trebuie să fie în formatul DD.MM.YYYY' 
      });
    }

    const alimentatie = await Alimentatie.findOne({ 
      utilizator: req.user.id,
      data 
    });
    
    if (!alimentatie || !alimentatie.obiective) {
      // Returnăm obiective implicite bazate pe un calcul simplu
      // Folosim 2000 calorii ca bază și calculăm restul proporțional
      const caloriiImplicite = 2000;
      const proteineImplicite = Math.round(caloriiImplicite * 0.3 / 4); // 30% din calorii din proteine
      const grasimiImplicite = Math.round(caloriiImplicite * 0.25 / 9); // 25% din calorii din grăsimi
      const carbohidratiImplicite = Math.round((caloriiImplicite - (proteineImplicite * 4) - (grasimiImplicite * 9)) / 4);

      return res.json({
        calorii: caloriiImplicite,
        proteine: proteineImplicite,
        carbohidrati: carbohidratiImplicite,
        grasimi: grasimiImplicite
      });
    }
    
    res.json(alimentatie.obiective);
  } catch (error) {
    console.error('Eroare la obținerea obiectivelor:', error);
    res.status(500).json({ mesaj: 'Eroare la obținerea obiectivelor' });
  }
};

exports.salveazaObiective = async (req, res) => {
  try {
    const { calorii, proteine, carbohidrati, grasimi } = req.body;
    const { data } = req.params;

    // Verificăm dacă data este în formatul corect (DD.MM.YYYY)
    if (!data.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return res.status(400).json({ 
        mesaj: 'Formatul datei este invalid. Trebuie să fie în formatul DD.MM.YYYY' 
      });
    }

    let alimentatie = await Alimentatie.findOne({ 
      utilizator: req.user.id,
      data 
    });

    if (!alimentatie) {
      alimentatie = new Alimentatie({
        utilizator: req.user.id,
        data,
        mese: [],
        obiective: { calorii, proteine, carbohidrati, grasimi }
      });
    } else {
      alimentatie.obiective = { calorii, proteine, carbohidrati, grasimi };
    }

    await alimentatie.save();
    res.json({ mesaj: 'Obiective salvate cu succes' });
  } catch (error) {
    console.error('Eroare la salvarea obiectivelor:', error);
    res.status(500).json({ mesaj: 'Eroare la salvarea obiectivelor' });
  }
};

