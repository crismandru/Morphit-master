const mongoose = require('mongoose');
const Exercitiu = require('../models/Exercitiu');
require('dotenv').config();

const exercitiiPredefinite = [
  // Umeri
  {
    nume: "Ridicări frontale cu gantere",
    grupaMusculara: "Umeri",
    tip: "Gantere",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },
  {
    nume: "Ridicări laterale cu gantere",
    grupaMusculara: "Umeri",
    tip: "Gantere",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },
  {
    nume: "Arnold Press",
    grupaMusculara: "Umeri",
    tip: "Gantere",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 4,
    rating: 5,
    sentiment: "Pozitiv"
  },

  // Piept
  {
    nume: "Flotări",
    grupaMusculara: "Piept",
    tip: "Greutate corporală",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Bench Press",
    grupaMusculara: "Piept",
    tip: "Bara",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 4,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Fly cu gantere",
    grupaMusculara: "Piept",
    tip: "Gantere",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },

  // Biceps
  {
    nume: "Curl cu gantere",
    grupaMusculara: "Biceps",
    tip: "Gantere",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },
  {
    nume: "Curl cu bara",
    grupaMusculara: "Biceps",
    tip: "Bara",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 4,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Hammer Curl",
    grupaMusculara: "Biceps",
    tip: "Gantere",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },

  // Abdomen
  {
    nume: "Crunch",
    grupaMusculara: "Abdomen",
    tip: "Greutate corporală",
    intensitate: "Ușor",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },
  {
    nume: "Plank",
    grupaMusculara: "Abdomen",
    tip: "Greutate corporală",
    intensitate: "Moderat",
    durata: 60,
    caloriiArse: 0,
    seturi: 3,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Leg Raises",
    grupaMusculara: "Abdomen",
    tip: "Greutate corporală",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },

  // Spate
  {
    nume: "Pull-ups",
    grupaMusculara: "Spate",
    tip: "Greutate corporală",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 4,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Rând cu bara",
    grupaMusculara: "Spate",
    tip: "Bara",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 4,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Lat Pulldown",
    grupaMusculara: "Spate",
    tip: "Mașină",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },

  // Picioare
  {
    nume: "Squat",
    grupaMusculara: "Cvadriceps",
    tip: "Bara",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 4,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Deadlift",
    grupaMusculara: "Femural",
    tip: "Bara",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 4,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Lunges",
    grupaMusculara: "Cvadriceps",
    tip: "Gantere",
    intensitate: "Moderat",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },

  // Cardio
  {
    nume: "Alergare",
    grupaMusculara: "Cardio",
    tip: "Cardio",
    intensitate: "Moderat",
    durata: 30,
    caloriiArse: 300,
    seturi: 1,
    rating: 5,
    sentiment: "Pozitiv"
  },
  {
    nume: "Sărituri cu coarda",
    grupaMusculara: "Cardio",
    tip: "Cardio",
    intensitate: "Moderat",
    durata: 15,
    caloriiArse: 150,
    seturi: 3,
    rating: 4,
    sentiment: "Neutru"
  },
  {
    nume: "Burpees",
    grupaMusculara: "Cardio",
    tip: "Cardio",
    intensitate: "Intens",
    durata: 0,
    caloriiArse: 0,
    seturi: 3,
    rating: 5,
    sentiment: "Pozitiv"
  }
];

const initExercitii = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectat la MongoDB');

    // Șterge toate exercițiile existente
    await Exercitiu.deleteMany({});
    console.log('Colecția de exerciții a fost ștearsă');

    // Adaugă exercițiile predefinite
    const exercitiiAdaugate = await Exercitiu.insertMany(exercitiiPredefinite);
    console.log(`${exercitiiAdaugate.length} exerciții au fost adăugate în baza de date`);

    // Afișează exercițiile grupate pe grupe musculare
    const exercitiiGrupate = await Exercitiu.aggregate([
      {
        $group: {
          _id: "$grupaMusculara",
          count: { $sum: 1 },
          exercitii: { $push: "$nume" }
        }
      }
    ]);

    console.log('\nExerciții disponibile pe grupe musculare:');
    exercitiiGrupate.forEach(grupa => {
      console.log(`\n${grupa._id} (${grupa.count} exerciții):`);
      grupa.exercitii.forEach(exercitiu => console.log(`- ${exercitiu}`));
    });

  } catch (error) {
    console.error('Eroare la inițializarea exercițiilor:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDeconectat de la MongoDB');
  }
};

initExercitii(); 