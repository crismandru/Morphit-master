import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking, Image, Animated, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultExercitiiData = {
  "Concentration Curl": {
    descriere: "Exercițiu izolat pentru biceps executat pe o bancă. Stând așezat, cu cotul sprijinit pe partea internă a coapsei, ridici gantera într-o mișcare concentrată. Acest exercițiu izolează perfect bicepsul și permite o mișcare strictă și controlată.",
    video: "https://youtu.be/LHDwya1KY8M",
    animatie: require('../../../assets/gifs/concentration-curl.png'),
    muschiAntrenati: "Biceps",
    grupaMusculara: "Biceps",
    equipment: "Gantere și bancă",
    isDefault: true
  },
  "Incline Dumbbell Curl": {
    descriere: "Exercițiu pentru biceps executat pe o bancă înclinată. Lucrează intens bicepsul datorită poziției înclinate care elimină ajutorul din spate. Executat cu mișcare controlată și gama completă de mișcare.",
    video: "https://youtu.be/UeleXjsE-98",
    animatie: require('../../../assets/gifs/incline-dumbbell-curl.png'),
    muschiAntrenati: "Biceps",
    grupaMusculara: "Biceps",
    equipment: "Bancă înclinată și gantere",
    isDefault: true
  }
};

const API_URL = 'http://172.20.10.3:5000';

