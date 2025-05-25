import React, { useEffect, useState } from 'react';
import { View, Image, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = 'http://172.20.10.3:5000';

const MeseAnterioare = () => {
  const navigare = useNavigation();
  const [zileMese, setZileMese] = useState([]);
  const [cautare, setCautare] = useState('');
  const [filtruCalorii, setFiltruCalorii] = useState('toate');
  const [sortare, setSortare] = useState('data');
  const [sortareDirectie, setSortareDirectie] = useState('desc');
  const [filtruProteine, setFiltruProteine] = useState('toate');
  const [filtruCarbohidrati, setFiltruCarbohidrati] = useState('toate');
  const [filtruGrasimi, setFiltruGrasimi] = useState('toate');
  const [modalFiltre, setModalFiltre] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const culoriMese = {
    'Mic dejun': '#ffbf00',
    'Gustare': '#fa8900',
    'Prânz': '#fa5477',
    'Cină': '#01b4bc'
  };

  useEffect(() => {
    const preiaZileMese = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://172.20.10.3:5000/alimentatie/istoric', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Răspuns istoric:', response.data);
        setZileMese(response.data);
      } catch (error) {
        console.error('Eroare la încărcarea zilelor:', error);
        Alert.alert('Eroare', 'Nu s-au putut încărca zilele de mese');
      }
    };

    preiaZileMese();
  }, []);

  const calculeazaProcent = (consumat, total) => {
    return total > 0 ? Math.min(Math.round((consumat / total) * 100), 100) : 0;
  };

  const stergeZi = async (index) => {
    Alert.alert('Ștergere', 'Ești sigur că vrei să ștergi toate mesele din această zi?', [
      {
        text: 'Anulează',
        style: 'cancel',
      },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const ziDeSters = zileMese[index];
            if (!ziDeSters) return;

            console.log('Ziua de șters:', ziDeSters);
            console.log('Data originală:', ziDeSters.data);

            let dataFormatata = ziDeSters.data;
            if (dataFormatata.includes('-')) {
              const [an, luna, ziua] = dataFormatata.split('-');
              dataFormatata = `${ziua}.${luna}.${an}`;
            }

            console.log('Data formatată pentru ștergere:', dataFormatata);

            await axios.delete(`${API_BASE_URL}/alimentatie/mese/data/${dataFormatata}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const zileActualizate = [...zileMese];
            zileActualizate.splice(index, 1);
            setZileMese(zileActualizate);

            const response = await axios.get(`${API_BASE_URL}/alimentatie/istoric`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setZileMese(response.data);
          } catch (error) {
            console.error('Eroare la ștergerea zilei:', error);
            Alert.alert('Eroare', 'Nu s-a putut șterge ziua');
          }
        },
      },
    ]);
  };

  const renderMeseZi = ({ item, index }) => {
    const dataFormatata = item.data.split('-').reverse().join('.');
    
    const sumar = {
      caloriiConsumate: item.mese.reduce((acc, masa) => acc + masa.calorii, 0),
      proteineConsumate: item.mese.reduce((acc, masa) => acc + masa.proteine, 0),
      carbohidratiConsumati: item.mese.reduce((acc, masa) => acc + masa.carbohidrati, 0),
      grasimiConsumate: item.mese.reduce((acc, masa) => acc + masa.grasimi, 0),
      caloriiTotale: item.obiective?.calorii || 2000,
      proteineTotale: item.obiective?.proteine || 150,
      carbohidratiTotali: item.obiective?.carbohidrati || 250,
      grasimiTotale: item.obiective?.grasimi || 70
    };
    
    const caloriiProcent = calculeazaProcent(sumar.caloriiConsumate, sumar.caloriiTotale);
    const proteineProcent = calculeazaProcent(sumar.proteineConsumate, sumar.proteineTotale);
    const carbohidratiProcent = calculeazaProcent(sumar.carbohidratiConsumati, sumar.carbohidratiTotali);
    const grasimiProcent = calculeazaProcent(sumar.grasimiConsumate, sumar.grasimiTotale);

    return (
      <TouchableOpacity 
        style={styles.cardContainer}
        onPress={() => {
          setSelectedDay(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.dataText}>{dataFormatata}</Text>
            <TouchableOpacity 
              onPress={() => stergeZi(index)} 
              style={styles.stergeButon}
            >
              <Icon name="trash" size={20} color="#032851" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.caloriiContainer}>
            <View style={styles.caloriiInfo}>
              <Icon name="flame" size={24} color="#FF5733" />
              <Text style={[styles.caloriiText, { color: '#FF5733' }]}>
                {sumar.caloriiConsumate} / {sumar.caloriiTotale} kcal
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${caloriiProcent}%`, backgroundColor: '#FF5733' }
                ]} 
              />
            </View>
          </View>

          <View style={styles.meseList}>
            {item.mese.map((masa, idx) => (
              <View key={idx} style={styles.masaItem}>
                <Text style={styles.masaText}>
                  • {masa.nume}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalWhiteContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDay?.data.split('-').reverse().join('.')}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#032851" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.progressSection}>
                <View style={styles.progressItem}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Calorii</Text>
                    <Text style={[styles.progressValue, { color: '#FF5733' }]}>
                      {selectedDay?.mese.reduce((acc, masa) => acc + masa.calorii, 0)} / {selectedDay?.obiective?.calorii || 2000} kcal
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${calculeazaProcent(
                          selectedDay?.mese.reduce((acc, masa) => acc + masa.calorii, 0),
                          selectedDay?.obiective?.calorii || 2000
                        )}%`, 
                        backgroundColor: '#FF5733' }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.progressItem}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Proteine</Text>
                    <Text style={[styles.progressValue, { color: '#8D33FF' }]}>
                      {selectedDay?.mese.reduce((acc, masa) => acc + masa.proteine, 0)}g / {selectedDay?.obiective?.proteine || 150}g P
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${calculeazaProcent(
                          selectedDay?.mese.reduce((acc, masa) => acc + masa.proteine, 0),
                          selectedDay?.obiective?.proteine || 150
                        )}%`, 
                        backgroundColor: '#8D33FF' }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.progressItem}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Carbohidrați</Text>
                    <Text style={[styles.progressValue, { color: '#3b9e20' }]}>
                      {selectedDay?.mese.reduce((acc, masa) => acc + masa.carbohidrati, 0)}g / {selectedDay?.obiective?.carbohidrati || 250}g C
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${calculeazaProcent(
                          selectedDay?.mese.reduce((acc, masa) => acc + masa.carbohidrati, 0),
                          selectedDay?.obiective?.carbohidrati || 250
                        )}%`, 
                        backgroundColor: '#3b9e20' }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.progressItem}>
                  <View style={styles.progressLabelContainer}>
                    <Text style={styles.progressLabel}>Grăsimi</Text>
                    <Text style={[styles.progressValue, { color: '#FFC300' }]}>
                      {selectedDay?.mese.reduce((acc, masa) => acc + masa.grasimi, 0)}g / {selectedDay?.obiective?.grasimi || 70}g G
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${calculeazaProcent(
                          selectedDay?.mese.reduce((acc, masa) => acc + masa.grasimi, 0),
                          selectedDay?.obiective?.grasimi || 70
                        )}%`, 
                        backgroundColor: '#FFC300' }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              <View style={styles.meseList}>
                <Text style={styles.meseTitle}>Mese:</Text>
                {['Mic dejun', 'Prânz', 'Cină', 'Gustare'].map((tipMasa) => {
                  const meseFiltrate = selectedDay?.mese.filter(masa => masa.tip === tipMasa) || [];
                  if (meseFiltrate.length === 0) return null;
                  
                  return (
                    <View key={tipMasa} style={[styles.tipMasaContainer, { backgroundColor: culoriMese[tipMasa] }]}>
                      <View style={styles.tipMasaTitleContainer}>
                        <Text style={styles.tipMasaTitle}>{tipMasa}</Text>
                      </View>
                      {meseFiltrate.map((masa, idx) => (
                        <View key={idx} style={styles.masaItem}>
                          <Text style={styles.masaText}>
                            • {masa.nume}: {masa.calorii} kcal, {masa.proteine}g P, {masa.carbohidrati}g C, {masa.grasimi}g G
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  const zileFiltrate = zileMese
    .filter((zi) => {
      const matchCautare = cautare === '' || 
        zi.data.toLowerCase().includes(cautare.toLowerCase()) ||
        zi.mese.some(masa => 
          masa.nume.toLowerCase().includes(cautare.toLowerCase()) ||
          masa.ingrediente?.some(ing => ing.toLowerCase().includes(cautare.toLowerCase()))
        );

      const caloriiConsumate = zi.mese.reduce((acc, masa) => acc + masa.calorii, 0);
      const caloriiObiectiv = zi.obiective?.calorii || 2000;
      
      let matchFiltruCalorii = true;
      if (filtruCalorii === 'depasit') {
        matchFiltruCalorii = caloriiConsumate > caloriiObiectiv;
      } else if (filtruCalorii === 'sub') {
        matchFiltruCalorii = caloriiConsumate <= caloriiObiectiv;
      }

      const proteineConsumate = zi.mese.reduce((acc, masa) => acc + masa.proteine, 0);
      const carbohidratiConsumati = zi.mese.reduce((acc, masa) => acc + masa.carbohidrati, 0);
      const grasimiConsumate = zi.mese.reduce((acc, masa) => acc + masa.grasimi, 0);

      const proteineObiectiv = zi.obiective?.proteine || 150;
      const carbohidratiObiectiv = zi.obiective?.carbohidrati || 250;
      const grasimiObiectiv = zi.obiective?.grasimi || 70;

      let matchFiltruProteine = true;
      if (filtruProteine === 'depasit') {
        matchFiltruProteine = proteineConsumate > proteineObiectiv;
      } else if (filtruProteine === 'sub') {
        matchFiltruProteine = proteineConsumate <= proteineObiectiv;
      }

      let matchFiltruCarbohidrati = true;
      if (filtruCarbohidrati === 'depasit') {
        matchFiltruCarbohidrati = carbohidratiConsumati > carbohidratiObiectiv;
      } else if (filtruCarbohidrati === 'sub') {
        matchFiltruCarbohidrati = carbohidratiConsumati <= carbohidratiObiectiv;
      }

      let matchFiltruGrasimi = true;
      if (filtruGrasimi === 'depasit') {
        matchFiltruGrasimi = grasimiConsumate > grasimiObiectiv;
      } else if (filtruGrasimi === 'sub') {
        matchFiltruGrasimi = grasimiConsumate <= grasimiObiectiv;
      }

      return matchCautare && matchFiltruCalorii && matchFiltruProteine && matchFiltruCarbohidrati && matchFiltruGrasimi && zi.mese && zi.mese.length > 0;
    })
    .sort((a, b) => {
      let comparatie = 0;
      
      if (sortare === 'data') {
        const dataA = a.data.split('.').reverse().join('-');
        const dataB = b.data.split('.').reverse().join('-');
        comparatie = new Date(dataB) - new Date(dataA);
      } else if (sortare === 'calorii') {
        const caloriiA = a.mese.reduce((acc, masa) => acc + masa.calorii, 0);
        const caloriiB = b.mese.reduce((acc, masa) => acc + masa.calorii, 0);
        comparatie = caloriiB - caloriiA;
      } else if (sortare === 'proteine') {
        const proteineA = a.mese.reduce((acc, masa) => acc + masa.proteine, 0);
        const proteineB = b.mese.reduce((acc, masa) => acc + masa.proteine, 0);
        comparatie = proteineB - proteineA;
      } else if (sortare === 'carbohidrati') {
        const carbohidratiA = a.mese.reduce((acc, masa) => acc + masa.carbohidrati, 0);
        const carbohidratiB = b.mese.reduce((acc, masa) => acc + masa.carbohidrati, 0);
        comparatie = carbohidratiB - carbohidratiA;
      } else if (sortare === 'grasimi') {
        const grasimiA = a.mese.reduce((acc, masa) => acc + masa.grasimi, 0);
        const grasimiB = b.mese.reduce((acc, masa) => acc + masa.grasimi, 0);
        comparatie = grasimiB - grasimiA;
      }

      return sortareDirectie === 'desc' ? comparatie : -comparatie;
    });

  const renderModalFiltre = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalFiltre}
      onRequestClose={() => setModalFiltre(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalWhiteContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtre și Sortare</Text>
              <TouchableOpacity 
                onPress={() => setModalFiltre(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#032851" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.modalBody}>
                <View style={styles.filtreSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="flame" size={24} color="#032851" />
                    <Text style={styles.sectionTitle}>Filtrare după calorii</Text>
                  </View>
                  <View style={styles.filtreButoaneContainer}>
                    <TouchableOpacity 
                      style={[styles.filtruButon, filtruCalorii === 'toate' && styles.filtruButonActiv]}
                      onPress={() => setFiltruCalorii('toate')}
                    >
                      <Icon name="apps" size={20} color={filtruCalorii === 'toate' ? '#fff' : '#032851'} />
                      <Text style={[styles.filtruText, filtruCalorii === 'toate' && styles.filtruTextActiv]}>Toate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.filtruButon, filtruCalorii === 'depasit' && styles.filtruButonActiv]}
                      onPress={() => setFiltruCalorii('depasit')}
                    >
                      <Icon name="trending-up" size={20} color={filtruCalorii === 'depasit' ? '#fff' : '#032851'} />
                      <Text style={[styles.filtruText, filtruCalorii === 'depasit' && styles.filtruTextActiv]}>Depășit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.filtruButon, filtruCalorii === 'sub' && styles.filtruButonActiv]}
                      onPress={() => setFiltruCalorii('sub')}
                    >
                      <Icon name="trending-down" size={20} color={filtruCalorii === 'sub' ? '#fff' : '#032851'} />
                      <Text style={[styles.filtruText, filtruCalorii === 'sub' && styles.filtruTextActiv]}>Sub obiectiv</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.filtreSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="nutrition" size={24} color="#032851" />
                    <Text style={styles.sectionTitle}>Filtrare după macronutrienți</Text>
                  </View>
                  
                  <View style={styles.macroContainer}>
                    <Text style={styles.macroTitle}>Proteine</Text>
                    <View style={styles.filtreButoaneContainer}>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruProteine === 'toate' && styles.filtruButonActiv]}
                        onPress={() => setFiltruProteine('toate')}
                      >
                        <Icon name="apps" size={20} color={filtruProteine === 'toate' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruProteine === 'toate' && styles.filtruTextActiv]}>Toate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruProteine === 'depasit' && styles.filtruButonActiv]}
                        onPress={() => setFiltruProteine('depasit')}
                      >
                        <Icon name="trending-up" size={20} color={filtruProteine === 'depasit' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruProteine === 'depasit' && styles.filtruTextActiv]}>Depășit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruProteine === 'sub' && styles.filtruButonActiv]}
                        onPress={() => setFiltruProteine('sub')}
                      >
                        <Icon name="trending-down" size={20} color={filtruProteine === 'sub' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruProteine === 'sub' && styles.filtruTextActiv]}>Sub obiectiv</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.macroContainer}>
                    <Text style={styles.macroTitle}>Carbohidrați</Text>
                    <View style={styles.filtreButoaneContainer}>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruCarbohidrati === 'toate' && styles.filtruButonActiv]}
                        onPress={() => setFiltruCarbohidrati('toate')}
                      >
                        <Icon name="apps" size={20} color={filtruCarbohidrati === 'toate' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruCarbohidrati === 'toate' && styles.filtruTextActiv]}>Toate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruCarbohidrati === 'depasit' && styles.filtruButonActiv]}
                        onPress={() => setFiltruCarbohidrati('depasit')}
                      >
                        <Icon name="trending-up" size={20} color={filtruCarbohidrati === 'depasit' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruCarbohidrati === 'depasit' && styles.filtruTextActiv]}>Depășit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruCarbohidrati === 'sub' && styles.filtruButonActiv]}
                        onPress={() => setFiltruCarbohidrati('sub')}
                      >
                        <Icon name="trending-down" size={20} color={filtruCarbohidrati === 'sub' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruCarbohidrati === 'sub' && styles.filtruTextActiv]}>Sub obiectiv</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.macroContainer}>
                    <Text style={styles.macroTitle}>Grăsimi</Text>
                    <View style={styles.filtreButoaneContainer}>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruGrasimi === 'toate' && styles.filtruButonActiv]}
                        onPress={() => setFiltruGrasimi('toate')}
                      >
                        <Icon name="apps" size={20} color={filtruGrasimi === 'toate' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruGrasimi === 'toate' && styles.filtruTextActiv]}>Toate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruGrasimi === 'depasit' && styles.filtruButonActiv]}
                        onPress={() => setFiltruGrasimi('depasit')}
                      >
                        <Icon name="trending-up" size={20} color={filtruGrasimi === 'depasit' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruGrasimi === 'depasit' && styles.filtruTextActiv]}>Depășit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruGrasimi === 'sub' && styles.filtruButonActiv]}
                        onPress={() => setFiltruGrasimi('sub')}
                      >
                        <Icon name="trending-down" size={20} color={filtruGrasimi === 'sub' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruGrasimi === 'sub' && styles.filtruTextActiv]}>Sub obiectiv</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.filtreSection}>
                  <View style={styles.sectionHeader}>
                    <Icon name="swap-vertical" size={24} color="#032851" />
                    <Text style={styles.sectionTitle}>Sortare</Text>
                  </View>
                  <View style={styles.filtreButoaneContainer}>
                    <TouchableOpacity 
                      style={[styles.filtruButon, sortare === 'data' && styles.filtruButonActiv]}
                      onPress={() => setSortare('data')}
                    >
                      <Icon name="calendar" size={20} color={sortare === 'data' ? '#fff' : '#032851'} />
                      <Text style={[styles.filtruText, sortare === 'data' && styles.filtruTextActiv]}>Data</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.filtruButon, sortare === 'calorii' && styles.filtruButonActiv]}
                      onPress={() => setSortare('calorii')}
                    >
                      <Icon name="flame" size={20} color={sortare === 'calorii' ? '#fff' : '#032851'} />
                      <Text style={[styles.filtruText, sortare === 'calorii' && styles.filtruTextActiv]}>Calorii</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sortareDirectieContainer}>
                    <TouchableOpacity 
                      style={[styles.sortareDirectieButon, sortareDirectie === 'desc' && styles.sortareDirectieButonActiv]}
                      onPress={() => setSortareDirectie('desc')}
                    >
                      <Icon name="arrow-down" size={20} color={sortareDirectie === 'desc' ? '#fff' : '#032851'} />
                      <Text style={[styles.filtruText, sortareDirectie === 'desc' && styles.filtruTextActiv]}>Descrescător</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.sortareDirectieButon, sortareDirectie === 'asc' && styles.sortareDirectieButonActiv]}
                      onPress={() => setSortareDirectie('asc')}
                    >
                      <Icon name="arrow-up" size={20} color={sortareDirectie === 'asc' ? '#fff' : '#032851'} />
                      <Text style={[styles.filtruText, sortareDirectie === 'asc' && styles.filtruTextActiv]}>Crescător</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/MeseAnterioare.png')} style={styles.image} />

      <TouchableOpacity onPress={() => navigare.goBack()} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>  
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#fff" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută după dată sau mese"
            value={cautare}
            onChangeText={setCautare}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
          <TouchableOpacity 
            onPress={() => setModalFiltre(true)}
            style={styles.filtreButon}
          >
            <Icon name="options" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {zileFiltrate.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="restaurant" size={50} color="#fff" />
            <Text style={styles.emptyText}>Nu ai salvat încă nicio zi</Text>
          </View>
        ) : (
          <FlatList
            data={zileFiltrate}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderMeseZi}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {renderModal()}
      {renderModalFiltre()}
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
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingTop: 260,
    paddingHorizontal: 20,
  },
  butonInapoi: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(3, 40, 81, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 40, 81, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  filtreButon: {
    padding: 8,
  },
  filtreSection: {
    marginBottom: 0,
    backgroundColor: 'rgba(140, 174, 224, 0.15)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8caee0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
    marginLeft: 8,
  },
  filtreButoaneContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filtruButon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(140, 174, 224, 0.2)',
    borderWidth: 2,
    borderColor: '#8caee0',
    marginBottom: 4,
  },
  filtruButonActiv: {
    backgroundColor: '#8caee0',
    borderColor: '#8caee0',
  },
  filtruText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 5,
    fontWeight: '500',
  },
  filtruTextActiv: {
    color: '#032851',
  },
  sortareDirectieContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  sortareDirectieButon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(140, 174, 224, 0.2)',
    borderWidth: 1,
    borderColor: '#8caee0',
  },
  sortareDirectieButonActiv: {
    backgroundColor: '#8caee0',
    borderColor: '#8caee0',
  },
  cardContainer: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#032851',
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#032851',
  },
  stergeButon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(3, 40, 81, 0.1)',
  },
  caloriiContainer: {
    marginBottom: 15,
  },
  caloriiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  caloriiText: {
    fontSize: 16,
    color: '#032851',
    marginLeft: 8,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(3, 40, 81, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  meseList: {
    marginTop: 10,
  },
  masaItem: {
    paddingVertical: 4,
  },
  masaText: {
    fontSize: 14,
    color: '#032851',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#8caee0',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalWhiteContent: {
    padding: 12,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#8caee0',
  },
  modalBody: {
    gap: 12,
    paddingBottom: 60,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#032851',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(140, 174, 224, 0.2)',
  },
  modalScroll: {
    maxHeight: '90%',
  },
  progressSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(3, 40, 81, 0.05)',
    padding: 15,
    borderRadius: 15,
  },
  progressItem: {
    marginBottom: 15,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
  },
  progressValue: {
    fontSize: 16,
    color: '#032851',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 130,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
    marginTop: 10,
  },
  meseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#032851',
    marginTop: -20,
    marginBottom: 15,
  },
  tipMasaContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(3, 40, 81, 0.1)',
  },
  tipMasaTitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tipMasaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  macroContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(140, 174, 224, 0.1)',
    borderRadius: 10,
  },
  macroTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#032851',
    marginBottom: 8,
  },
});

export default MeseAnterioare;