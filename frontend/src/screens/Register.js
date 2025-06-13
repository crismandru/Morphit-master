import React, { useState } from 'react';
import { View, Image, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Register = () => {
  const [nrTelefon, setNrTelefon] = useState('');
  const [parola, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (parola !== confirmPassword) {
      alert('Parolele nu coincid!');
      return;
    }
    
    try {
      const response = await fetch('http://172.20.10.2:5000/autentificare/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nrTelefon,
          parola,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Înregistrare reușită!');
        navigation.navigate('Login');
      } else {
        alert(data.mesaj || 'Eroare la înregistrare!');
      }
    } catch (error) {
      console.error('Eroare:', error);
      alert('Ceva n-a mers bine...');
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image source={require('../../assets/fundaluri/Register.png')} style={styles.backgroundImage} />

        <View style={styles.registerBox}>
          <Text style={styles.title}>Creează un cont nou</Text>

          <TextInput
            style={styles.input}
            placeholder="Număr de telefon"
            placeholderTextColor="#333"
            keyboardType="phone-pad"
            maxLength={10}
            value={nrTelefon}
            onChangeText={text => setNrTelefon(text.replace(/[^0-9]/g, ''))}
          />

          <TextInput
            style={styles.input}
            placeholder="Parolă"
            placeholderTextColor="#333"
            secureTextEntry
            value={parola}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmă parola"
            placeholderTextColor="#333"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>Înregistrează-te</Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Ai deja un cont? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Conectează-te</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  registerBox: {
    width: '80%',
    alignItems: 'center',
    marginTop: 320, 
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#032851',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#E6F0FA',
    borderRadius: 15, 
    paddingLeft: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  registerButton: {
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#032851',
    fontSize: 16,
  },
  loginLink: {
    color: '#032851',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Register;