import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Welcome from './src/screens/Welcome';
import MeniuPrincipal from './src/screens/MeniuPrincipal';
import DetaliiPersonale from './src/screens/DetaliiPersonale';
import EditeazaDatePersonale from './src/screens/EditeazaDatePersonale';
import ExercitiiFata from './src/screens/ExercitiiFata';
import Umeri from './src/screens/ExercitiiFataToate/Umeri';
import Piept from './src/screens/ExercitiiFataToate/Piept';
import Biceps from './src/screens/ExercitiiFataToate/Biceps';
import Abdomen from './src/screens/ExercitiiFataToate/Abdomen';
import Antebrate from './src/screens/ExercitiiFataToate/Antebrate';
import Cvadriceps from './src/screens/ExercitiiFataToate/Cvadriceps';
import ExercitiiSpate from './src/screens/ExercitiiSpate';
import Trapez from './src/screens/ExercitiiSpateToate/Trapez';
import Triceps from './src/screens/ExercitiiSpateToate/Triceps';
import Spate from './src/screens/ExercitiiSpateToate/Spate';
import Fesieri from './src/screens/ExercitiiSpateToate/Fesieri';
import Femural from './src/screens/ExercitiiSpateToate/Femural';
import Gambe from './src/screens/ExercitiiSpateToate/Gambe';
import AdaugaAntrenament from './src/screens/AdaugaAntrenament';
import AntrenamenteAnterioare from './src/screens/AntrenamenteAnterioare';
import Albume from './src/screens/Albume';
import AlbumDetalii from './src/screens/AlbumDetalii';
import Statistici from './src/screens/Statistici';
import Somn from './src/screens/Somn';
import SomnAdaugaSesiune from './src/screens/SomnAdaugaSesiune';
import Alimentatie from './src/screens/Alimentatie';
import MeseAnterioare from './src/screens/MeseAnterioare';
import Calculator from './src/screens/Calculator';
import Jurnal from './src/screens/Jurnal';
import JurnalAdaugaNotita from './src/screens/JurnalAdaugaNotita';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="MeniuPrincipal" component={MeniuPrincipal} />
        <Stack.Screen name="DetaliiPersonale" component={DetaliiPersonale} />
        <Stack.Screen name="EditeazaDatePersonale" component={EditeazaDatePersonale} />
        <Stack.Screen name="ExercitiiFata" component={ExercitiiFata} />
        <Stack.Screen name="Umeri" component={Umeri} />
        <Stack.Screen name="Piept" component={Piept} />
        <Stack.Screen name="Biceps" component={Biceps} />
        <Stack.Screen name="Abdomen" component={Abdomen} />
        <Stack.Screen name="Antebrate" component={Antebrate} />
        <Stack.Screen name="Cvadriceps" component={Cvadriceps} />
        <Stack.Screen name="ExercitiiSpate" component={ExercitiiSpate} />
        <Stack.Screen name="Trapez" component={Trapez} /> 
        <Stack.Screen name="Triceps" component={Triceps} />
        <Stack.Screen name="Spate" component={Spate} />
        <Stack.Screen name="Fesieri" component={Fesieri} />
        <Stack.Screen name="Femural" component={Femural} />
        <Stack.Screen name="Gambe" component={Gambe} />
        <Stack.Screen name="AdaugaAntrenament" component={AdaugaAntrenament} />
        <Stack.Screen name="AntrenamenteAnterioare" component={AntrenamenteAnterioare} />
        <Stack.Screen name="Albume" component={Albume} />
        <Stack.Screen name="AlbumDetalii" component={AlbumDetalii} />
        <Stack.Screen name="Statistici" component={Statistici} />
        <Stack.Screen name="Somn" component={Somn} />
        <Stack.Screen name="SomnAdaugaSesiune" component={SomnAdaugaSesiune} />
        <Stack.Screen name="Alimentatie" component={Alimentatie} />
        <Stack.Screen name="MeseAnterioare" component={MeseAnterioare} />
        <Stack.Screen name="Calculator" component={Calculator} />
        <Stack.Screen name="Jurnal" component={Jurnal} />
        <Stack.Screen name="JurnalAdaugaNotita" component={JurnalAdaugaNotita} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
