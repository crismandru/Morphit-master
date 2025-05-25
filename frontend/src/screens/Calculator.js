import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.3:5000';

const Calculator = () => {
  const navigare = useNavigation();
  const [greutate, setGreutate] = useState('');
  const [inaltime, setInaltime] = useState('');
  const [varsta, setVarsta] = useState('');
  const [gen, setGen] = useState('male');
  const [activitate, setActivitate] = useState(1.2);
  const [obiectiv, setObiectiv] = useState('mentinere');
  const [calorii, setCalorii] = useState(null);
  const [proteine, setProteine] = useState(null);
  const [carbohidrati, setCarbohidrati] = useState(null);
  const [grasimi, setGrasimi] = useState(null);

  const calculeazaCalorii = async () => {
    const greutateNum = parseFloat(greutate);
    const inaltimeNum = parseFloat(inaltime);
    const varstaNum = parseInt(varsta);

    if (isNaN(greutateNum) || isNaN(inaltimeNum) || isNaN(varstaNum) || 
        greutateNum <= 0 || inaltimeNum <= 0 || varstaNum <= 0) {
      Alert.alert('Eroare', 'Completează toate câmpurile cu valori valide.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(`${API_BASE_URL}/calculator/calculeaza`, {
        greutate: greutateNum,
        inaltime: inaltimeNum,
        varsta: varstaNum,
        gen,
        activitate,
        obiectiv
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { calorii, proteine, carbohidrati, grasimi } = response.data;
      
      setCalorii(calorii);
      setProteine(proteine);
      setCarbohidrati(carbohidrati);
      setGrasimi(grasimi);
    } catch (error) {
      console.error('Eroare la calcularea caloriilor:', error);
      Alert.alert('Eroare', 'Nu s-au putut calcula caloriile. Verifică conexiunea la server.');
    }
  };

  const salveazaDate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token invalid sau lipsă');
        return;
      }

      const data = new Date();
      const zi = String(data.getDate()).padStart(2, '0');
      const luna = String(data.getMonth() + 1).padStart(2, '0');
      const an = data.getFullYear();
      const dataFormatata = `${zi}.${luna}.${an}`;

      console.log('Se încearcă salvarea obiectivelor pentru data:', dataFormatata);
      const response = await axios.post(`${API_BASE_URL}/alimentatie/obiective/${dataFormatata}`, {
        calorii: Math.round(calorii),
        proteine: Math.round(proteine),
        carbohidrati: Math.round(carbohidrati),
        grasimi: Math.round(grasimi)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Răspuns la salvarea obiectivelor:', response.data); 

      await axios.put(`${API_BASE_URL}/alimentatie/obiective/${dataFormatata}`, {
        calorii: Math.round(calorii),
        proteine: Math.round(proteine),
        carbohidrati: Math.round(carbohidrati),
        grasimi: Math.round(grasimi)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Succes", "Obiectivele au fost salvate cu succes!");
      navigare.navigate('Alimentatie');
    } catch (error) {
      console.error('Eroare detaliată:', error.response?.data || error.message); 
      Alert.alert('Eroare', 'Nu s-au putut salva datele.');
    }
  };

  const resultsResponse = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/calculator/rezultate`, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (error) {
      console.error('Eroare la încărcarea rezultatelor:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca rezultatele.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Image source={require('../../assets/fundaluri/Calculator.png')} style={styles.image} />
          <TouchableOpacity onPress={() => navigare.goBack()} style={styles.butonInapoi}>
            <Icon name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <TextInput style={styles.input} placeholder="Greutate (kg)" placeholderTextColor="#fff" keyboardType="numeric" value={greutate} onChangeText={setGreutate} />
            <TextInput style={styles.input} placeholder="Înălțime (cm)" placeholderTextColor="#fff" keyboardType="numeric" value={inaltime} onChangeText={setInaltime} />
            <TextInput style={styles.input} placeholder="Vârstă" placeholderTextColor="#fff" keyboardType="numeric" value={varsta} onChangeText={setVarsta} />
            
            <View style={styles.radioContainer}>
              <TouchableOpacity onPress={() => setGen('male')}><Text style={gen === 'male' ? styles.selected : styles.radio}>Masculin</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setGen('female')}><Text style={gen === 'female' ? styles.selected : styles.radio}>Feminin</Text></TouchableOpacity>
            </View>
            
            <View style={styles.radioContainer}>
              <TouchableOpacity onPress={() => setActivitate(1.2)}><Text style={activitate === 1.2 ? styles.selected : styles.radio}>Sedentar</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setActivitate(1.55)}><Text style={activitate === 1.55 ? styles.selected : styles.radio}>Moderat</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setActivitate(1.9)}><Text style={activitate === 1.9 ? styles.selected : styles.radio}>Activ</Text></TouchableOpacity>
            </View>
            
            <View style={styles.radioContainer}>
              <TouchableOpacity onPress={() => setObiectiv('slabire')}><Text style={obiectiv === 'slabire' ? styles.selected : styles.radio}>Slăbire</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setObiectiv('mentinere')}><Text style={obiectiv === 'mentinere' ? styles.selected : styles.radio}>Menținere</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setObiectiv('masa')}><Text style={obiectiv === 'masa' ? styles.selected : styles.radio}>Masă</Text></TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.buton} onPress={calculeazaCalorii}>
              <Text style={styles.textButon}>Calculează</Text>
            </TouchableOpacity>

            {calorii && (
              <View style={styles.rezultateContainer}>
                <Text style={styles.rezultatText}>Calorii: {calorii} kcal</Text>
                <Text style={styles.rezultatText}>Proteine: {proteine}g</Text>
                <Text style={styles.rezultatText}>Carbohidrați: {carbohidrati}g</Text>
                <Text style={styles.rezultatText}>Grăsimi: {grasimi}g</Text>
                
                <TouchableOpacity style={styles.buton} onPress={salveazaDate}>
                  <Text style={styles.textButon}>Salvează</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  content: {
    backgroundColor: '#032851',
    borderRadius: 20,
    padding: 15,
    width: '85%',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#8caee0',
    marginTop: 195,
  },
  input: {
    height: 40,
    backgroundColor: '#001F3F',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#fff',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  radio: {
    fontSize: 16,
    color: '#8caee0',
  },
  selected: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8caee0',
    textDecorationLine: 'underline',
  },
  buton: {
    backgroundColor: '#8caee0',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  textButon: {
    color: '#032851',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rezultateContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    height: '32%',
  },
  rezultatText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
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
});

export default Calculator;