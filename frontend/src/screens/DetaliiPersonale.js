import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const DetaliiPersonale = () => {
  const navigare = useNavigation();
  const [detalii, setDetalii] = useState(null);
  const [loading, setLoading] = useState(true);

  const incarcaDetalii = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (token) {
        console.log('Se face cererea către server...');
        const response = await axios.get('http://172.20.10.2:5000/detalii/obtine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Răspuns de la server:', response.data);
        setDetalii(response.data);
      } else {
        console.log('Nu există token în AsyncStorage');
        navigare.navigate('Autentificare');
      }
    } catch (error) {
      console.error('Eroare la încărcarea datelor:', error);
      if (error.response?.status === 404) {
        setDetalii(null);
      } else {
        console.error('Detalii eroare:', error.response?.data);
        console.error('Status eroare:', error.response?.status);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      incarcaDetalii();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigare.navigate('Login');
    } catch (error) {
      console.error('Eroare la delogare:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/DatePersonale.png')} style={styles.image} />
      
      <TouchableOpacity onPress={() => navigare.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.textLoading}>Se încarcă...</Text>
      ) : (
        <View style={styles.card}>
          {detalii ? (
            <>
              <View style={styles.detaliu}>
                <Icon name="person" size={24} color="#fff" />
                <Text style={styles.textDetaliu}>Nume: <Text style={styles.bold}>{detalii.nume}</Text></Text>
              </View>
              <View style={styles.detaliu}>
                <Icon name="person-outline" size={24} color="#fff" />
                <Text style={styles.textDetaliu}>Prenume: <Text style={styles.bold}>{detalii.prenume}</Text></Text>
              </View>
              <View style={styles.detaliu}>
                <Icon name="calendar" size={24} color="#fff" />
                <Text style={styles.textDetaliu}>Data nașterii: <Text style={styles.bold}>{detalii.dataNasterii}</Text></Text>
              </View>
              <View style={styles.detaliu}>
                <Icon name="male-female" size={24} color="#fff" />
                <Text style={styles.textDetaliu}>Gen: <Text style={styles.bold}>{detalii.gen}</Text></Text>
              </View>
              <View style={styles.detaliu}>
                <Icon name="arrow-up-outline" size={24} color="#fff" />
                <Text style={styles.textDetaliu}>Înălțime: <Text style={styles.bold}>{detalii.inaltime} cm</Text></Text>
              </View>
              <View style={styles.detaliu}>
                <Icon name="fitness" size={24} color="#fff" />
                <Text style={styles.textDetaliu}>Greutate: <Text style={styles.bold}>{detalii.greutate} kg</Text></Text>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="information-circle-outline" size={48} color="#fff" />
              <Text style={styles.textNoData}>Nu există detalii salvate.</Text>
              <Text style={styles.textNoDataSubtitle}>Apasă butonul de mai jos pentru a adăuga datele tale personale.</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.butonEditeaza} onPress={() => navigare.navigate('EditeazaDatePersonale')}>
          <Icon name="create-outline" size={24} color="#fff" />
          <Text style={styles.textButonEditeaza}>Editează datele</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.butonDelogare} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.textButonDelogare}>Delogare</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1D3557',
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
  card: {
    marginTop: 320,
    width: '90%',
    backgroundColor: '#8caee0',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 100,
  },
  textLoading: {
    color: '#fff',
    fontSize: 18,
    marginTop: 100,
  },
  detaliu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  textDetaliu: {
    fontSize: 18,
    marginLeft: 10,
    color: '#fff',
  },
  bold: {
    fontWeight: 'bold',
    color: '#032851',
  },
  textNoData: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  textNoDataSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    position: 'absolute',
    bottom: 60,
  },
  butonEditeaza: {
    backgroundColor: '#8caee0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  butonDelogare: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  textButonEditeaza: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  textButonDelogare: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
});

export default DetaliiPersonale;