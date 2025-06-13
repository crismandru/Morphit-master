import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ExercitiiFata = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/ExercitiiFata.png')} style={styles.image} />

      <TouchableOpacity onPress={() => navigation.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Umeri')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiFata/ButonUmeri.png')} style={styles.butonUmeri} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Piept')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiFata/ButonPiept.png')} style={styles.butonPiept} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Biceps')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiFata/ButonBiceps.png')} style={styles.butonBiceps} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Antebrate')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiFata/ButonAntebrate.png')} style={styles.butonAntebrate} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Abdomen')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiFata/ButonAbdomen.png')} style={styles.butonAbdomen} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cvadriceps')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiFata/ButonCvadriceps.png')} style={styles.butonCvadriceps} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ExercitiiSpate')} style={styles.button}>
        <Image source={require('../../assets/butoane/Buton180.png')} style={styles.buton180} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3C1E2',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  button: {
    position: 'absolute',
    top: '30%',
    width: 250,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonInapoi: {
    position: 'absolute',
    top: 70,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonUmeri: {
    position: 'absolute',
    top: '-80%', 
    left: -80,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonPiept: {
    position: 'absolute',
    top: '-65%', 
    left: 150,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonBiceps: {
    position: 'absolute',
    top: '50%', 
    left: -95,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonAntebrate: {
    position: 'absolute',
    top: '175%', 
    left: 135,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonAbdomen: {
    position: 'absolute',
    top: '170%', 
    left: -70,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonCvadriceps: {
    position: 'absolute',
    top: '300%', 
    left: -50,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buton180: {
    position: 'absolute',
    top: '460%',
    width: 260,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExercitiiFata;