import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const MeniuPrincipal = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/MeniuPrincipal.png')} style={styles.image} />

      <TouchableOpacity onPress={() => navigation.navigate('DetaliiPersonale')} style={styles.butonDetalii}>
        <Icon name="dots-vertical" size={55} color="#032851" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ExercitiiFata')} style={styles.button}>
        <Image source={require('../../assets/butoane/ButonExercitii.png')} style={styles.butonExercitii} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AdaugaAntrenament')} style={styles.buttonAdauga}>
        <Image source={require('../../assets/butoane/ButonAdaugaAntrenament.png')} style={styles.butonExercitii} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Albume')} style={styles.buttonPoze}>
        <Image source={require('../../assets/butoane/ButonPoze.png')} style={styles.butonExercitii} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Statistici')} style={styles.buttonStatistici}>
        <Image source={require('../../assets/butoane/ButonStatistici.png')} style={styles.butonExercitii} />
      </TouchableOpacity>

      <View style={styles.butoaneDeJos}>
        <TouchableOpacity onPress={() => navigation.navigate('Somn')} style={styles.bottomButton}>
          <Image source={require('../../assets/butoane/ButonSomn.png')} style={styles.bottomButtonImage} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Alimentatie')} style={styles.bottomButton}>
          <Image source={require('../../assets/butoane/ButonMancare.png')} style={styles.bottomButtonImage} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Jurnal')} style={styles.bottomButton}>
          <Image source={require('../../assets/butoane/ButonJurnal.png')} style={styles.bottomButtonImage} />
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A3C1E2',
  },
  image: {
    position: 'absolute',
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
  butonDetalii: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonAdauga: {
    position: 'absolute',
    top: '43.8%',
    width: 250,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPoze: {
    position: 'absolute',
    top: '56.5%',
    width: 250,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStatistici: {
    position: 'absolute',
    top: '68%',
    width: 250,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butonExercitii: {
    top: '-50%',
    width: 390,
    height: 100,
    resizeMode: 'contain',
  },
  butoaneDeJos: {
    position: 'absolute',
    bottom: 45, 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    width: '90%',
  },
  bottomButton: {
    flex: 1, 
    alignItems: 'center',
  },
  bottomButtonImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});

export default MeniuPrincipal;