const Biceps = () => {
  const navigation = useNavigation();
  const [exercitiiData, setExercitiiData] = useState({});
  const [exercitii, setExercitii] = useState([]);
  const [exercitiuSelectat, setExercitiuSelectat] = useState(null);
  const [modalVizibil, setModalVizibil] = useState(false);
  const [adaugaModalVizibil, setAdaugaModalVizibil] = useState(false);
  const [editModalVizibil, setEditModalVizibil] = useState(false);
  const [animatie] = useState(new Animated.Value(0));
  const [numeExercitiu, setNumeExercitiu] = useState('');
  const [descriereExercitiu, setDescriereExercitiu] = useState('');
  const [muschiAntrenati, setMuschiAntrenati] = useState('');
  const [grupaMusculara, setGrupaMusculara] = useState('Biceps');
  const [echipament, setEchipament] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [imagineSursa, setImagineSursa] = useState(null);
  const [numeOriginal, setNumeOriginal] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) {
          Alert.alert(
            'Eroare de autentificare',
            'Nu sunteți autentificat. Vă rugăm să vă conectați din nou.'
          );
          navigation.navigate('Login');
          return;
        }
        setToken(storedToken);
      } catch (error) {
        console.error('Eroare la încărcarea token-ului:', error);
        Alert.alert(
          'Eroare',
          'Nu s-a putut încărca sesiunea. Vă rugăm să vă conectați din nou.'
        );
        navigation.navigate('Login');
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (token) {
      incarcaExercitii();
    }
  }, [token]);

  const sincronizeazaExercitiiPredefinite = async () => {
    if (!token) {
      console.warn('Token lipsă pentru sincronizarea exercițiilor');
      return;
    }

    try {
      for (const [nume, exercitiu] of Object.entries(defaultExercitiiData)) {
        try {
          console.log(`Verific exercițiul: ${nume}`);
          const response = await fetch(`${API_URL}/exercitii/verifica/${encodeURIComponent(nume)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn(`Nu s-a putut verifica exercițiul ${nume}:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
            continue;
          }

          const { exista } = await response.json();
          console.log(`Exercițiul ${nume} există: ${exista}`);

          if (!exista) {
            console.log(`Adaug exercițiul: ${nume}`);
            const exercitiuData = {
              nume,
              descriere: exercitiu.descriere,
              muschiAntrenati: exercitiu.muschiAntrenati,
              echipament: exercitiu.equipment,
              video: exercitiu.video,
              grupaMusculara: 'Biceps',
              isDefault: true
            };

            console.log('Date trimise pentru exercițiu:', exercitiuData);

            const addResponse = await fetch(`${API_URL}/exercitii`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(exercitiuData)
            });

            if (!addResponse.ok) {
              const errorData = await addResponse.json().catch(() => ({}));
              console.warn(`Nu s-a putut adăuga exercițiul predefinit ${nume}:`, {
                status: addResponse.status,
                statusText: addResponse.statusText,
                error: errorData
              });
            } else {
              console.log(`Exercițiul ${nume} a fost adăugat cu succes`);
            }
          }
        } catch (error) {
          console.warn(`Eroare la procesarea exercițiului ${nume}:`, error);
        }
      }
    } catch (error) {
      console.error('Eroare la sincronizarea exercițiilor predefinite:', error);
      Alert.alert(
        'Atenție',
        'Nu s-au putut sincroniza toate exercițiile predefinite. Unele exerciții pot fi indisponibile.'
      );
    }
  };

  const incarcaExercitii = async () => {
    if (!token) {
      console.warn('Token lipsă pentru încărcarea exercițiilor');
      return;
    }

    try {
      console.log('Încep sincronizarea exercițiilor predefinite...');
      await sincronizeazaExercitiiPredefinite();

      console.log('Încarc exercițiile din baza de date...');
      const response = await fetch(`${API_URL}/exercitii?grupaMusculara=Biceps`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Eroare la încărcarea exercițiilor: ${response.statusText}`, errorData);
      }

      const data = await response.json();
      console.log(`Am încărcat ${data.length} exerciții din baza de date`);
      
      const exercitiiBiceps = data.filter(exercitiu => exercitiu.grupaMusculara === 'Biceps');
      console.log(`Am filtrat ${exercitiiBiceps.length} exerciții pentru biceps`);
      
      const exercitiiFormatate = { ...defaultExercitiiData };
      
      exercitiiBiceps.forEach(exercitiu => {
        if (!exercitiiFormatate[exercitiu.nume]) {
          console.log('Procesez exercițiul:', exercitiu.nume);
          console.log('Imagine exercițiu:', exercitiu.animatie);
          
          let imagineSursa;
          if (exercitiu.animatie) {
            if (exercitiu.animatie.startsWith('http')) {
              imagineSursa = { uri: exercitiu.animatie };
            } else {
              imagineSursa = { uri: `${API_URL}${exercitiu.animatie}` };
            }
            console.log('Imagine sursă construită:', imagineSursa);
          } else {
            imagineSursa = require('../../../assets/gifs/exercitiu-default.png');
            console.log('Folosim imaginea implicită');
          }

          exercitiiFormatate[exercitiu.nume] = {
            descriere: exercitiu.descriere || '',
            muschiAntrenati: exercitiu.muschiAntrenati || '',
            equipment: exercitiu.echipament || '',
            video: exercitiu.video || '',
            animatie: imagineSursa,
            grupaMusculara: exercitiu.grupaMusculara,
            isDefault: !exercitiu.utilizator
          };
        }
      });

      setExercitiiData(exercitiiFormatate);
      setExercitii(Object.keys(exercitiiFormatate));
      console.log('Exercițiile pentru biceps au fost încărcate cu succes');
    } catch (error) {
      console.error('Eroare la încărcarea exercițiilor:', error);
      Alert.alert(
        'Eroare',
        'Nu s-au putut încărca exercițiile. Vă rugăm să încercați din nou.'
      );
      setExercitiiData(defaultExercitiiData);
      setExercitii(Object.keys(defaultExercitiiData));
    }
  };

  useEffect(() => {
    if (modalVizibil) {
      Animated.spring(animatie, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }).start();
    } else {
      animatie.setValue(0);
    }
  }, [modalVizibil]);

  const deschideDetalii = (exercitiu) => {
    setExercitiuSelectat(exercitiu);
    setModalVizibil(true);
  };

  const deschideAdaugaModal = () => {
    resetareFormular();
    setAdaugaModalVizibil(true);
  };

  const deschideEditModal = (exercitiu) => {
    if (exercitiiData[exercitiu].isDefault) {
      Alert.alert('Notificare', 'Nu poți edita exercițiile predefinite.');
      return;
    }
    
    setNumeExercitiu(exercitiu);
    setNumeOriginal(exercitiu);
    setDescriereExercitiu(exercitiiData[exercitiu].descriere);
    setMuschiAntrenati(exercitiiData[exercitiu].muschiAntrenati);
    setEchipament(exercitiiData[exercitiu].equipment);
    setVideoLink(exercitiiData[exercitiu].video || '');
    
    if (typeof exercitiiData[exercitiu].animatie === 'object' && exercitiiData[exercitiu].animatie.uri) {
      setImagineSursa(exercitiiData[exercitiu].animatie.uri);
    } else {
      setImagineSursa(null);
    }
    setGrupaMusculara(exercitiiData[exercitiu].muschiAntrenati);
    setEditModalVizibil(true);
    setModalVizibil(false);
  };

  const resetareFormular = () => {
    setNumeExercitiu('');
    setDescriereExercitiu('');
    setMuschiAntrenati('');
    setEchipament('');
    setVideoLink('');
    setImagineSursa(null);
    setGrupaMusculara('Biceps');
  };

  const selecteazaImagine = async () => {
    try {
      console.log('Încep selectarea imaginii...');
      let permisiune = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permisiune.status !== 'granted') {
        console.log('Permisiune refuzată pentru galerie');
        Alert.alert('Permisiune necesară', 'Este nevoie de permisiune pentru a accesa galeria.');
        return;
      }
      
      console.log('Permisiune acordată, deschid galeria...');
      let rezultat = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      console.log('Rezultat selectare imagine:', rezultat);
      
      if (!rezultat.canceled) {
        console.log('Imagine selectată:', rezultat.assets[0].uri);
        setImagineSursa(rezultat.assets[0].uri);
      } else {
        console.log('Selectare imagine anulată');
      }
    } catch (error) {
      console.error('Eroare la selectarea imaginii:', error);
      Alert.alert('Eroare', 'Nu s-a putut selecta imaginea.');
    }
  };

  const adaugaExercitiu = async () => {
    if (!numeExercitiu || !descriereExercitiu || !muschiAntrenati || !echipament) {
      Alert.alert('Informații incomplete', 'Completează toate câmpurile obligatorii.');
      return;
    }

    try {
      console.log('Încep adăugarea exercițiului...');
      const exercitiuData = {
        nume: numeExercitiu,
        descriere: descriereExercitiu,
        muschiAntrenati: muschiAntrenati,
        echipament: echipament,
        video: videoLink || '',
        grupaMusculara: 'Biceps',
        isDefault: false
      };

      console.log('Date trimise pentru exercițiu:', exercitiuData);

      const response = await fetch(`${API_URL}/exercitii`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exercitiuData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Eroare la adăugarea exercițiului:', errorData);
        throw new Error('Eroare la adăugarea exercițiului');
      }

      console.log('Exercițiul a fost adăugat cu succes');

      if (imagineSursa) {
        console.log('Pregătesc trimiterea imaginii...');
        const formData = new FormData();
        const filename = imagineSursa.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        console.log('Detalii imagine:', { filename, type, uri: imagineSursa });

        formData.append('imagine', {
          uri: imagineSursa,
          name: filename,
          type
        });

        console.log('Trimit imaginea pentru exercițiul:', numeExercitiu);

        const imageResponse = await fetch(`${API_URL}/exercitii/${encodeURIComponent(numeExercitiu)}/imagine`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });

        console.log('Răspuns la încărcarea imaginii:', imageResponse.status);
        const imageData = await imageResponse.json().catch(() => ({}));
        console.log('Date răspuns imagine:', imageData);

        if (!imageResponse.ok) {
          console.warn('Imaginea nu a putut fi salvată, dar exercițiul a fost adăugat');
        }
      }

      await incarcaExercitii(); 
      setAdaugaModalVizibil(false);
      resetareFormular();
      Alert.alert('Succes', 'Exercițiul a fost adăugat cu succes!');
    } catch (error) {
      console.error('Error adding exercise:', error);
      Alert.alert('Eroare', 'Nu s-a putut adăuga exercițiul.');
    }
  };

  const actualizeazaExercitiu = async () => {
    if (!numeExercitiu || !descriereExercitiu || !muschiAntrenati || !echipament) {
      Alert.alert('Informații incomplete', 'Completează toate câmpurile obligatorii.');
      return;
    }

    try {
      if (numeExercitiu !== numeOriginal) {
        const verificareResponse = await fetch(`${API_URL}/exercitii/verifica/${encodeURIComponent(numeExercitiu)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const { exista } = await verificareResponse.json();
        if (exista) {
          Alert.alert('Eroare', 'Există deja un exercițiu cu acest nume.');
          return;
        }
      }

      const exercitiuData = {
        descriere: descriereExercitiu,
        muschiAntrenati: muschiAntrenati,
        echipament: echipament,
        video: videoLink || '',
        grupaMusculara: 'Biceps',
        animatie: exercitiiData[numeOriginal]?.animatie?.uri ? exercitiiData[numeOriginal].animatie.uri.replace(API_URL, '') : null
      };

      if (numeExercitiu !== numeOriginal) {
        exercitiuData.nume = numeExercitiu;
      }

      console.log('Date trimise pentru actualizare:', exercitiuData);

      const response = await fetch(`${API_URL}/exercitii/${encodeURIComponent(numeOriginal)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exercitiuData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Eroare la actualizarea exercițiului:', errorData);
        throw new Error('Eroare la actualizarea exercițiului');
      }

      if (imagineSursa) {
        console.log('Verific imaginea pentru actualizare...');
        console.log('Imagine sursă:', imagineSursa);
        console.log('Imagine existentă:', exercitiiData[numeOriginal]?.animatie?.uri);
        
        if (imagineSursa !== exercitiiData[numeOriginal]?.animatie?.uri) {
          console.log('Imagine nouă detectată, pregătesc trimiterea...');
          const formData = new FormData();
          const filename = imagineSursa.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          console.log('Detalii imagine nouă:', { 
            filename, 
            type, 
            uri: imagineSursa,
            formData: {
              uri: imagineSursa,
              name: filename,
              type
            }
          });

          formData.append('imagine', {
            uri: imagineSursa,
            name: filename,
            type
          });

          const numePentruImagine = numeExercitiu !== numeOriginal ? numeExercitiu : numeOriginal;
          console.log('Trimit imaginea pentru exercițiul:', numePentruImagine);
          console.log('URL pentru încărcare:', `${API_URL}/exercitii/${encodeURIComponent(numePentruImagine)}/imagine`);

          try {
            const imageResponse = await fetch(`${API_URL}/exercitii/${encodeURIComponent(numePentruImagine)}/imagine`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
              },
              body: formData
            });

            console.log('Status răspuns încărcare imagine:', imageResponse.status);
            console.log('Headers răspuns:', imageResponse.headers);
            
            const imageData = await imageResponse.json().catch(e => {
              console.error('Eroare la parsarea răspunsului JSON:', e);
              return null;
            });
            
            console.log('Date răspuns imagine:', imageData);

            if (!imageResponse.ok) {
              console.error('Eroare la încărcarea imaginii:', {
                status: imageResponse.status,
                statusText: imageResponse.statusText,
                data: imageData
              });
              throw new Error(`Eroare la încărcarea imaginii: ${imageResponse.statusText}`);
            }
          } catch (error) {
            console.error('Eroare detaliată la încărcarea imaginii:', error);
            Alert.alert('Atenție', 'Imaginea nu a putut fi actualizată, dar exercițiul a fost salvat.');
          }
        } else {
          console.log('Nu s-a detectat o imagine nouă, se păstrează imaginea existentă');
        }
      } else {
        console.log('Nu există imagine nouă de încărcat');
      }

      await incarcaExercitii(); 
      setEditModalVizibil(false);
      resetareFormular();
      Alert.alert('Succes', 'Exercițiul a fost actualizat cu succes!');
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Eroare', 'Nu s-a putut actualiza exercițiul.');
    }
  };

  const stergeExercitiu = async () => {
    Alert.alert(
      'Confirmare',
      `Sigur dorești să ștergi exercițiul "${numeOriginal}"?`,
      [
        { text: 'Anulează', style: 'cancel' },
        { 
          text: 'Șterge', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('Încerc să șterg exercițiul:', numeOriginal);
              const response = await fetch(`${API_URL}/exercitii/${encodeURIComponent(numeOriginal)}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Eroare la ștergerea exercițiului:', errorData);
                throw new Error('Eroare la ștergerea exercițiului');
              }

              await incarcaExercitii(); 
              setEditModalVizibil(false);
              setModalVizibil(false);
              resetareFormular();
              Alert.alert('Succes', 'Exercițiul a fost șters cu succes!');
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge exercițiul.');
            }
          }
        }
      ]
    );
  };

  const animatedStyle = {
    transform: [
      { scale: animatie.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      },
      { translateY: animatie.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        })
      }
    ],
    opacity: animatie
  };

  const renderModalActions = () => {
    if (exercitiuSelectat && exercitiiData[exercitiuSelectat] && !exercitiiData[exercitiuSelectat].isDefault) {
      return (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => deschideEditModal(exercitiuSelectat)}
          >
            <Text style={styles.actionButtonText}>Editează</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('ExercitiiFata')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.titlu}>Biceps</Text>
      
      <ScrollView style={styles.exercitiiContainer}>
        {exercitii.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.exercitiuCard}
            onPress={() => deschideDetalii(item)}
          >
            <View style={styles.imagineContainer}>
              <Image 
                source={exercitiiData[item].animatie} 
                style={styles.thumbnail}
                resizeMode="contain"
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.numeExercitiu}>{item}</Text>
              <Text style={styles.tipExercitiu}>{exercitiiData[item].muschiAntrenati}</Text>
              {!exercitiiData[item].isDefault && (
                <View style={styles.customBadge}>
                  <Text style={styles.customBadgeText}>Personalizat</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.adaugaButon} onPress={deschideAdaugaModal}>
        <Icon name="add" size={30} color="#fff" />
        <Text style={styles.adaugaText}>Adaugă exercițiu nou</Text>
      </TouchableOpacity>

      <Modal visible={modalVizibil} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, animatedStyle]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitlu}>{exercitiuSelectat}</Text>
              <TouchableOpacity onPress={() => setModalVizibil(false)} style={styles.closeButton}>
                <Icon name="close" size={28} color="#032851" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.animationContainer}>
              <Image 
                source={exercitiuSelectat && exercitiiData[exercitiuSelectat] ? exercitiiData[exercitiuSelectat].animatie : null}
                style={styles.exerciseAnimation}
                resizeMode="contain"
              />
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.infoRow}>
                <Icon name="barbell-outline" size={22} color="#032851" />
                <Text style={styles.infoText}>
                  {exercitiuSelectat && exercitiiData[exercitiuSelectat] ? exercitiiData[exercitiuSelectat].equipment : '' }
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="body-outline" size={22} color="#032851" />
                <Text style={styles.infoText}>{exercitiuSelectat && exercitiiData[exercitiuSelectat] ? exercitiiData[exercitiuSelectat].muschiAntrenati : ''}</Text>
              </View>
            </View>

            <Text style={styles.modalDescription}>
              {exercitiuSelectat && exercitiiData[exercitiuSelectat] ? exercitiiData[exercitiuSelectat].descriere : ''}
            </Text>

            {exercitiuSelectat && exercitiiData[exercitiuSelectat] && exercitiiData[exercitiuSelectat].video && (
              <TouchableOpacity
                onPress={() => Linking.openURL(exercitiiData[exercitiuSelectat].video)}
                style={styles.videoButton}
              >
                <Icon name="logo-youtube" size={24} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.videoButtonText}>Vezi Video Demonstrativ</Text>
              </TouchableOpacity>
            )}
            
            {renderModalActions()}
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={adaugaModalVizibil} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.adaugaModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitlu}>Adaugă Exercițiu Nou</Text>
              <TouchableOpacity onPress={() => setAdaugaModalVizibil(false)} style={styles.closeButton}>
                <Icon name="close" size={28} color="#032851" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Nume Exercițiu *</Text>
                <TextInput
                  style={styles.input}
                  value={numeExercitiu}
                  onChangeText={setNumeExercitiu}
                  placeholder="Ex: Dumbbell Wrist Curl"
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Descriere *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={descriereExercitiu}
                  onChangeText={setDescriereExercitiu}
                  placeholder="Descrie cum se execută exercițiul..."
                  placeholderTextColor="#888"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.label}>Mușchi antrenați *</Text>
                <TextInput
                  style={styles.input}
                  value={muschiAntrenati}
                  onChangeText={setMuschiAntrenati}
                  placeholder="Ex: Flexori ai încheieturii"
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Echipament *</Text>
                <TextInput
                  style={styles.input}
                  value={echipament}
                  onChangeText={setEchipament}
                  placeholder="Ex: Bară dreaptă"
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Link Video (opțional)</Text>
                <TextInput
                  style={styles.input}
                  value={videoLink}
                  onChangeText={setVideoLink}
                  placeholder="Ex: https://youtube.com/..."
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Imagine demonstrativă</Text>
                <TouchableOpacity style={styles.imagineButton} onPress={selecteazaImagine}>
                  <Icon name="image-outline" size={24} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.imagineButtonText}>Selectează Imagine</Text>
                </TouchableOpacity>

                {imagineSursa && (
                  <View style={styles.previzualizareContainer}>
                    <Image source={{ uri: imagineSursa }} style={styles.previzualizareImagine} />
                  </View>
                )}

                <TouchableOpacity style={styles.salveazaButton} onPress={adaugaExercitiu}>
                  <Text style={styles.salveazaButtonText}>Salvează Exercițiul</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={editModalVizibil} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.adaugaModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitlu}>Editează Exercițiu</Text>
              <TouchableOpacity onPress={() => setEditModalVizibil(false)} style={styles.closeButton}>
                <Icon name="close" size={28} color="#032851" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Nume Exercițiu *</Text>
                <TextInput
                  style={styles.input}
                  value={numeExercitiu}
                  onChangeText={setNumeExercitiu}
                  placeholder="Ex: Dumbbell Wrist Curl"
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Descriere *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={descriereExercitiu}
                  onChangeText={setDescriereExercitiu}
                  placeholder="Descrie cum se execută exercițiul..."
                  placeholderTextColor="#888"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.label}>Mușchi antrenați *</Text>
                <TextInput
                  style={styles.input}
                  value={muschiAntrenati}
                  onChangeText={setMuschiAntrenati}
                  placeholder="Ex: Flexori ai încheieturii"
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Echipament *</Text>
                <TextInput
                  style={styles.input}
                  value={echipament}
                  onChangeText={setEchipament}
                  placeholder="Ex: Bară dreaptă"
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Link Video (opțional)</Text>
                <TextInput
                  style={styles.input}
                  value={videoLink}
                  onChangeText={setVideoLink}
                  placeholder="Ex: https://youtube.com/..."
                  placeholderTextColor="#888"
                />

                <Text style={styles.label}>Imagine demonstrativă</Text>
                <TouchableOpacity style={styles.imagineButton} onPress={selecteazaImagine}>
                  <Icon name="image-outline" size={24} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.imagineButtonText}>Selectează Imagine</Text>
                </TouchableOpacity>

                {imagineSursa && (
                  <View style={styles.previzualizareContainer}>
                    <Image source={{ uri: imagineSursa }} style={styles.previzualizareImagine} />
                  </View>
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={stergeExercitiu}>
                    <Text style={styles.actionButtonText}>Șterge</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={actualizeazaExercitiu}>
                    <Text style={styles.actionButtonText}>Salvează</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#032851',
    padding: 20,
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
  titlu: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginVertical: 35,
    marginTop: 40,
  },
  exercitiiContainer: {
    flex: 1,
  },
  exercitiuCard: {
    flexDirection: 'row',
    backgroundColor: '#8caee0',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    height: 100,
  },
  imagineContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  thumbnail: {
    width: '160%',
    height: '160%',
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
    padding: 15,
  },
  numeExercitiu: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#032851',
    marginBottom: 5,
  },
  tipExercitiu: {
    fontSize: 16,
    color: '#032851',
    opacity: 0.7,
  },
  customBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#032851',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  customBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  adaugaModalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20, 
    maxHeight: '90%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitlu: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#032851',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  animationContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  exerciseAnimation: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#e6f0ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#032851',
    marginLeft: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#032851',
    textAlign: 'left',
    marginBottom: 20,
    width: '100%',
    lineHeight: 22,
  },
  videoButton: {
    flexDirection: 'row',
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adaugaButon: {
    flexDirection: 'row',
    backgroundColor: '#8caee0',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  adaugaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  formContainer: {
    flex: 1,
    width: '100%',
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#032851',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8caee0',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagineButton: {
    flexDirection: 'row',
    backgroundColor: '#032851',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  imagineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previzualizareContainer: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#8caee0',
  },
  previzualizareImagine: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  salveazaButton: {
    backgroundColor: '#032851',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  salveazaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#032851',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 80,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Biceps;