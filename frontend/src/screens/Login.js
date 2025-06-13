import React, { useState } from 'react';
import { View, Image, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://172.20.10.2:5000';

const Login = () => {
  const [nrTelefon, setNrTelefon] = useState('');
  const [parola, setParola] = useState('');
  const [nrTelefonFocus, setNrTelefonFocus] = useState(false);
  const [parolaFocus, setParolaFocus] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    console.log('Număr de telefon trimis:', nrTelefon);
    console.log('Parola trimisă:', parola);
    try {
      const response = await axios.post(`${API_URL}/autentificare/login`, {
        nrTelefon,
        parola,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        console.log('Token salvat:', response.data.token);
        alert('Autentificare reușită!');
        navigation.navigate('Welcome');
      } else {
        alert('Token lipsă din răspuns!');
      }
    } catch (error) {
      console.error('Eroare:', error.response?.data || error.message);
      alert(error.response?.data?.mesaj || 'Număr de telefon sau parolă incorecte!');
    }
  };

  const handleRegister = () => {
    console.log('Navigare către pagina de înregistrare');
    navigation.navigate('Register');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Image source={require('../../assets/fundaluri/LoginScreen.png')} style={styles.backgroundImage} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.loginBox}>
            <TextInput
              style={[styles.input, nrTelefonFocus && styles.inputFocus]}
              placeholder="Număr de telefon"
              placeholderTextColor="#333"
              keyboardType="phone-pad"
              maxLength={10}
              value={nrTelefon}
              onChangeText={text => setNrTelefon(text.replace(/[^0-9]/g, ''))}
              onFocus={() => setNrTelefonFocus(true)}
              onBlur={() => setNrTelefonFocus(false)}
            />

            <TextInput
              style={[styles.input, parolaFocus && styles.inputFocus]}
              placeholder="Parolă"
              placeholderTextColor="#333"
              secureTextEntry
              value={parola}
              onChangeText={setParola}
              onFocus={() => setParolaFocus(true)}
              onBlur={() => setParolaFocus(false)}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Intră în Cont</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pentru prima oară aici? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Înregistrează-te!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 100,
  },
  loginBox: {
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: -20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#E6F0FA',
    borderRadius: 15,
    paddingLeft: 15,
    fontSize: 16,
    marginBottom: 15,
    borderColor: '#E6F0FA',
    borderWidth: 1,
  },
  inputFocus: {
    borderColor: '#032851',
    borderWidth: 2,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#032851',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#032851',
    fontSize: 16,
  },
  registerLink: {
    color: '#032851',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Login;