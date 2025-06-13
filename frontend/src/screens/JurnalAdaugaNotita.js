import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const JurnalAdaugaNotita = ({ route }) => {
  const navigation = useNavigation();
  const [titlu, setTitlu] = useState('');
  const [continut, setContinut] = useState('');
  const [stare, setStare] = useState('neutru');
  const [id, setId] = useState(null);

  useEffect(() => {
    if (route.params?.id) {
      setId(route.params.id);
      setTitlu(route.params.titlu || '');
      setContinut(route.params.continut || '');
      setStare(route.params.stare || 'neutru');
    }
  }, [route.params]);

  const salveazaNotita = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Eroare', 'Nu sunteți autentificat');
        return;
      }

      const notitaData = {
        titlu,
        continut,
        stare
      };

      if (id) {
        await axios.put(`http://172.20.10.2:5000/jurnal/${id}`, notitaData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://172.20.10.2:5000/jurnal', notitaData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Eroare la salvare:', error);
      Alert.alert('Eroare', 'Nu s-a putut salva notița');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <TextInput
        style={styles.inputTitlu}
        placeholder="Titlu..."
        value={titlu}
        onChangeText={setTitlu}
      />

      <TextInput
        style={styles.input}
        placeholder="Scrie aici..."
        value={continut}
        onChangeText={setContinut}
        multiline
      />

      <View style={styles.stareContainer}>
        <TouchableOpacity 
          style={[styles.stareButton, stare === 'fericit' && styles.stareButtonActive]} 
          onPress={() => setStare('fericit')}
        >
          <Icon name="happy-outline" size={24} color={stare === 'fericit' ? '#fff' : '#032851'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.stareButton, stare === 'neutru' && styles.stareButtonActive]} 
          onPress={() => setStare('neutru')}
        >
          <Icon name="ellipse-outline" size={24} color={stare === 'neutru' ? '#fff' : '#032851'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.stareButton, stare === 'trist' && styles.stareButtonActive]} 
          onPress={() => setStare('trist')}
        >
          <Icon name="sad-outline" size={24} color={stare === 'trist' ? '#fff' : '#032851'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.buton} onPress={salveazaNotita}>
        <Text style={styles.textButon}>{id ? 'Salvează modificările' : 'Adaugă notiță'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#032851',
    padding: 20,
    paddingTop: 110,
  },
  inputTitlu: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    height: 50,
    marginBottom: 10,
    fontSize: 18,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    height: 200,
    marginBottom: 15,
    textAlignVertical: 'top',
    marginTop: 10,
  },
  stareContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stareButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  stareButtonActive: {
    backgroundColor: '#8caee0',
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
  buton: {
    backgroundColor: '#8caee0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  textButon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default JurnalAdaugaNotita;