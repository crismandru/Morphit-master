const Exercitiu = require('../models/Exercitiu');

// Adaugă un exercițiu nou
exports.adaugaExercitiu = async (req, res, next) => {
  try {
    console.log('Utilizator autentificat:', req.user);
    const { 
      nume, 
      descriere, 
      muschiAntrenati,
      echipament, 
      video, 
      animatie, 
      grupaMusculara, 
      isDefault 
    } = req.body;

    console.log('Date primite pentru exercițiu:', {
      nume,
      descriere,
      muschiAntrenati,
      echipament,
      video,
      animatie,
      grupaMusculara,
      isDefault
    });

    // Verifică dacă exercițiul există deja (pentru exerciții predefinite)
    if (isDefault) {
      const exercitiuExistent = await Exercitiu.findOne({ 
        nume, 
        isDefault: true 
      });
      
      if (exercitiuExistent) {
        console.log('Exercițiu predefinit existent:', exercitiuExistent);
        return res.status(400).json({ 
          mesaj: 'Acest exercițiu predefinit există deja' 
        });
      }
    }

    const exercitiuNou = new Exercitiu({
      nume,
      descriere,
      muschiAntrenati,
      echipament,
      video,
      animatie,
      grupaMusculara,
      isDefault,
      utilizator: isDefault ? undefined : req.user.id
    });

    console.log('Încercare salvare exercițiu nou:', exercitiuNou);
    await exercitiuNou.save();
    console.log('Exercițiu salvat cu succes:', exercitiuNou);
    
    res.status(201).json(exercitiuNou);
  } catch (error) {
    console.error('Eroare detaliată la adăugarea exercițiului:', error);
    next(error);
  }
};

// Verifică existența unui exercițiu
exports.verificaExercitiu = async (req, res, next) => {
  try {
    const nume = decodeURIComponent(req.params.nume);
    console.log('Verificare exercițiu:', { nume, utilizator: req.user.id });

    // Caută exercițiul fie ca predefinit, fie ca personalizat pentru utilizatorul curent
    const exercitiu = await Exercitiu.findOne({
      $or: [
        { nume, isDefault: true },
        { nume, utilizator: req.user.id }
      ]
    }).select('nume isDefault utilizator');

    console.log('Rezultat verificare:', exercitiu);
    res.json({ exista: !!exercitiu, exercitiu });
  } catch (error) {
    console.error('Eroare la verificarea exercițiului:', error);
    next(error);
  }
};

// Obține toate exercițiile
exports.getExercitii = async (req, res, next) => {
  try {
    const exercitii = await Exercitiu.find({
      $or: [
        { isDefault: true },
        { utilizator: req.user.id }
      ]
    }).sort({ grupaMusculara: 1, nume: 1 });

    res.json(exercitii);
  } catch (error) {
    console.error('Eroare la obținerea exercițiilor:', error);
    next(error);
  }
};

// Obține exercițiile pentru o grupă musculară specifică
exports.getExercitiiGrupa = async (req, res, next) => {
  try {
    const { grupa } = req.params;
    const exercitii = await Exercitiu.find({
      grupaMusculara: grupa,
      $or: [
        { isDefault: true },
        { utilizator: req.user.id }
      ]
    }).sort({ nume: 1 });

    res.json(exercitii);
  } catch (error) {
    console.error('Eroare la obținerea exercițiilor pentru grupa:', grupa, error);
    next(error);
  }
};

// Obține un exercițiu specific
exports.getExercitiu = async (req, res, next) => {
  try {
    const nume = decodeURIComponent(req.params.nume);
    const exercitiu = await Exercitiu.findOne({
      nume,
      $or: [
        { isDefault: true },
        { utilizator: req.user.id }
      ]
    });

    if (!exercitiu) {
      return res.status(404).json({ mesaj: 'Exercițiul nu a fost găsit' });
    }

    res.json(exercitiu);
  } catch (error) {
    console.error('Eroare la obținerea exercițiului:', error);
    next(error);
  }
};

