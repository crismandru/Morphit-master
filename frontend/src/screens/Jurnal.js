import React, { useEffect, useState } from 'react';
import { View, Image, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const Jurnal = () => {
  const navigare = useNavigation();
  const [notite, setNotite] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const incarcaNotite = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://172.20.10.3:5000/jurnal', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotite(response.data);
        }
      } catch (error) {
        console.error('Eroare la încărcarea notițelor:', error);
        Alert.alert('Eroare', 'Nu s-au putut încărca notițele');
      }
    };

    if (isFocused) incarcaNotite();
  }, [isFocused]);

  const stergeNotita = async (id) => {
    Alert.alert(
      'Confirmare',
      'Ești sigur că vrei să ștergi această notiță?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`http://172.20.10.3:5000/jurnal/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setNotite(notite.filter(notita => notita._id !== id));
            } catch (error) {
              console.error('Eroare la ștergerea notiței:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge notița');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const editeazaNotita = (notita) => {
    navigare.navigate('JurnalAdaugaNotita', {
      id: notita._id,
      titlu: notita.titlu,
      continut: notita.continut,
      stare: notita.stare,
      data: notita.data,
    });
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/Jurnal.png')} style={styles.image} />

      <TouchableOpacity onPress={() => navigare.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.titlu}>Din zilele trecute...</Text>

        {notite.length === 0 ? (
          <Text style={styles.textSecundar}>Nicio notiță adăugată.</Text>
        ) : (
          <FlatList
            data={notite}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => editeazaNotita(item)} style={styles.notita}>
                <View style={styles.containerNotita}>
                  <Text style={styles.titluNotita}>{item.titlu}</Text>
                  <Text style={styles.textNotita}>{item.continut}</Text>
                  <View style={styles.footerNotita}>
                    <Text style={styles.data}>{new Date(item.data).toLocaleDateString()}</Text>
                    <Icon 
                      name={
                        item.stare === 'fericit' ? 'happy-outline' :
                        item.stare === 'trist' ? 'sad-outline' :
                        'ellipse-outline'
                      } 
                      size={24} 
                      color="#032851" 
                    />
                  </View>
                </View>
                <TouchableOpacity onPress={() => stergeNotita(item._id)} style={styles.iconContainer}>
                  <Icon name="trash" size={20} color="#8caee0" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <TouchableOpacity style={styles.buton} onPress={() => navigare.navigate('JurnalAdaugaNotita')}>
        <Text style={styles.textButon}>Adaugă Notiță</Text>
      </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  titlu: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    marginBottom: 10,
  },
  textSecundar: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  notita: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerNotita: {
    flexDirection: 'column',
    padding: 0,
    flex: 1,
  },
  titluNotita: {
    fontSize: 18,
    color: '#032851',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textNotita: {
    fontSize: 16,
    color: '#032851',
  },
  data: {
    fontSize: 12,
    color: '#8caee0',
    marginTop: 5,
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
    marginBottom: 30,
  },
  textButon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerNotita: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
});

export default Jurnal;