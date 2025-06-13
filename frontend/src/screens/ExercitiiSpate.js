import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ExercitiiSpate = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/ExercitiiSpate.png')} style={styles.image} />

      <TouchableOpacity onPress={() => navigation.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Trapez')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiSpate/ButonTrapez.png')} style={styles.butonTrapez} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Triceps')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiSpate/ButonTriceps.png')} style={styles.butonTriceps} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Spate')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiSpate/ButonSpate.png')} style={styles.butonSpate} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Fesieri')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiSpate/ButonFesieri.png')} style={styles.butonFesieri} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Femural')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiSpate/ButonFemural.png')} style={styles.butonFemural} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Gambe')} style={styles.button}>
        <Image source={require('../../assets/butoane/butoaneExercitiiSpate/ButonGambe.png')} style={styles.butonGambe} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ExercitiiFata')} style={styles.button}>
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
  butonTrapez: {
    position: 'absolute',
    top: '-75%', 
    left: 150,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonTriceps: {
    position: 'absolute',
    top: '-15%', 
    left: -70,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonSpate: {
    position: 'absolute',
    top: '170%', 
    left: 170,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonFesieri: {
    position: 'absolute',
    top: '160%', 
    left: -75,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonFemural: {
    position: 'absolute',
    top: '270%', 
    left: 155,  
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonGambe: {
    position: 'absolute',
    top: '380%', 
    left: -75,  
    width: 180,
    height: 80,
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
  buton180: {
    position: 'absolute',
    top: '460%',
    width: 260,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExercitiiSpate;