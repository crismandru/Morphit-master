import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Keyboard, TouchableWithoutFeedback, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Circle } from 'react-native-progress';
import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.3:5000';

const Alimentatie = () => {
  const navigare = useNavigation();
  const [caloriiTotale, setCaloriiTotale] = useState(0);
  const [proteineTotale, setProteineTotale] = useState(0);
  const [carbohidratiTotali, setCarbohidratiTotali] = useState(0);
  const [grasimiTotale, setGrasimiTotale] = useState(0);
  const [caloriiConsumate, setCaloriiConsumate] = useState(0);
  const [proteineConsumate, setProteineConsumate] = useState(0);
  const [carbohidratiConsumati, setCarbohidratiConsumati] = useState(0);
  const [grasimiConsumate, setGrasimiConsumate] = useState(0);
  const [dataCurenta, setDataCurenta] = useState('');
  const [selecteazaTipMasaVizibil, setSelecteazaTipMasaVizibil] = useState(false);
  const [tipMasa, setTipMasa] = useState('');
  const [culoareMasa, setCuloareMasa] = useState('#032851');
  const [modalVizibil, setModalVizibil] = useState(false);
  const [numeMasa, setNumeMasa] = useState('');
  const [caloriiMasa, setCaloriiMasa] = useState('');
  const [proteineMasa, setProteineMasa] = useState('');
  const [carbohidratiMasa, setCarbohidratiMasa] = useState('');
  const [grasimiMasa, setGrasimiMasa] = useState('');
  const [mese, setMese] = useState([]);
  
  const culoriMese = {
    'Mic dejun': '#ffbf00',  
    'Gustare': '#fa8900',   
    'Prânz': '#fa5477',     
    'Cină': '#01b4bc'      
};

  const adaugaMasa = async () => {
    if (!numeMasa || !caloriiMasa || !proteineMasa || !carbohidratiMasa || !grasimiMasa) return;
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const masaNoua = {
        nume: numeMasa,
        calorii: parseFloat(caloriiMasa) || 0,
        proteine: parseFloat(proteineMasa) || 0,
        carbohidrati: parseFloat(carbohidratiMasa) || 0,
        grasimi: parseFloat(grasimiMasa) || 0,
        tip: tipMasa,
        culoare: culoareMasa
      };

      const response = await axios.post(`${API_BASE_URL}/alimentatie/mese/${dataCurenta}`, masaNoua, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const meseNoi = [...mese, response.data];
      setMese(meseNoi);

      const caloriiNoi = caloriiConsumate + masaNoua.calorii;
      const proteineNoi = proteineConsumate + masaNoua.proteine;
      const carbohidratiNoi = carbohidratiConsumati + masaNoua.carbohidrati;
      const grasimiNoi = grasimiConsumate + masaNoua.grasimi;
    
      setCaloriiConsumate(caloriiNoi);
      setProteineConsumate(proteineNoi);
      setCarbohidratiConsumati(carbohidratiNoi);
      setGrasimiConsumate(grasimiNoi);
    
      setNumeMasa('');
      setCaloriiMasa('');
      setProteineMasa('');
      setCarbohidratiMasa('');
      setGrasimiMasa('');
      setModalVizibil(false);
    } catch (error) {
      console.error('Eroare la adăugarea mesei:', error);
      Alert.alert('Eroare', 'Nu s-a putut adăuga masa. Verifică conexiunea la server.');
    }
  };

  const stergeMasa = async (id) => {
    Alert.alert(
      'Confirmare',
      'Ești sigur că vrei să ștergi această masă?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) return;

              const masaStearsa = mese.find(masa => masa._id === id);
              if (!masaStearsa) return;

              await axios.delete(`${API_BASE_URL}/alimentatie/mese/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              const caloriiNoi = caloriiConsumate - masaStearsa.calorii;
              const proteineNoi = proteineConsumate - masaStearsa.proteine;
              const carbohidratiNoi = carbohidratiConsumati - masaStearsa.carbohidrati;
              const grasimiNoi = grasimiConsumate - masaStearsa.grasimi;

              setCaloriiConsumate(caloriiNoi);
              setProteineConsumate(proteineNoi);
              setCarbohidratiConsumati(carbohidratiNoi);
              setGrasimiConsumate(grasimiNoi);

              const meseNoi = mese.filter(masa => masa._id !== id);
              setMese(meseNoi);
            } catch (error) {
              console.error('Eroare la ștergerea mesei:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge masa.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const preiaDate = async (dataFormatata) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token invalid sau lipsă');
        return;
      }

      console.log('Se preiau datele pentru data:', dataFormatata);
      const [goalsResponse, mealsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/alimentatie/obiective/${dataFormatata}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/alimentatie/mese/${dataFormatata}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(error => {
          if (error.response && error.response.status === 404) {
            return { data: [] };
          }
          throw error;
        })
      ]);

      const { calorii, proteine, carbohidrati, grasimi } = goalsResponse.data;
      setCaloriiTotale(calorii);
      setProteineTotale(proteine);
      setCarbohidratiTotali(carbohidrati);
      setGrasimiTotale(grasimi);
      
      const meseNoi = mealsResponse.data;
      setMese(meseNoi);

      const consumat = meseNoi.reduce((acc, masa) => {
        acc.calorii += masa.calorii;
        acc.proteine += masa.proteine;
        acc.carbohidrati += masa.carbohidrati;
        acc.grasimi += masa.grasimi;
        return acc;
      }, { calorii: 0, proteine: 0, carbohidrati: 0, grasimi: 0 });

      setCaloriiConsumate(consumat.calorii);
      setProteineConsumate(consumat.proteine);
      setCarbohidratiConsumati(consumat.carbohidrati);
      setGrasimiConsumate(consumat.grasimi);
    } catch (error) {
      console.error('Eroare detaliată:', error.response?.data || error.message); 
      Alert.alert('Eroare', 'Nu s-au putut încărca datele. Verifică conexiunea la server.');
    }
  };

  useEffect(() => {
    const data = new Date();
    const zi = String(data.getDate()).padStart(2, '0');
    const luna = String(data.getMonth() + 1).padStart(2, '0');
    const an = data.getFullYear();
    const dataFormatata = `${zi}.${luna}.${an}`;
    console.log('Data formatată:', dataFormatata);
    setDataCurenta(dataFormatata);
    preiaDate(dataFormatata); 
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (dataCurenta) {
        preiaDate(dataCurenta);
      }
    }, [dataCurenta])
  );

  const caloriiProgres = caloriiTotale ? caloriiConsumate / caloriiTotale : 0;
  const proteineProgres = proteineTotale ? proteineConsumate / proteineTotale : 0;
  const carbohidratiProgres = carbohidratiTotali ? carbohidratiConsumati / carbohidratiTotali : 0;
  const grasimiProgres = grasimiTotale ? grasimiConsumate / grasimiTotale : 0;

  const calculRamas = (total, consumate) => total - consumate;

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/Alimentatie.png')} style={styles.image} />
      <TouchableOpacity onPress={() => navigare.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.cercuriMacronutrienti}>
        <View style={styles.cercContainer}>
          <Text style={styles.label}>Calorii</Text>
          <Circle size={70} progress={caloriiProgres} showsText={true} textStyle={styles.procent} color="#FF5733" unfilledColor="#ddd" thickness={12} />
          <Text style={styles.progresText}>{caloriiConsumate} / {caloriiTotale}kcal</Text>
          <Text style={styles.restCalorii}>Rămas: {calculRamas(caloriiTotale, caloriiConsumate)}kcal</Text>
        </View>
        <View style={styles.cercContainer}>
          <Text style={styles.label}>Proteine</Text>
          <Circle size={70} progress={proteineProgres} showsText={true} textStyle={styles.procent} color="#8D33FF" unfilledColor="#ddd" thickness={12} />
          <Text style={styles.progresText}>{proteineConsumate} / {proteineTotale}g</Text>
          <Text style={styles.restCalorii}>Rămas: {calculRamas(proteineTotale, proteineConsumate)}g</Text>
        </View>
        <View style={styles.cercContainer}>
          <Text style={styles.label}>Carbohidrați</Text>
          <Circle size={70} progress={carbohidratiProgres} showsText={true} textStyle={styles.procent} color="#3b9e20" unfilledColor="#ddd" thickness={12} />
          <Text style={styles.progresText}>{carbohidratiConsumati} / {carbohidratiTotali}g</Text>
          <Text style={styles.restCalorii}>Rămas: {calculRamas(carbohidratiTotali, carbohidratiConsumati)}g</Text>
        </View>
        <View style={styles.cercContainer}>
          <Text style={styles.label}>Grăsimi</Text>
          <Circle size={70} progress={grasimiProgres} showsText={true} textStyle={styles.procent} color="#FFC300" unfilledColor="#ddd" thickness={12} />
          <Text style={styles.progresText}>{grasimiConsumate} / {grasimiTotale}g</Text>
          <Text style={styles.restCalorii}>Rămas: {calculRamas(grasimiTotale, grasimiConsumate)}g</Text>
        </View>
      </View>

      <Text style={styles.dateText}>Mesele de azi - {dataCurenta}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listaContainer}>
        {mese.map((masa) => (
          <View key={masa._id} style={[styles.pokedexCard, { backgroundColor: masa.culoare || '#4A90E2' }]}>
            <View style={styles.pokedexCardHeader}>
              <Text style={styles.pokedexCardType}>{masa.tip || 'Masă'}</Text>
            </View>
            <View style={styles.pokedexCardContent}>
              <Text style={styles.pokedexCardTitle}>{masa.nume}</Text>
              <Text style={styles.pokedexCardInfo}>{masa.calorii} calorii</Text>
              <View style={styles.macroContainer}>
                <Text key="proteine" style={styles.pokedexCardMacro}>P: {masa.proteine}g</Text>
                <Text key="carbohidrati" style={styles.pokedexCardMacro}>C: {masa.carbohidrati}g</Text>
                <Text key="grasimi" style={styles.pokedexCardMacro}>G: {masa.grasimi}g</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => stergeMasa(masa._id)} style={styles.iconContainer}>
              <Icon name="trash" size={20} color="#032851" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.butoaneContainerRand}>
        <TouchableOpacity style={styles.butonStanga} onPress={() => setSelecteazaTipMasaVizibil(true)}>
          <Text style={styles.textButon}>Adaugă o masă</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.butonDreapta} onPress={() => navigare.navigate('MeseAnterioare')}>
          <Text style={styles.textButon}>Mese trecute</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={selecteazaTipMasaVizibil} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.selectTipContainer}>
            <View style={styles.modalTipMasaContainer}>
              <View style={styles.modalTipMasaHeader}>
                <Text style={styles.modalTipMasaTitle}>Selectează Tipul Mesei</Text>
              </View>
              
              <View style={styles.tipuriContainer}>
                {['Mic dejun', 'Prânz', 'Cină', 'Gustare'].map((tip) => (
                  <TouchableOpacity
                    key={tip}
                    style={[styles.modalTipMasaButton, { backgroundColor: culoriMese[tip] }]}
                    onPress={() => {
                      setTipMasa(tip);
                      setCuloareMasa(culoriMese[tip]);
                      setSelecteazaTipMasaVizibil(false);
                      setModalVizibil(true);
                    }}
                  >
                    <Text style={styles.modalTipMasaButonText}>{tip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.modalTipMasaButonInapoi}
                onPress={() => setSelecteazaTipMasaVizibil(false)}
              >
                <Text style={styles.modalTipMasaTextInapoi}>Anulează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.butoaneContainer}>
        <TouchableOpacity style={styles.buton} onPress={() => navigare.navigate('Calculator')}>
          <Text style={styles.textButon}>Calculator calorii și macronutrienți</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVizibil} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: culoareMasa || '#4A90E2' }]}>
              <Text style={styles.modalTitle}>{tipMasa ? `Adaugă ${tipMasa}` : 'Adaugă o masă'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Nume masă"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                onChangeText={setNumeMasa}
                value={numeMasa}
              />
              <TextInput
                style={styles.input}
                placeholder="Calorii"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                onChangeText={setCaloriiMasa}
                value={caloriiMasa}
              />
              <TextInput
                style={styles.input}
                placeholder="Proteine (g)"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                onChangeText={setProteineMasa}
                value={proteineMasa}
              />
              <TextInput
                style={styles.input}
                placeholder="Carbohidrați (g)"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                onChangeText={setCarbohidratiMasa}
                value={carbohidratiMasa}
              />
              <TextInput
                style={styles.input}
                placeholder="Grăsimi (g)"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                onChangeText={setGrasimiMasa}
                value={grasimiMasa}
              />

              <View style={styles.butoaneModal}>
                <TouchableOpacity style={styles.butonAdauga} onPress={adaugaMasa}>
                  <Text style={styles.textButon}>Adaugă</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.butonInchide} onPress={() => setModalVizibil(false)}>
                  <Text style={styles.textButon}>Închide</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  butonInapoi: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    padding: 10,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    alignItems: 'center',
  },
  cercuriMacronutrienti: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 220,
  },
  cercContainer: {
    alignItems: 'center',
    marginHorizontal: -5,
  },
  label: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  progresText: {
    fontSize: 13,
    color: '#fff',
    marginTop: 5,
  },
  procent: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  restCalorii: {
    fontSize: 12,
    color: '#8caee0',
    marginTop: 5,
  },
  butoaneContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: -8,
    marginBottom: 30,
  },
  butoaneContainerRand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  butonStanga: {
    backgroundColor: '#032851',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  butonDreapta: {
    backgroundColor: '#032851',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  buton: {
    backgroundColor: '#032851',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  textButon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectTipContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTipMasaContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    borderWidth: 4,
    borderColor: '#032851',
  },
  modalTipMasaHeader: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#032851',
    paddingBottom: 10,
  },
  modalTipMasaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#032851',
  },
  tipuriContainer: {
    marginBottom: 5,
  },
  modalTipMasaButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalTipMasaButonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalTipMasaButonInapoi: {
    alignItems: 'center',
  },
  modalTipMasaTextInapoi: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 15,
    width: 320,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    color: '#032851',
    fontSize: 16,
  },
  butoaneModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  butonAdauga: {
    backgroundColor: '#032851',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  butonInchide: {
    backgroundColor: '#032851',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  listaContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  pokedexCard: {
    width: 250,
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 15,
    borderColor: '#fff',
    marginBottom: 27,
  },
  pokedexCardHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  pokedexCardType: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pokedexCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  pokedexCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  pokedexCardInfo: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pokedexCardMacro: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  pokedexDeleteButton: {
    backgroundColor: '#DC3545',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BD2130',
  },
  pokedexDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'absolute',
    top: 7,
    right: 7,
    padding: 5
  },
});

export default Alimentatie;