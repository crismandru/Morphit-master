import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const AdaugaAntrenament = () => {
  const navigare = useNavigation();
  
  const [dataAntrenament, setDataAntrenament] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timpAntrenament, setTimpAntrenament] = useState('');
  const [tipAntrenament, setTipAntrenament] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  
  const [exercitii, setExercitii] = useState([]);
  const [showGrupaModal, setShowGrupaModal] = useState(false);
  const [showExercitiiModal, setShowExercitiiModal] = useState(false);
  const [grupaSelectata, setGrupaSelectata] = useState('');
  const [exercitiuCurent, setExercitiuCurent] = useState(null);
  const [exercitiiDisponibile, setExercitiiDisponibile] = useState([]);
  const [token, setToken] = useState('');

  const tipuriAntrenament = ['Leg Day', 'Pull Day', 'Push Day', 'Personalizat'];
  
  const grupeMuschi = [
    'Umeri', 'Piept', 'Biceps', 'Abdomen', 'Antebrațe', 
    'Cvadriceps', 'Trapez', 'Triceps', 'Spate', 'Fesieri', 
    'Femural', 'Gambe'
  ];

  // Adăugăm mapping-ul pentru tipurile de antrenament și grupele de mușchi permise
  const grupeMuschiPermise = {
    'Leg Day': ['Cvadriceps', 'Fesieri', 'Femural', 'Gambe'],
    'Pull Day': ['Spate', 'Biceps', 'Antebrațe', 'Trapez'],
    'Push Day': ['Piept', 'Umeri', 'Triceps'],
    'Personalizat': grupeMuschi // Pentru antrenament personalizat, toate grupele sunt permise
  };

  // Funcție pentru a obține grupele de mușchi disponibile în funcție de tipul de antrenament
  const getGrupeMuschiDisponibile = () => {
    if (!tipAntrenament) return grupeMuschi;
    return grupeMuschiPermise[tipAntrenament] || grupeMuschi;
  };

  useEffect(() => {
    const incarcaToken = async () => {
      try {
        const tokenSalvat = await AsyncStorage.getItem('token');
        if (tokenSalvat) {
          setToken(tokenSalvat);
        }
      } catch (error) {
        console.error('Eroare la încărcarea token-ului:', error);
      }
    };
    incarcaToken();
  }, []);

  const incarcaExercitiiDisponibile = async (grupaMusculara) => {
    try {
      console.log('Încarc exercițiile pentru grupa musculară:', grupaMusculara);
      const response = await fetch(`http://172.20.10.2:5000/exercitii?grupaMusculara=${encodeURIComponent(grupaMusculara)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Eroare la încărcarea exercițiilor');
      }
      
      const data = await response.json();
      console.log(`Am încărcat ${data.length} exerciții pentru ${grupaMusculara}`);
      
      // Filtrăm exercițiile pentru a include doar cele cu grupaMusculara corespunzătoare
      const exercitiiFiltrate = data.filter(exercitiu => exercitiu.grupaMusculara === grupaMusculara);
      console.log(`Am filtrat ${exercitiiFiltrate.length} exerciții pentru ${grupaMusculara}`);
      
      setExercitiiDisponibile(exercitiiFiltrate);
    } catch (error) {
      console.error('Eroare la încărcarea exercițiilor:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca exercițiile disponibile.');
    }
  };

  const adaugaExercitiuNou = () => {
    setGrupaSelectata('');
    setShowGrupaModal(true);
  };

  const selecteazaGrupa = async (grupa) => {
    setGrupaSelectata(grupa);
    setShowGrupaModal(false);
    await incarcaExercitiiDisponibile(grupa);
    setShowExercitiiModal(true);
  };

  const selecteazaExercitiu = (exercitiu) => {
    const nouExercitiu = {
      exercitiu: exercitiu._id,
      numeExercitiu: exercitiu.nume,
      grupaDeMuschi: exercitiu.grupaMusculara,
      numarSeturi: '1',
      seturi: [{ repetari: '', greutate: '' }]
    };
    
    setExercitii([...exercitii, nouExercitiu]);
    setShowExercitiiModal(false);
  };

  const adaugaSet = (indexExercitiu) => {
    const exercitiiNoi = [...exercitii];
    exercitiiNoi[indexExercitiu].seturi.push({ repetari: '', greutate: '' });
    exercitiiNoi[indexExercitiu].numarSeturi = exercitiiNoi[indexExercitiu].seturi.length.toString();
    setExercitii(exercitiiNoi);
  };

  const stergeSet = (indexExercitiu, indexSet) => {
    if (exercitii[indexExercitiu].seturi.length <= 1) {
      Alert.alert('Atenție', 'Exercițiul trebuie să aibă cel puțin un set.');
      return;
    }
    
    const exercitiiNoi = [...exercitii];
    exercitiiNoi[indexExercitiu].seturi.splice(indexSet, 1);
    exercitiiNoi[indexExercitiu].numarSeturi = exercitiiNoi[indexExercitiu].seturi.length.toString();
    setExercitii(exercitiiNoi);
  };

  const actualizeazaSet = (indexExercitiu, indexSet, camp, valoare) => {
    const exercitiiNoi = [...exercitii];
    exercitiiNoi[indexExercitiu].seturi[indexSet][camp] = valoare;
    setExercitii(exercitiiNoi);
  };

  const stergeExericitiu = (index) => {
    Alert.alert(
      'Confirmare',
      'Ești sigur că vrei să ștergi acest exercițiu?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          onPress: () => {
            const exercitiiNoi = exercitii.filter((_, i) => i !== index);
            setExercitii(exercitiiNoi);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const salveazaSesiuneAntrenament = async () => {
    if (!tipAntrenament) {
      Alert.alert('Eroare', 'Te rugăm să selectezi tipul antrenamentului.');
      return;
    }
    
    if (exercitii.length === 0) {
      Alert.alert('Eroare', 'Te rugăm să adaugi cel puțin un exercițiu.');
      return;
    }

    if (!timpAntrenament) {
      Alert.alert('Eroare', 'Te rugăm să introduci timpul antrenamentului.');
      return;
    }
    
    try {
      const antrenamentNou = {
        tip: tipAntrenament,
        data: dataAntrenament,
        timp: parseInt(timpAntrenament),
        exercitii: exercitii.map(ex => ({
          exercitiu: ex.exercitiu,
          numeExercitiu: ex.numeExercitiu,
          grupaDeMuschi: ex.grupaDeMuschi,
          seturi: ex.seturi.map(set => ({
            repetari: parseInt(set.repetari) || 0,
            greutate: parseInt(set.greutate) || 0
          }))
        }))
      };

      console.log('Se trimite antrenamentul:', JSON.stringify(antrenamentNou, null, 2));

      const response = await fetch('http://172.20.10.2:5000/api/antrenamente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(antrenamentNou)
      });

      if (!response.ok) {
        const eroare = await response.json();
        throw new Error(eroare.mesaj || 'Eroare la salvarea antrenamentului');
      }

      Alert.alert('Succes', 'Antrenamentul a fost salvat!');
      navigare.navigate('AntrenamenteAnterioare');
    } catch (error) {
      console.error('Eroare la salvarea antrenamentului:', error);
      Alert.alert('Eroare', error.message || 'Nu s-a putut salva antrenamentul.');
    }
  };

  const formatareData = (data) => {
    const zi = data.getDate().toString().padStart(2, '0');
    const luna = (data.getMonth() + 1).toString().padStart(2, '0');
    const an = data.getFullYear();
    return `${zi}/${luna}/${an}`;
  };

  // Modificăm funcția de selectare a tipului de antrenament
  const selecteazaTipAntrenament = (tip) => {
    setTipAntrenament(tip);
    setShowTipModal(false);
    // Resetăm grupa selectată și exercițiile când se schimbă tipul de antrenament
    setGrupaSelectata('');
    setExercitii([]);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/AdaugaAntrenament.png')} style={styles.image} />
      
      <TouchableOpacity onPress={() => navigare.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.screen}>
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Selectare tip antrenament */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Tip antrenament:</Text>
            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={() => setShowTipModal(true)}
            >
              <Text style={styles.selectButtonText}>
                {tipAntrenament || 'Selectează tipul antrenamentului'}
              </Text>
              <Icon name="chevron-down" size={20} color="#032851" />
            </TouchableOpacity>
          </View>
          
          {/* Date antrenament */}
          <View style={styles.dateContainer}>
            <Text style={styles.fieldLabel}>Data antrenament:</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)} 
              style={styles.dateInput}
            >
              <Icon name="calendar" size={20} color="#032851" style={styles.inputIcon} />
              <Text style={styles.dateText}>{formatareData(dataAntrenament)}</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker 
                value={dataAntrenament}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setDataAntrenament(date);
                }}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Timp petrecut (minute):</Text>
            <View style={styles.input}>
              <Icon name="time" size={20} color="#032851" style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput} 
                placeholder="Timp petrecut" 
                value={timpAntrenament}
                onChangeText={setTimpAntrenament}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.exercitiiHeader}>
            <Text style={styles.sectionTitle}>Exerciții</Text>
            <TouchableOpacity 
              style={styles.butonAdaugaExercitiu} 
              onPress={adaugaExercitiuNou}
            >
              <Text style={styles.textButonAdauga}>+ Adaugă exercițiu</Text>
            </TouchableOpacity>
          </View>
          
          {exercitii.length === 0 && (
            <View style={styles.emptyExercitii}>
              <Text style={styles.emptyText}>Nu ai adăugat încă exerciții</Text>
              <Text style={styles.emptySubtext}>Apasă butonul de mai sus pentru a adăuga</Text>
            </View>
          )}
          
          {exercitii.map((exercitiu, indexExercitiu) => (
            <View key={indexExercitiu} style={styles.containerExericitiu}>
              <View style={styles.exercitiuHeader}>
                <View style={styles.exercitiuTitlu}>
                  <Text style={styles.exercitiuNumar}>#{indexExercitiu + 1}</Text>
                  <Text style={styles.exercitiuNume}>
                    {exercitiu.numeExercitiu} ({exercitiu.grupaDeMuschi})
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.butonStergeExericitiu} 
                  onPress={() => stergeExericitiu(indexExercitiu)}
                >
                  <Icon name="trash" size={20} color="#032851" />
                </TouchableOpacity>
              </View>
              
              {exercitiu.seturi.map((set, indexSet) => (
                <View key={indexSet} style={styles.setContainer}>
                  <View style={styles.setHeader}>
                    <Text style={styles.setTitle}>Set {indexSet + 1}</Text>
                    {indexSet > 0 && (
                      <TouchableOpacity 
                        style={styles.butonStergeSet} 
                        onPress={() => stergeSet(indexExercitiu, indexSet)}
                      >
                        <Icon name="close-circle" size={20} color="#032851" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.setInputsRow}>
                    <View style={styles.setInputGroup}>
                      <Text style={styles.setInputLabel}>Repetări:</Text>
                      <TextInput 
                        style={styles.setInput} 
                        placeholder="Repetări"
                        value={set.repetari}
                        onChangeText={(valoare) => actualizeazaSet(indexExercitiu, indexSet, 'repetari', valoare)}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.setInputGroup}>
                      <Text style={styles.setInputLabel}>Greutate (kg):</Text>
                      <TextInput 
                        style={styles.setInput} 
                        placeholder="Kg"
                        value={set.greutate}
                        onChangeText={(valoare) => actualizeazaSet(indexExercitiu, indexSet, 'greutate', valoare)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.butonAdaugaSet} 
                onPress={() => adaugaSet(indexExercitiu)}
              >
                <Text style={styles.textButonAdaugaSet}>+ Adaugă set</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <TouchableOpacity style={styles.butonSalveaza} onPress={salveazaSesiuneAntrenament}>
        <Text style={styles.textButonSalveaza}>Salvează Antrenament</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.butonAntrenamenteAnterioare} onPress={() => navigare.navigate('AntrenamenteAnterioare')}>
        <Text style={styles.textButonAntrenamenteAnterioare}>Antrenamente Anterioare</Text>
      </TouchableOpacity>
      
      {/* Modal pentru selectarea tipului de antrenament */}
      <Modal
        visible={showTipModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selectează tipul antrenamentului</Text>
            {tipuriAntrenament.map((tip) => (
              <TouchableOpacity 
                key={tip} 
                style={styles.modalOption}
                onPress={() => selecteazaTipAntrenament(tip)}
              >
                <Text style={styles.modalOptionText}>{tip}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowTipModal(false)}
            >
              <Text style={styles.modalCloseText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal pentru selectarea grupei de mușchi */}
      <Modal
        visible={showGrupaModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {tipAntrenament 
                ? `Selectează grupa de mușchi pentru ${tipAntrenament}`
                : 'Selectează tipul antrenamentului mai întâi'}
            </Text>
            {!tipAntrenament ? (
              <TouchableOpacity 
                style={[styles.modalOption, { backgroundColor: '#f0f0f0' }]}
                onPress={() => {
                  setShowGrupaModal(false);
                  setShowTipModal(true);
                }}
              >
                <Text style={styles.modalOptionText}>Selectează tipul antrenamentului</Text>
              </TouchableOpacity>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {getGrupeMuschiDisponibile().map((grupa) => (
                  <TouchableOpacity 
                    key={grupa}
                    style={styles.modalOption}
                    onPress={() => selecteazaGrupa(grupa)}
                  >
                    <Text style={styles.modalOptionText}>{grupa}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowGrupaModal(false)}
            >
              <Text style={styles.modalCloseText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal pentru selectarea exercițiului */}
      <Modal
        visible={showExercitiiModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selectează exercițiul</Text>
            <ScrollView style={styles.modalScroll}>
              {exercitiiDisponibile.map((exercitiu) => (
                <TouchableOpacity 
                  key={exercitiu._id}
                  style={styles.modalOption}
                  onPress={() => selecteazaExercitiu(exercitiu)}
                >
                  <Text style={styles.modalOptionText}>{exercitiu.nume}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowExercitiiModal(false)}
            >
              <Text style={styles.modalCloseText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center',
  },
  image: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  butonInapoi: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  screen: {
    flex: 1,
    backgroundColor: '#032851',
    margin: 15,
    borderRadius: 15,
    borderWidth: 5,
    borderColor: '#8caee0',
    marginTop: 260,
    marginBottom: 15,
    width: '90%',
  },
  scrollContainer: { 
    width: '100%', 
  },
  content: { 
    padding: 15,
    alignItems: 'center',
    paddingBottom: 50,
  },
  dateContainer: {
    width: '100%',
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  exercitiiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: '#032851',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#8caee0',
  },
  butonAdaugaExercitiu: {
    backgroundColor: '#8caee0',
    borderRadius: 10,
    padding: 8,
  },
  textButonAdauga: {
    color: '#032851',
    fontWeight: 'bold',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#8caee0',
    width: '100%',
  },
  dateText: {
    fontSize: 16,
    color: '#032851',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#8caee0',
    width: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8caee0',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#032851',
  },
  containerExericitiu: {
    marginBottom: 15,
    backgroundColor: '#8caee0',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    borderWidth: 2,
    borderColor: '#fff',
  },
  exercitiuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exercitiuTitlu: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exercitiuNumar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
    marginRight: 10,
  },
  exercitiuNume: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
  },
  butonStergeExericitiu: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
  },
  setContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
  },
  butonStergeSet: {
    padding: 5,
  },
  setInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setInputGroup: {
    width: '48%',
  },
  setInputLabel: {
    fontSize: 14,
    color: '#032851',
    marginBottom: 5,
  },
  setInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  butonAdaugaSet: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  textButonAdaugaSet: {
    color: '#032851',
    fontWeight: 'bold',
  },
  butonSalveaza: {
    backgroundColor: '#032851',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    marginTop: 10,
  },
  textButonSalveaza: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  butonAntrenamenteAnterioare: {
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#032851',
    width: '90%',
    marginBottom: 60,
  },
  textButonAntrenamenteAnterioare: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#032851',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#032851',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#032851',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyExercitii: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#8caee0',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#8caee0',
    textAlign: 'center',
  },
});

export default AdaugaAntrenament;