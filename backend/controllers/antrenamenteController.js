const Antrenament = require('../models/Antrenament');
const Exercitiu = require('../models/Exercitiu');

exports.creareAntrenament = async (req, res) => {
  try {
    const { tip, data, timp, durata, exercitii } = req.body;
    const exercitiiExistent = await Exercitiu.find({
      _id: { $in: exercitii.map(ex => ex.exercitiu) }
    });
    const exercitiiMap = new Map(
      exercitiiExistent.map(ex => [ex._id.toString(), ex])
    );
    for (const ex of exercitii) {
      if (!exercitiiMap.has(ex.exercitiu)) {
        console.log('Exercițiu negăsit:', ex.exercitiu);
        return res.status(400).json({ 
          mesaj: `Exercițiul cu ID-ul ${ex.exercitiu} nu există` 
        });
      }
    }
    const exercitiiFormatate = exercitii.map(ex => {
      const exercitiuExistent = exercitiiMap.get(ex.exercitiu);
      let seturiFormatate = [];
      if (typeof ex.seturi === 'number') {
        for (let i = 0; i < ex.seturi; i++) {
          const set = {
            repetari: parseInt(ex.repetari) || 0,
            greutate: parseInt(ex.greutate) || 0
          };
          seturiFormatate.push(set);
        }
      } else if (Array.isArray(ex.seturi)) {
        seturiFormatate = ex.seturi.map((set, index) => {
          const setFormatat = {
            repetari: parseInt(set.repetari) || 0,
            greutate: parseInt(set.greutate) || 0
          };
          return setFormatat;
        });
      }
      const exercitiuFormatat = {
        exercitiu: ex.exercitiu,
        numeExercitiu: ex.numeExercitiu || exercitiuExistent.nume,
        grupaDeMuschi: ex.grupaDeMuschi || exercitiuExistent.grupaMusculara,
        seturi: seturiFormatate
      };
      return exercitiuFormatat;
    });
    const antrenamentNou = new Antrenament({
      utilizator: req.user._id,
      tip: tip || 'Personalizat',
      data: new Date(data),
      timp: timp || durata,
      exercitii: exercitiiFormatate
    });
    const antrenamentSalvat = await antrenamentNou.save();
    res.status(201).json(antrenamentSalvat);
  } catch (error) {
    console.error('Eroare la crearea antrenamentului:', error);
    res.status(500).json({ 
      mesaj: 'Eroare la salvarea antrenamentului',
      eroare: error.message 
    });
  }
};

exports.getAntrenamente = async (req, res) => {
  try {
    console.log('\n=== PRELUARE ANTRENAMENTE ===');
    console.log('Utilizator:', req.user._id);
    
    const antrenamente = await Antrenament.find({ utilizator: req.user._id })
      .sort({ data: -1 })
      .lean();
    
    console.log(`S-au găsit ${antrenamente.length} antrenamente`);
    
    if (antrenamente.length > 0) {
      console.log('\nPrimul antrenament din baza de date:');
      console.log(JSON.stringify(antrenamente[0], null, 2));
    }

    const antrenamentePopulate = antrenamente.map(antrenament => {
      console.log('\nProcesăm antrenamentul:', antrenament._id);
      console.log('Tip antrenament din baza de date:', antrenament.tip);
      
      if (antrenament.exercitii) {
        console.log(`Antrenamentul are ${antrenament.exercitii.length} exerciții`);
        
        antrenament.exercitii = antrenament.exercitii.map((exercitiu, index) => {
          console.log(`\nExercițiul ${index + 1}:`, exercitiu.numeExercitiu);
          console.log('Seturi din baza de date:', JSON.stringify(exercitiu.seturi, null, 2));
          
          return exercitiu;
        });
      }

      return antrenament;
    });

    console.log('\nTrimitem răspunsul final:');
    if (antrenamentePopulate.length > 0) {
      console.log(JSON.stringify(antrenamentePopulate[0], null, 2));
    }
    
    res.json(antrenamentePopulate);
  } catch (error) {
    console.error('Eroare la încărcarea antrenamentelor:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      mesaj: 'Eroare la încărcarea antrenamentelor',
      eroare: error.message 
    });
  }
};

exports.getAntrenament = async (req, res) => {
  try {
    const antrenament = await Antrenament.findOne({
      _id: req.params.id,
      utilizator: req.user._id
    }).populate('exercitii.exercitiu', 'nume animatie');

    if (!antrenament) {
      return res.status(404).json({ mesaj: 'Antrenamentul nu a fost găsit' });
    }

    res.json(antrenament);
  } catch (error) {
    console.error('Eroare la încărcarea antrenamentului:', error);
    res.status(500).json({ 
      mesaj: 'Eroare la încărcarea antrenamentului',
      eroare: error.message 
    });
  }
};

exports.actualizareAntrenament = async (req, res) => {
  try {
    const { tip, data, timp, exercitii } = req.body;
    
    const antrenamentExistent = await Antrenament.findOne({
      _id: req.params.id,
      utilizator: req.user._id
    });

    if (!antrenamentExistent) {
      return res.status(404).json({ mesaj: 'Antrenamentul nu a fost găsit' });
    }

    for (const ex of exercitii) {
      const exercitiuExistent = await Exercitiu.findById(ex.exercitiu);
      if (!exercitiuExistent) {
        return res.status(400).json({ 
          mesaj: `Exercițiul cu ID-ul ${ex.exercitiu} nu există` 
        });
      }
    }

    const antrenamentActualizat = await Antrenament.findByIdAndUpdate(
      req.params.id,
      {
        tip,
        data: new Date(data),
        timp,
        exercitii: exercitii.map(ex => ({
          exercitiu: ex.exercitiu,
          numeExercitiu: ex.numeExercitiu,
          grupaDeMuschi: ex.grupaDeMuschi,
          seturi: ex.seturi.map(set => ({
            repetari: set.repetari,
            greutate: set.greutate
          }))
        }))
      },
      { new: true }
    ).populate('exercitii.exercitiu', 'nume animatie');

    res.json(antrenamentActualizat);
  } catch (error) {
    console.error('Eroare la actualizarea antrenamentului:', error);
    res.status(500).json({ 
      mesaj: 'Eroare la actualizarea antrenamentului',
      eroare: error.message 
    });
  }
};

exports.stergereAntrenament = async (req, res) => {
  try {
    const antrenament = await Antrenament.findOneAndDelete({
      _id: req.params.id,
      utilizator: req.user._id
    });

    if (!antrenament) {
      return res.status(404).json({ mesaj: 'Antrenamentul nu a fost găsit' });
    }

    res.json({ mesaj: 'Antrenament șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea antrenamentului:', error);
    res.status(500).json({ 
      mesaj: 'Eroare la ștergerea antrenamentului',
      eroare: error.message 
    });
  }
};

exports.getExercitiiDisponibile = async (req, res) => {
  try {
    const { grupaMusculara } = req.query;
    const query = { utilizator: req.utilizator._id };
    
    if (grupaMusculara) {
      query.grupaMusculara = grupaMusculara;
    }

    const exercitii = await Exercitiu.find(query)
      .select('nume grupaMusculara tip intensitate')
      .sort({ nume: 1 });

    res.json(exercitii);
  } catch (error) {
    res.status(500).json({ mesaj: error.message });
  }
}; 