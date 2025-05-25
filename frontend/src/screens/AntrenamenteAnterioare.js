import React, { useEffect, useState } from 'react';
import { View, Image, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Dimensions, TextInput, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const AntrenamenteAnterioare = () => {
  const navigare = useNavigation();
  const [antrenamente, setAntrenamente] = useState([]);
  const [token, setToken] = useState('');
  const [cautare, setCautare] = useState('');
  const [sortare, setSortare] = useState({
    criteriu: 'data', // 'data' sau 'durata'
    directie: 'desc' // 'asc' sau 'desc'
  });
  const [showFiltre, setShowFiltre] = useState(false);
  const [showFiltreModal, setShowFiltreModal] = useState(false);
  const [filtruTip, setFiltruTip] = useState('');

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

  useEffect(() => {
    if (token) {
      incarcaAntrenamente();
    }
  }, [token]);

  const incarcaAntrenamente = async () => {
    try {
      const response = await fetch('http://172.20.10.3:5000/api/antrenamente', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Eroare la încărcarea antrenamentelor');
      }

      const data = await response.json();
      setAntrenamente(data);
      } catch (error) {
        console.error('Eroare la încărcarea antrenamentelor:', error);
        Alert.alert('Eroare', 'Nu s-au putut încărca antrenamentele anterioare.');
      }
    };

  const stergeAntrenament = async (id) => {
    Alert.alert(
      'Confirmare',
      'Sigur vrei să ștergi acest antrenament?',
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Șterge', onPress: async () => {
          try {
            const response = await fetch(`http://172.20.10.3:5000/api/antrenamente/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) {
              throw new Error('Eroare la ștergerea antrenamentului');
            }

            setAntrenamente(antrenamente.filter(item => item._id !== id));
            Alert.alert('Succes', 'Antrenamentul a fost șters!');
          } catch (error) {
            console.error('Eroare la ștergerea antrenamentului:', error);
            Alert.alert('Eroare', 'Nu s-a putut șterge antrenamentul.');
          }
        }, style: 'destructive' }
      ]
    );
  };

  const formatareData = (dataString) => {
    const data = new Date(dataString);
    const zi = data.getDate().toString().padStart(2, '0');
    const luna = (data.getMonth() + 1).toString().padStart(2, '0');
    const an = data.getFullYear();
    
    const zile = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    const ziua = zile[data.getDay()];
    
    return {
      data: `${zi}/${luna}/${an}`,
      ziua: ziua
    };
  };

  const antrenamenteFiltrate = antrenamente
    .filter(antrenament => {
      const matchCautare = cautare === '' || 
        antrenament.tip.toLowerCase().includes(cautare.toLowerCase()) ||
        antrenament.exercitii.some(ex => 
          ex.numeExercitiu.toLowerCase().includes(cautare.toLowerCase())
        );

      const matchFiltruTip = !filtruTip || antrenament.tip === filtruTip;

      return matchCautare && matchFiltruTip;
    })
    .sort((a, b) => {
      if (sortare.criteriu === 'data') {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return sortare.directie === 'asc' ? dataA - dataB : dataB - dataA;
      } else {
        // Sortare după durată
        const durataA = parseInt(a.timp) || 0;
        const durataB = parseInt(b.timp) || 0;
        return sortare.directie === 'asc' ? durataA - durataB : durataB - durataA;
      }
    });

  const renderItem = ({ item }) => {
    console.log('Antrenament primit:', item); // Pentru debugging

    // Mapăm tipurile de antrenament la culori specifice
    const culoriAntrenament = {
      'Leg Day': '#FF6B6B',      // Roșu pentru Leg Day
      'Pull Day': '#4ECDC4',     // Turcoaz pentru Pull Day
      'Push Day': '#45B7D1',     // Albastru pentru Push Day
      'Personalizat': '#032851'  // Albastru Morphit pentru Personalizat
    };

    const culoareAntrenament = culoriAntrenament[item.tip] || '#032851';
    const dataFormatata = formatareData(item.data);

    return (
      <View style={[styles.antrenamentCard, { borderColor: '#032851' }]}>
        <View style={[styles.antrenamentHeader, { backgroundColor: '#032851' }]}>
          <View style={styles.tipContainer}>
            <Icon name="fitness-outline" size={20} color="#fff" />
            <Text style={styles.antrenamentTitlu}>{item.tip || 'Personalizat'}</Text>
          </View>
        </View>
        
        <View style={styles.antrenamentDetalii}>
          <View style={styles.infoContainer}>
            <View style={styles.dataContainer}>
              <Text style={styles.antrenamentZiua}>{dataFormatata.ziua}</Text>
              <Text style={styles.antrenamentData}>{dataFormatata.data}</Text>
            </View>
            <View style={styles.durataContainer}>
              <Icon name="time-outline" size={18} color="#032851" />
              <Text style={styles.antrenamentInfo}>{item.timp} minute</Text>
            </View>
          </View>
        </View>

        <View style={styles.exercitiiContainer}>
          {item.exercitii.map((exercitiu, index) => {
            console.log('Exercițiu:', exercitiu); // Pentru debugging
            return (
              <View key={index} style={[styles.exercitiuItem, { borderLeftColor: culoareAntrenament }]}>
                <View style={styles.exercitiuHeader}>
                  <Icon name="barbell-outline" size={18} color="#032851" />
                  <Text style={styles.exercitiuNume}>{exercitiu.numeExercitiu}</Text>
                </View>
                <View style={styles.seturiContainer}>
                  {exercitiu.seturi.map((set, setIndex) => {
                    console.log('Set:', set); // Pentru debugging
                    return (
                      <View key={setIndex} style={styles.setItem}>
                        <View style={[styles.setBadge, { backgroundColor: '#032851' }]}>
                          <Text style={styles.setBadgeText}>Set {setIndex + 1}</Text>
                        </View>
                        <View style={styles.setDetalii}>
                          <Text style={styles.exercitiuDetalii}>
                            {set.repetari || 0} repetări
                          </Text>
                          {set.greutate > 0 && (
                            <Text style={[styles.exercitiuDetalii, styles.greutate]}>
                              {set.greutate} kg
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity 
          style={[styles.butonSterge, { backgroundColor: '#032851' }]}
          onPress={() => stergeAntrenament(item._id)}
        >
          <Icon name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/AntrenamenteAnterioare.png')} style={styles.image} />

      <TouchableOpacity onPress={() => navigare.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#fff" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută după tip sau exercițiu..."
            value={cautare}
            onChangeText={setCautare}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity 
            onPress={() => setShowFiltreModal(true)}
            style={styles.filtreButon}
          >
            <Icon name="options" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={antrenamenteFiltrate}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
                </View>

      <TouchableOpacity 
        style={styles.butonAdaugaAntrenament}
        onPress={() => navigare.navigate('AdaugaAntrenament')}
      >
        <Text style={styles.textButonAdauga}>+ Adaugă Antrenament</Text>
      </TouchableOpacity>

      {/* Modal pentru filtrare și sortare */}
      <Modal
        visible={showFiltreModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalWhiteContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtre și Sortare</Text>
                <TouchableOpacity 
                  onPress={() => setShowFiltreModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#032851" />
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                <View style={styles.modalBody}>
                  <View style={styles.filtreSection}>
                    <View style={styles.sectionHeader}>
                      <Icon name="fitness" size={24} color="#032851" />
                      <Text style={styles.sectionTitle}>Filtrare după tip antrenament</Text>
                    </View>
                    <View style={styles.filtreButoaneContainer}>
                      <TouchableOpacity 
                        style={[styles.filtruButon, !filtruTip && styles.filtruButonActiv]}
                        onPress={() => setFiltruTip('')}
                      >
                        <Icon name="apps" size={20} color={!filtruTip ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, !filtruTip && styles.filtruTextActiv]}>Toate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruTip === 'Leg Day' && styles.filtruButonActiv]}
                        onPress={() => setFiltruTip('Leg Day')}
                      >
                        <Icon name="barbell" size={20} color={filtruTip === 'Leg Day' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruTip === 'Leg Day' && styles.filtruTextActiv]}>Leg Day</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruTip === 'Pull Day' && styles.filtruButonActiv]}
                        onPress={() => setFiltruTip('Pull Day')}
                      >
                        <Icon name="barbell" size={20} color={filtruTip === 'Pull Day' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruTip === 'Pull Day' && styles.filtruTextActiv]}>Pull Day</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, filtruTip === 'Push Day' && styles.filtruButonActiv]}
                        onPress={() => setFiltruTip('Push Day')}
                      >
                        <Icon name="barbell" size={20} color={filtruTip === 'Push Day' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, filtruTip === 'Push Day' && styles.filtruTextActiv]}>Push Day</Text>
                      </TouchableOpacity>
                    </View>
                    </View>
                    
                  <View style={styles.filtreSection}>
                    <View style={styles.sectionHeader}>
                      <Icon name="swap-vertical" size={24} color="#032851" />
                      <Text style={styles.sectionTitle}>Sortare</Text>
                          </View>
                    <View style={styles.filtreButoaneContainer}>
                      <TouchableOpacity 
                        style={[styles.filtruButon, sortare.criteriu === 'data' && styles.filtruButonActiv]}
                        onPress={() => setSortare(prev => ({ ...prev, criteriu: 'data' }))}
                      >
                        <Icon name="calendar" size={20} color={sortare.criteriu === 'data' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, sortare.criteriu === 'data' && styles.filtruTextActiv]}>Data</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.filtruButon, sortare.criteriu === 'durata' && styles.filtruButonActiv]}
                        onPress={() => setSortare(prev => ({ ...prev, criteriu: 'durata' }))}
                      >
                        <Icon name="time" size={20} color={sortare.criteriu === 'durata' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, sortare.criteriu === 'durata' && styles.filtruTextActiv]}>Durată</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.sortareDirectieContainer}>
                      <TouchableOpacity 
                        style={[styles.sortareDirectieButon, sortare.directie === 'desc' && styles.sortareDirectieButonActiv]}
                        onPress={() => setSortare(prev => ({ ...prev, directie: 'desc' }))}
                      >
                        <Icon name="arrow-down" size={20} color={sortare.directie === 'desc' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, sortare.directie === 'desc' && styles.filtruTextActiv]}>Descrescător</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.sortareDirectieButon, sortare.directie === 'asc' && styles.sortareDirectieButonActiv]}
                        onPress={() => setSortare(prev => ({ ...prev, directie: 'asc' }))}
                      >
                        <Icon name="arrow-up" size={20} color={sortare.directie === 'asc' ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruText, sortare.directie === 'asc' && styles.filtruTextActiv]}>Crescător</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
              </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 100,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  screen: {
    width: '100%',
    padding: 10,
    marginTop: 150, // Ajustat pentru a lăsa spațiu pentru bara de căutare
    height: '60%',
  },
  lista: {
    paddingBottom: 10,
  },
  antrenamentCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  antrenamentHeader: {
    padding: 15,
    borderBottomWidth: 0,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  antrenamentTitlu: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  antrenamentDetalii: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(3, 40, 81, 0.1)',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataContainer: {
    flex: 1,
  },
  durataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 20,
  },
  antrenamentZiua: {
    fontSize: 16,
    color: '#032851',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  antrenamentData: {
    fontSize: 14,
    color: '#666',
  },
  antrenamentInfo: {
    fontSize: 15,
    color: '#032851',
    fontWeight: '500',
  },
  exercitiiContainer: {
    padding: 15,
  },
  exercitiuItem: {
    backgroundColor: 'rgba(3, 40, 81, 0.03)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  exercitiuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exercitiuNume: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
    flex: 1,
  },
  seturiContainer: {
    marginLeft: 26,
  },
  setItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  setBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  setBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  setDetalii: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exercitiuDetalii: {
    fontSize: 14,
    color: '#666',
  },
  greutate: {
    color: '#032851',
    fontWeight: '500',
  },
  butonSterge: {
    position: 'absolute',
    top: 7,
    right: 15,
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  butonAdaugaAntrenament: {
    position: 'absolute',
    bottom: 35,
    left: 20,
    right: 20,
    backgroundColor: '#032851',
    padding: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 0,
  },
  textButonAdauga: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#032851',
    fontSize: 16,
    marginLeft: 10,
  },
  filterButton: {
    padding: 8,
    marginLeft: 10,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#032851',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  sortOptions: {
    gap: 10,
    marginBottom: 15,
  },
  directionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  directionButtonActive: {
    backgroundColor: '#032851',
  },
  directionButtonText: {
    fontSize: 14,
    color: '#032851',
    fontWeight: '500',
  },
  directionButtonTextActive: {
    color: '#fff',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    gap: 10,
  },
  modalOptionActive: {
    backgroundColor: '#032851',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#032851',
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: '#fff',
  },
  modalCloseButton: {
    backgroundColor: '#032851',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingTop: 260,
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  listContainer: {
    paddingBottom: 20,
    marginTop: 10,
  },
});

export default AntrenamenteAnterioare;