// Actualizează un exercițiu
exports.actualizeazaExercitiu = async (req, res, next) => {
  try {
    const numeOriginal = decodeURIComponent(req.params.nume);
    const { nume, descriere, muschiAntrenati, echipament, video, animatie, grupaMusculara } = req.body;
    
    // Căutăm exercițiul după numele original
    const exercitiu = await Exercitiu.findOne({
      nume: numeOriginal,
      utilizator: req.user.id // Doar exercițiile personalizate pot fi actualizate
    });

    if (!exercitiu) {
      return res.status(404).json({ mesaj: 'Exercițiul nu a fost găsit sau nu ai permisiunea să-l modifici' });
    }

    // Dacă se schimbă numele, verificăm dacă noul nume există deja
    if (nume && nume !== numeOriginal) {
      const exercitiuExistent = await Exercitiu.findOne({
        nume,
        $or: [
          { isDefault: true },
          { utilizator: req.user.id }
        ]
      });

      if (exercitiuExistent) {
        return res.status(400).json({ mesaj: 'Există deja un exercițiu cu acest nume' });
      }
    }

    // Actualizăm câmpurile
    const actualizari = {
      descriere,
      muschiAntrenati,
      echipament,
      video,
      animatie,
      grupaMusculara
    };

    // Adăugăm numele în actualizări doar dacă s-a schimbat
    if (nume && nume !== numeOriginal) {
      actualizari.nume = nume;
    }

    // Eliminăm câmpurile undefined
    Object.keys(actualizari).forEach(key => 
      actualizari[key] === undefined && delete actualizari[key]
    );

    // Aplicăm actualizările
    Object.assign(exercitiu, actualizari);

    console.log('Actualizare exercițiu:', {
      numeOriginal,
      actualizari,
      exercitiuActualizat: exercitiu
    });

    await exercitiu.save();
    res.json(exercitiu);
  } catch (error) {
    console.error('Eroare la actualizarea exercițiului:', error);
    next(error);
  }
};

// Șterge un exercițiu
exports.stergeExercitiu = async (req, res, next) => {
  try {
    const nume = decodeURIComponent(req.params.nume);
    const exercitiu = await Exercitiu.findOneAndDelete({
      nume,
      utilizator: req.user.id // Doar exercițiile personalizate pot fi șterse
    });

    if (!exercitiu) {
      return res.status(404).json({ mesaj: 'Exercițiul nu a fost găsit sau nu ai permisiunea să-l ștergi' });
    }

    res.json({ mesaj: 'Exercițiul a fost șters' });
  } catch (error) {
    console.error('Eroare la ștergerea exercițiului:', error);
    next(error);
  }
};

exports.incarcaImagine = async (req, res) => {
  try {
    console.log('Încep procesarea încărcării imaginii...');
    console.log('Request file:', req.file);
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);

    if (!req.file) {
      console.log('Nu s-a găsit niciun fișier în request');
      return res.status(400).json({ mesaj: 'Nu a fost furnizată nicio imagine' });
    }

    const numeExercitiu = decodeURIComponent(req.params.nume);
    console.log('Nume exercițiu:', numeExercitiu);
    
    // Găsim exercițiul în baza de date
    const exercitiu = await Exercitiu.findOne({ nume: numeExercitiu });
    console.log('Exercițiu găsit:', exercitiu ? 'Da' : 'Nu');
    
    if (!exercitiu) {
      return res.status(404).json({ mesaj: 'Exercițiul nu a fost găsit' });
    }

    // Verificăm dacă utilizatorul are dreptul să modifice exercițiul
    if (exercitiu.isDefault && (!req.user || req.user.rol !== 'admin')) {
      console.log('Utilizatorul nu are permisiunea de a modifica exercițiul');
      return res.status(403).json({ mesaj: 'Nu aveți permisiunea de a modifica acest exercițiu' });
    }

    // Construim URL-ul către imagine
    const animatieUrl = `/uploads/exercitii/${req.file.filename}`;
    console.log('URL animație:', animatieUrl);
    
    // Actualizăm exercițiul cu noul URL al animației
    exercitiu.animatie = animatieUrl;
    await exercitiu.save();
    console.log('Exercițiul actualizat cu succes');

    res.json({ 
      mesaj: 'Imagine încărcată cu succes',
      animatieUrl: animatieUrl
    });
  } catch (error) {
    console.error('Eroare detaliată la încărcarea imaginii:', error);
    res.status(500).json({ mesaj: 'Eroare la încărcarea imaginii', eroare: error.message });
  }
}; 