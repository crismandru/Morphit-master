import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SomnAdaugaSesiune = () => {
  const navigation = useNavigation();
  const [oraAdormire, setOraAdormire] = useState('');
  const [oraTrezire, setOraTrezire] = useState('');
  const [rating, setRating] = useState(3);
  const [detaliiCalitate, setDetaliiCalitate] = useState({
    adormire: 'normal',
    continuitate: 'continuu',
    odihnă: 'moderat odihnit',
    visare: 'câteva vise',
    stres: 'puțin stres'
  });

  const handleOraAdormire = (value) => {
    const valueInt = parseInt(value, 10);
    if (valueInt >= 0 && valueInt <= 23) {
      setOraAdormire(valueInt.toString().padStart(2, '0'));
    }
  };

  const handleOraTrezire = (value) => {
    const valueInt = parseInt(value, 10);
    if (valueInt >= 0 && valueInt <= 23) {
      setOraTrezire(valueInt.toString().padStart(2, '0'));
    }
  };

  const calculeazaOreSomn = () => {
    const adormire = parseInt(oraAdormire, 10);
    const trezire = parseInt(oraTrezire, 10);
    let oreSomn = trezire - adormire;
    if (oreSomn < 0) {
      oreSomn += 24;
    }
    return oreSomn;
  };

  const renderStele = () => {
    return (
      <View style={styles.steleContainer}>
        {[1, 2, 3, 4, 5].map((stea) => (
          <TouchableOpacity
            key={stea}
            onPress={() => setRating(stea)}
            style={styles.stea}
          >
            <Icon
              name={stea <= rating ? "star" : "star-outline"}
              size={40}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDetaliiCalitate = () => {
    const detalii = [
      {
        titlu: 'Adormire',
        valoare: detaliiCalitate.adormire,
        optiuni: ['rapid', 'normal', 'încet', 'foarte greu'],
        setter: (val) => setDetaliiCalitate({...detaliiCalitate, adormire: val})
      },
      {
        titlu: 'Continuitate',
        valoare: detaliiCalitate.continuitate,
        optiuni: ['continuu', 'câteva întreruperi', 'multe întreruperi', 'foarte fragmentat'],
        setter: (val) => setDetaliiCalitate({...detaliiCalitate, continuitate: val})
      },
      {
        titlu: 'Odihnă',
        valoare: detaliiCalitate.odihnă,
        optiuni: ['complet odihnit', 'moderat odihnit', 'puțin odihnit', 'deloc odihnit'],
        setter: (val) => setDetaliiCalitate({...detaliiCalitate, odihnă: val})
      },
      {
        titlu: 'Visare',
        valoare: detaliiCalitate.visare,
        optiuni: ['multe vise', 'câteva vise', 'puține vise', 'fără vise'],
        setter: (val) => setDetaliiCalitate({...detaliiCalitate, visare: val})
      },
      {
        titlu: 'Stres',
        valoare: detaliiCalitate.stres,
        optiuni: ['fără stres', 'puțin stres', 'moderat stres', 'mult stres'],
        setter: (val) => setDetaliiCalitate({...detaliiCalitate, stres: val})
      }
    ];

    return detalii.map((detalii, index) => (
      <View key={index} style={styles.detaliiContainer}>
        <Text style={styles.detaliiTitlu}>{detalii.titlu}</Text>
        <View style={styles.optiuniContainer}>
          {detalii.optiuni.map((optiune) => (
            <TouchableOpacity
              key={optiune}
              style={[
                styles.optiuneButon,
                detalii.valoare === optiune && styles.optiuneSelectata
              ]}
              onPress={() => detalii.setter(optiune)}
            >
              <Text style={[
                styles.optiuneText,
                detalii.valoare === optiune && styles.optiuneTextSelectat
              ]}>
                {optiune}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ));
  };

  const salveazaSesiune = async () => {
    if (!oraAdormire || !oraTrezire) {
      Alert.alert("Eroare", "Te rog să introduci orele de adormire și trezire.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Eroare', 'Nu sunteți autentificat');
        return;
      }

      const sesiuneData = {
        oraAdormire: oraAdormire + ':00',
        oraTrezire: oraTrezire + ':00',
        rating,
        detaliiCalitate
      };

      const response = await axios.post('http://172.20.10.3:5000/somn', sesiuneData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigation.goBack();
    } catch (error) {
      if (error.response?.data?.cod === 'SESIUNE_EXISTENTA') {
        Alert.alert(
          'Sesiune existentă',
          'Ai deja o sesiune de somn înregistrată pentru astăzi. Poți adăuga o nouă sesiune mâine.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        Alert.alert(
          'Eroare', 
          'Nu s-a putut salva sesiunea. Te rog să încerci din nou.'
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.titlu}>{new Date().toLocaleDateString()}</Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Ora de adormire (0-23)"
          value={oraAdormire}
          onChangeText={handleOraAdormire}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Ora de trezire (0-23)"
          value={oraTrezire}
          onChangeText={handleOraTrezire}
        />

        <Text style={styles.oreDormite}>Ore dormite: {calculeazaOreSomn()} ore</Text>

        <Text style={styles.sectionTitlu}>Calitatea somnului:</Text>
        {renderStele()}

        <Text style={styles.sectionTitlu}>Detalii despre somn:</Text>
        {renderDetaliiCalitate()}

        <TouchableOpacity style={styles.buton} onPress={salveazaSesiune}>
          <Text style={styles.textButon}>Salvează sesiune</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#032851'
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 80
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
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold'
  },
  sectionTitlu: {
    fontSize: 20,
    color: '#fff',
    marginTop: 25,
    marginBottom: 12,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    height: 50,
    marginBottom: 18,
    textAlign: 'center',
    fontSize: 18
  },
  oreDormite: {
    fontSize: 18,
    color: '#fff',
    marginTop: 12,
    marginBottom: 20
  },
  steleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12
  },
  stea: {
    padding: 5
  },
  detaliiContainer: {
    marginBottom: 18
  },
  detaliiTitlu: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8
  },
  optiuniContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  optiuneButon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    width: '48%'
  },
  optiuneSelectata: {
    backgroundColor: '#8caee0'
  },
  optiuneText: {
    color: '#fff',
    textAlign: 'center'
  },
  optiuneTextSelectat: {
    fontWeight: 'bold'
  },
  buton: {
    backgroundColor: '#8caee0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30
  },
  textButon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default SomnAdaugaSesiune;
