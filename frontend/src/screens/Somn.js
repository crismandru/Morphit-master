import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, TextInput, Modal, TouchableWithoutFeedback, Keyboard, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const Somn = () => {
  const navigare = useNavigation();
  const [sesiuniSomn, setSesiuniSomn] = useState([]);
  const [sesiuniFiltrate, setSesiuniFiltrate] = useState([]);
  const [sortare, setSortare] = useState('recente');
  const [cautare, setCautare] = useState('');
  const [filtruRating, setFiltruRating] = useState(0);
  const [filtruDetalii, setFiltruDetalii] = useState({
    adormire: '',
    continuitate: '',
    odihnă: '',
    visare: '',
    stres: ''
  });
  const [modalFiltre, setModalFiltre] = useState(false);
  const isFocused = useIsFocused();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const incarcaSesiuniSomn = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://172.20.10.3:5000/somn', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSesiuniSomn(response.data);
          setSesiuniFiltrate(response.data);
        }
      } catch (error) {
        console.error('Eroare la încărcarea sesiunilor:', error);
        Alert.alert('Eroare', 'Nu s-au putut încărca sesiunile de somn');
      }
    };

    if (isFocused) incarcaSesiuniSomn();
  }, [isFocused]);

  useEffect(() => {
    filtreazaSesiuni();
  }, [sesiuniSomn, sortare, cautare, filtruRating, filtruDetalii]);

  const filtreazaSesiuni = () => {
    let rezultat = [...sesiuniSomn];

    if (filtruRating > 0) {
      rezultat = rezultat.filter(sesiune => sesiune.rating === filtruRating);
    }

    if (filtruDetalii.adormire) {
      rezultat = rezultat.filter(sesiune => 
        sesiune.detaliiCalitate.adormire === filtruDetalii.adormire
      );
    }

    if (filtruDetalii.continuitate) {
      rezultat = rezultat.filter(sesiune => 
        sesiune.detaliiCalitate.continuitate === filtruDetalii.continuitate
      );
    }

    if (filtruDetalii.odihnă) {
      rezultat = rezultat.filter(sesiune => 
        sesiune.detaliiCalitate.odihnă === filtruDetalii.odihnă
      );
    }

    if (filtruDetalii.visare) {
      rezultat = rezultat.filter(sesiune => 
        sesiune.detaliiCalitate.visare === filtruDetalii.visare
      );
    }

    if (filtruDetalii.stres) {
      rezultat = rezultat.filter(sesiune => 
        sesiune.detaliiCalitate.stres === filtruDetalii.stres
      );
    }

    if (cautare) {
      const [an, luna, zi] = cautare.split('-').map(Number);
      const dataCautare = new Date(an, luna - 1, zi);
      dataCautare.setHours(0, 0, 0, 0);
      
      rezultat = rezultat.filter(sesiune => {
        const dataSesiune = new Date(sesiune.data);
        const dataSesiuneLocal = new Date(
          dataSesiune.getFullYear(),
          dataSesiune.getMonth(),
          dataSesiune.getDate()
        );
        return dataSesiuneLocal.getTime() === dataCautare.getTime();
      });
    }

    rezultat.sort((a, b) => {
      switch (sortare) {
        case 'recente':
          return new Date(b.data) - new Date(a.data);
        case 'vechi':
          return new Date(a.data) - new Date(b.data);
        case 'rating':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'ore': {
          const oreA = calculeazaOreSomn(a.oraAdormire, a.oraTrezire);
          const oreB = calculeazaOreSomn(b.oraAdormire, b.oraTrezire);
          return parseFloat(oreB) - parseFloat(oreA);
        }
        case 'ore-asc': {
          const oreA = calculeazaOreSomn(a.oraAdormire, a.oraTrezire);
          const oreB = calculeazaOreSomn(b.oraAdormire, b.oraTrezire);
          return parseFloat(oreA) - parseFloat(oreB);
        }
        default:
          return new Date(b.data) - new Date(a.data);
      }
    });

    setSesiuniFiltrate(rezultat);
  };

  const stergeSesiuneSomn = async (id) => {
    Alert.alert(
      'Confirmare',
      'Ești sigur că vrei să ștergi această sesiune de somn?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`http://172.20.10.3:5000/somn/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setSesiuniSomn(sesiuniSomn.filter(sesiune => sesiune._id !== id));
            } catch (error) {
              console.error('Eroare la ștergerea sesiunii:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge sesiunea');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const calculeazaOreSomn = (oraAdormire, oraTrezire) => {
    const [oreAdormire] = oraAdormire.split(':').map(Number);
    const [oreTrezire] = oraTrezire.split(':').map(Number);
    
    let ore = oreTrezire - oreAdormire;
    if (ore < 0) ore += 24;
    
    return `${ore} ore`;
  };

  const renderStele = (rating) => {
    return (
      <View style={styles.steleContainer}>
        {[1, 2, 3, 4, 5].map((stea) => (
          <Icon
            key={stea}
            name={stea <= rating ? "star" : "star-outline"}
            size={20}
            color="#FFD700"
            style={styles.stea}
          />
        ))}
      </View>
    );
  };

  const renderDetalii = (detalii) => {
    return (
      <View style={styles.detaliiContainer}>
        <Text style={styles.detaliiText}>
          <Text style={styles.boldText}>Adormire: </Text>{detalii.adormire}
        </Text>
        <Text style={styles.detaliiText}>
          <Text style={styles.boldText}>Continuitate: </Text>{detalii.continuitate}
        </Text>
        <Text style={styles.detaliiText}>
          <Text style={styles.boldText}>Odihnă: </Text>{detalii.odihnă}
        </Text>
        <Text style={styles.detaliiText}>
          <Text style={styles.boldText}>Visare: </Text>{detalii.visare}
        </Text>
        <Text style={styles.detaliiText}>
          <Text style={styles.boldText}>Stres: </Text>{detalii.stres}
        </Text>
      </View>
    );
  };

  const resetFiltre = () => {
    setCautare('');
    setSortare('recente');
    setFiltruDetalii({
      adormire: '',
      continuitate: '',
      odihnă: '',
      visare: '',
      stres: ''
    });
    setSelectedDate(new Date());
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const an = selectedDate.getFullYear();
      const luna = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const zi = String(selectedDate.getDate()).padStart(2, '0');
      const dataFormatata = `${an}-${luna}-${zi}`;
      setCautare(dataFormatata);
    }
  };

  const renderModalFiltre = () => {
    return (
      <Modal
        visible={modalFiltre}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalFiltre(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalFiltre(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitlu}>Filtre și sortare</Text>
                  <TouchableOpacity onPress={() => setModalFiltre(false)}>
                    <Icon name="close" size={24} color="#032851" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitlu}>Caută după dată</Text>
                    <TouchableOpacity 
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Icon name="calendar" size={20} color="#fff" style={styles.searchIcon} />
                      <Text style={[styles.datePickerText, !cautare && styles.datePickerPlaceholder]}>
                        {cautare || 'Selectează data'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitlu}>Sortează după</Text>
                    {[
                      { id: 'recente', icon: 'time', text: 'Cele mai recente' },
                      { id: 'vechi', icon: 'time-outline', text: 'Cele mai vechi' },
                      { id: 'rating', icon: 'star', text: 'Rating (descrescător)' },
                      { id: 'rating-asc', icon: 'star-outline', text: 'Rating (crescător)' },
                      { id: 'ore', icon: 'bed', text: 'Ore (descrescător)' },
                      { id: 'ore-asc', icon: 'bed-outline', text: 'Ore (crescător)' }
                    ].map((optiune) => (
                      <TouchableOpacity
                        key={optiune.id}
                        style={[
                          styles.modalOptiune,
                          sortare === optiune.id && styles.modalOptiuneActiv
                        ]}
                        onPress={() => {
                          setSortare(optiune.id);
                        }}
                      >
                        <Icon 
                          name={optiune.icon} 
                          size={20} 
                          color={sortare === optiune.id ? '#fff' : '#032851'} 
                        />
                        <Text style={[
                          styles.modalOptiuneText,
                          sortare === optiune.id && styles.modalOptiuneTextActiv
                        ]}>
                          {optiune.text}
                        </Text>
                        {sortare === optiune.id && (
                          <Icon name="checkmark-circle" size={20} color="#fff" style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitlu}>Filtrează după detalii</Text>
                    <View style={styles.filtreDetaliiGrid}>
                      <TouchableOpacity
                        style={[styles.filtruDetaliiButon, filtruDetalii.adormire && styles.filtruDetaliiButonActiv]}
                        onPress={() => {
                          const optiuni = ['rapid', 'normal', 'încet', 'foarte greu'];
                          const index = optiuni.indexOf(filtruDetalii.adormire);
                          const nextIndex = (index + 1) % (optiuni.length + 1);
                          setFiltruDetalii({
                            ...filtruDetalii,
                            adormire: nextIndex === optiuni.length ? '' : optiuni[nextIndex]
                          });
                        }}
                      >
                        <Icon name="moon" size={16} color={filtruDetalii.adormire ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruDetaliiText, filtruDetalii.adormire && styles.filtruDetaliiTextActiv]}>
                          {filtruDetalii.adormire || 'Adormire'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.filtruDetaliiButon, filtruDetalii.continuitate && styles.filtruDetaliiButonActiv]}
                        onPress={() => {
                          const optiuni = ['continuu', 'câteva întreruperi', 'multe întreruperi', 'foarte fragmentat'];
                          const index = optiuni.indexOf(filtruDetalii.continuitate);
                          const nextIndex = (index + 1) % (optiuni.length + 1);
                          setFiltruDetalii({
                            ...filtruDetalii,
                            continuitate: nextIndex === optiuni.length ? '' : optiuni[nextIndex]
                          });
                        }}
                      >
                        <Icon name="repeat" size={16} color={filtruDetalii.continuitate ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruDetaliiText, filtruDetalii.continuitate && styles.filtruDetaliiTextActiv]}>
                          {filtruDetalii.continuitate || 'Continuitate'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.filtruDetaliiButon, filtruDetalii.odihnă && styles.filtruDetaliiButonActiv]}
                        onPress={() => {
                          const optiuni = ['complet odihnit', 'moderat odihnit', 'puțin odihnit', 'deloc odihnit'];
                          const index = optiuni.indexOf(filtruDetalii.odihnă);
                          const nextIndex = (index + 1) % (optiuni.length + 1);
                          setFiltruDetalii({
                            ...filtruDetalii,
                            odihnă: nextIndex === optiuni.length ? '' : optiuni[nextIndex]
                          });
                        }}
                      >
                        <Icon name="battery-charging" size={16} color={filtruDetalii.odihnă ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruDetaliiText, filtruDetalii.odihnă && styles.filtruDetaliiTextActiv]}>
                          {filtruDetalii.odihnă || 'Odihnă'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.filtruDetaliiButon, filtruDetalii.visare && styles.filtruDetaliiButonActiv]}
                        onPress={() => {
                          const optiuni = ['multe vise', 'câteva vise', 'puține vise', 'fără vise'];
                          const index = optiuni.indexOf(filtruDetalii.visare);
                          const nextIndex = (index + 1) % (optiuni.length + 1);
                          setFiltruDetalii({
                            ...filtruDetalii,
                            visare: nextIndex === optiuni.length ? '' : optiuni[nextIndex]
                          });
                        }}
                      >
                        <Icon name="cloud" size={16} color={filtruDetalii.visare ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruDetaliiText, filtruDetalii.visare && styles.filtruDetaliiTextActiv]}>
                          {filtruDetalii.visare || 'Visare'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.filtruDetaliiButon, filtruDetalii.stres && styles.filtruDetaliiButonActiv]}
                        onPress={() => {
                          const optiuni = ['fără stres', 'puțin stres', 'moderat stres', 'mult stres'];
                          const index = optiuni.indexOf(filtruDetalii.stres);
                          const nextIndex = (index + 1) % (optiuni.length + 1);
                          setFiltruDetalii({
                            ...filtruDetalii,
                            stres: nextIndex === optiuni.length ? '' : optiuni[nextIndex]
                          });
                        }}
                      >
                        <Icon name="pulse" size={16} color={filtruDetalii.stres ? '#fff' : '#032851'} />
                        <Text style={[styles.filtruDetaliiText, filtruDetalii.stres && styles.filtruDetaliiTextActiv]}>
                          {filtruDetalii.stres || 'Stres'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButon, styles.resetButon]}
                    onPress={resetFiltre}
                  >
                    <Icon name="refresh" size={20} color="#032851" />
                    <Text style={styles.resetButonText}>Resetează</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalButon, styles.applyButon]}
                    onPress={() => setModalFiltre(false)}
                  >
                    <Text style={styles.modalButonText}>Aplică filtre</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/Somn.png')} style={styles.image} />

      <TouchableOpacity onPress={() => navigare.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.titlu}>Din nopțile trecute...</Text>
          <TouchableOpacity 
            style={styles.filtreButon}
            onPress={() => setModalFiltre(true)}
          >
            <Icon name="options" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {renderModalFiltre()}

        {sesiuniFiltrate.length === 0 ? (
          <Text style={styles.textSecundar}>Nicio sesiune de somn găsită.</Text>
        ) : (
          <FlatList
            data={sesiuniFiltrate}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.sesiune}>
                <TouchableOpacity onPress={() => stergeSesiuneSomn(item._id)} style={styles.iconContainer}>
                  <Icon name="trash" size={20} color="#8caee0" />
                </TouchableOpacity>
                <View style={styles.item}>
                  <Text style={styles.text}>Somn ușor la <Text style={styles.boldText}>{item.oraAdormire}</Text></Text>
                  <Text style={styles.text}>Bună dimineața la <Text style={styles.boldText}>{item.oraTrezire}</Text></Text>
                  <Text style={styles.text}>Te-ai odihnit <Text style={styles.boldText}>{calculeazaOreSomn(item.oraAdormire, item.oraTrezire)}</Text></Text>
                  
                  <View style={styles.ratingContainer}>
                    <Text style={styles.text}>Calitatea somnului: </Text>
                    {renderStele(item.rating)}
                  </View>

                  {renderDetalii(item.detaliiCalitate)}
                  
                  <Text style={styles.data}>{new Date(item.data).toLocaleDateString()}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <TouchableOpacity style={styles.buton} onPress={() => navigare.navigate('SomnAdaugaSesiune')}>
        <Text style={styles.textButon}>Adaugă Sesiune</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  content: {
    flex: 1,
    width: '100%',
    paddingTop: 230,
    paddingHorizontal: 20
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
    zIndex: 10
  },
  titlu: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginBottom: 10
  },
  textSecundar: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20
  },
  sesiune: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  item: {
    flex: 1,
    alignItems: 'flex-start',
    width: '100%'
  },
  text: {
    fontSize: 15,
    color: '#032851',
    marginBottom: 5
  },
  boldText: {
    fontWeight: 'bold'
  },
  data: {
    fontSize: 12,
    color: '#8caee0',
    alignSelf: 'flex-start',
    marginTop: 5
  },
  iconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5
  },
  buton: {
    backgroundColor: '#032851',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    marginBottom: 30
  },
  textButon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  steleContainer: {
    flexDirection: 'row',
    marginLeft: 5
  },
  stea: {
    marginRight: 2
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  detaliiContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    width: '100%'
  },
  detaliiText: {
    fontSize: 14,
    color: '#032851',
    marginBottom: 3
  },
  filtreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15
  },
  cautareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  searchIcon: {
    marginRight: 8
  },
  cautareInput: {
    flex: 1,
    height: 40,
    color: '#032851',
    fontSize: 14
  },
  sortareButon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'space-between'
  },
  sortareText: {
    flex: 1,
    marginLeft: 10,
    color: '#032851',
    fontSize: 14
  },
  filtreDetaliiContainer: {
    marginBottom: 10
  },
  filtreTitlu: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#032851',
    marginBottom: 8
  },
  filtreDetaliiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  filtruDetaliiButon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
    justifyContent: 'center'
  },
  filtruDetaliiButonActiv: {
    backgroundColor: '#032851'
  },
  filtruDetaliiText: {
    marginLeft: 4,
    color: '#032851',
    fontSize: 12
  },
  filtruDetaliiTextActiv: {
    color: '#fff'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    maxWidth: 350,
    height: '80%',
    position: 'absolute',
    top: '10%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitlu: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#032851'
  },
  modalScrollView: {
    flex: 1,
    padding: 15
  },
  modalSection: {
    marginBottom: 15,
    backgroundColor: '#032851',
    padding: 12,
    borderRadius: 10
  },
  modalSectionTitlu: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#032851',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#032851'
  },
  datePickerText: {
    marginLeft: 10,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500'
  },
  datePickerPlaceholder: {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  modalOptiune: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  modalOptiuneActiv: {
    backgroundColor: '#032851',
    borderColor: '#032851'
  },
  modalOptiuneText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#032851',
    flex: 1
  },
  modalOptiuneTextActiv: {
    color: '#fff',
    fontWeight: 'bold'
  },
  checkIcon: {
    marginLeft: 'auto'
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  resetButon: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12
  },
  resetButonText: {
    color: '#032851',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8
  },
  applyButon: {
    flex: 1,
    backgroundColor: '#032851',
    padding: 12
  },
  modalButonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  filtreButon: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 8,
    marginLeft: 'auto'
  }
});

export default Somn;