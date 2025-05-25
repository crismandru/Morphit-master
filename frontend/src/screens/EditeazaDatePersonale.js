import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EditeazaDatePersonale = () => {
  const navigare = useNavigation();
  
  const [nume, setNume] = useState('');
  const [prenume, setPrenume] = useState('');
  const [dataNasterii, setDataNasterii] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gen, setGen] = useState('');
  const [inaltime, setInaltime] = useState('');
  const [greutate, setGreutate] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  useEffect(() => {
    const incarcaDetalii = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://172.20.10.3:5000/detalii/obtine', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const detalii = response.data;
          setNume(detalii.nume || '');
          setPrenume(detalii.prenume || '');
          setDataNasterii(detalii.dataNasterii || '');
          setGen(detalii.gen || '');
          setInaltime(detalii.inaltime?.toString() || '');
          setGreutate(detalii.greutate?.toString() || '');
        }
      } catch (error) {
        console.error('Eroare la încărcarea datelor:', error);
      }
    };
    incarcaDetalii();
  }, []);

  const alegeData = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('ro-RO');
      setDataNasterii(formattedDate);
      setSelectedDate(selectedDate);
    }
  };

  const salveazaDetalii = async () => {
    const detalii = { nume, prenume, dataNasterii, gen, inaltime, greutate }; 
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (token) {
        try {
          const response = await axios.get('http://172.20.10.3:5000/detalii/obtine', {
            headers: { Authorization: `Bearer ${token}` }
          });
          await axios.put('http://172.20.10.3:5000/detalii/actualizeaza', detalii, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          if (error.response?.status === 404) {
            await axios.post('http://172.20.10.3:5000/detalii/adauga', detalii, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } else {
            throw error;
          }
        }
        console.log('Datele au fost salvate cu succes!');
        navigare.goBack();
      }
    } catch (error) {
      console.error('Eroare la salvarea detaliilor:', error);
      const errorMessage = error.response?.data?.mesaj || 'Eroare necunoscută';
      alert('Eroare la salvare: ' + errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/DetaliiPersonale.png')} style={styles.image} />
      
      <TouchableOpacity onPress={() => navigare.goBack()} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput style={styles.input} placeholder="Nume" value={nume} onChangeText={setNume} />
        <TextInput style={styles.input} placeholder="Prenume" value={prenume} onChangeText={setPrenume} />

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text style={{ color: dataNasterii ? '#000' : '#aaa' }}>
            {dataNasterii || 'Selectează data nașterii'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker value={selectedDate} mode="date" display="spinner" onChange={alegeData} />
        )}

        <TouchableOpacity onPress={() => setShowGenderPicker(true)} style={styles.input}>
          <Text style={{ color: gen ? '#032851' : '#aaa' }}>
            {gen || 'Selectează genul'}
          </Text>
        </TouchableOpacity>

        <Modal visible={showGenderPicker} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={() => { setGen('Masculin'); setShowGenderPicker(false); }}>
                <Text style={styles.modalOption}>Masculin</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setGen('Feminin'); setShowGenderPicker(false); }}>
                <Text style={styles.modalOption}>Feminin</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Text style={styles.modalCancel}>Anulează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TextInput style={styles.input} placeholder="Înălțime (cm)" value={inaltime} onChangeText={setInaltime} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Greutate (kg)" value={greutate} onChangeText={setGreutate} keyboardType="numeric" />

        <TouchableOpacity style={styles.butonSalveaza} onPress={salveazaDetalii}>
          <Text style={styles.textButonSalveaza}>Salvează modificările</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContainer: { 
    width: '100%' 
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
  content: { 
    paddingTop: 300,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: '5%',
    paddingBottom: 50
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    height: 45,
    justifyContent: 'center'
  },
  butonSalveaza: { 
    backgroundColor: '#032851',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 10
  },
  textButonSalveaza: { 
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold' 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 180,
    alignItems: 'center'
  },
  modalOption: { 
    fontSize: 18,
    padding: 4,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold'  
  },
  modalCancel: { 
    fontSize: 18,
    padding: 6,
    width: '100%',
    textAlign: 'center',
    color: '#8caee0' 
  }
});

export default EditeazaDatePersonale;