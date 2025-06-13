import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const API_BASE_URL = 'http://172.20.10.2:5000';
const screenWidth = Dimensions.get('window').width;

const Statistici = () => {
  const navigare = useNavigation();
  const [dateSomn, setDateSomn] = useState([]);
  const [dateAlimentatie, setDateAlimentatie] = useState([]);
  const [dateJurnal, setDateJurnal] = useState([]);
  const [dateAntrenamente, setDateAntrenamente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    somn: true,
    alimentatie: true,
    jurnal: true,
    antrenamente: true,
    corelatii: true
  });
  const [modalGraficVizibil, setModalGraficVizibil] = useState(false);
  const [graficSelectat, setGraficSelectat] = useState(null);
  const [dateGrafic, setDateGrafic] = useState(null);

  useEffect(() => {
    preiaDate();
  }, []);

  const preiaDate = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Nu sunteți autentificat');
        return;
      }

      try {
        const raspunsSomn = await axios.get(`${API_BASE_URL}/somn`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Răspuns somn:', raspunsSomn.data);
        if (raspunsSomn.data && Array.isArray(raspunsSomn.data)) {
          const dateSortate = raspunsSomn.data
            .filter(zi => zi && zi.data && zi.oraAdormire && zi.oraTrezire)
            .sort((a, b) => new Date(b.data) - new Date(a.data));
          setDateSomn(dateSortate);
        } else {
          console.log('Format date somn invalid:', raspunsSomn.data);
          setDateSomn([]);
        }
      } catch (error) {
        console.log('Eroare la preluarea datelor de somn:', error.message);
        setDateSomn([]);
      }

      // Preluăm datele pentru alimentație
      try {
        const raspunsAlimentatie = await axios.get(`${API_BASE_URL}/alimentatie/istoric`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (raspunsAlimentatie.data && Array.isArray(raspunsAlimentatie.data)) {
          const dateSortate = raspunsAlimentatie.data.sort((a, b) => new Date(b.data) - new Date(a.data));
          setDateAlimentatie(dateSortate);
        } else {
          console.log('Format date alimentație invalid:', raspunsAlimentatie.data);
          setDateAlimentatie([]);
        }
      } catch (error) {
        console.log('Eroare la preluarea datelor de alimentație:', error.message);
        setDateAlimentatie([]);
      }

      // Preluăm datele pentru jurnal
      try {
        const raspunsJurnal = await axios.get(`${API_BASE_URL}/jurnal`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Răspuns jurnal:', raspunsJurnal.data);
        if (raspunsJurnal.data && Array.isArray(raspunsJurnal.data)) {
          const dateSortate = raspunsJurnal.data
            .filter(zi => zi && zi.data && zi.stare)
            .sort((a, b) => new Date(b.data) - new Date(a.data));
          setDateJurnal(dateSortate);
        } else {
          console.log('Format date jurnal invalid:', raspunsJurnal.data);
          setDateJurnal([]);
        }
      } catch (error) {
        console.log('Eroare la preluarea datelor de jurnal:', error.message);
        setDateJurnal([]);
      }

      // Preluăm datele pentru antrenamente
      try {
        const raspunsAntrenamente = await axios.get(`${API_BASE_URL}/api/antrenamente`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (raspunsAntrenamente.data && Array.isArray(raspunsAntrenamente.data)) {
          const dateSortate = raspunsAntrenamente.data.sort((a, b) => new Date(b.data) - new Date(a.data));
          setDateAntrenamente(dateSortate);
        } else {
          console.log('Format date antrenamente invalid:', raspunsAntrenamente.data);
          setDateAntrenamente([]);
        }
      } catch (error) {
        console.log('Eroare la preluarea datelor de antrenamente:', error.message);
        setDateAntrenamente([]);
      }

    } catch (error) {
      console.error('Eroare generală:', error.message);
      setError('A apărut o eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrează Statisticile</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.modalFilterButton, activeFilters.somn && styles.modalFilterButtonActive]}
            onPress={() => toggleFilter('somn')}
          >
            <Icon name="moon" size={24} color={activeFilters.somn ? "#fff" : "#8caee0"} />
            <Text style={[styles.modalFilterButtonText, activeFilters.somn && styles.modalFilterButtonTextActive]}>
              Statistici Somn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalFilterButton, activeFilters.alimentatie && styles.modalFilterButtonActive]}
            onPress={() => toggleFilter('alimentatie')}
          >
            <Icon name="nutrition" size={24} color={activeFilters.alimentatie ? "#fff" : "#8caee0"} />
            <Text style={[styles.modalFilterButtonText, activeFilters.alimentatie && styles.modalFilterButtonTextActive]}>
              Statistici Alimentație
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalFilterButton, activeFilters.jurnal && styles.modalFilterButtonActive]}
            onPress={() => toggleFilter('jurnal')}
          >
            <Icon name="journal" size={24} color={activeFilters.jurnal ? "#fff" : "#8caee0"} />
            <Text style={[styles.modalFilterButtonText, activeFilters.jurnal && styles.modalFilterButtonTextActive]}>
              Statistici Jurnal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalFilterButton, activeFilters.antrenamente && styles.modalFilterButtonActive]}
            onPress={() => toggleFilter('antrenamente')}
          >
            <Icon name="fitness" size={24} color={activeFilters.antrenamente ? "#fff" : "#8caee0"} />
            <Text style={[styles.modalFilterButtonText, activeFilters.antrenamente && styles.modalFilterButtonTextActive]}>
              Statistici Antrenamente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalFilterButton, activeFilters.corelatii && styles.modalFilterButtonActive]}
            onPress={() => toggleFilter('corelatii')}
          >
            <Icon name="analytics" size={24} color={activeFilters.corelatii ? "#fff" : "#8caee0"} />
            <Text style={[styles.modalFilterButtonText, activeFilters.corelatii && styles.modalFilterButtonTextActive]}>
              Corelații
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderGraficModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalGraficVizibil}
      onRequestClose={() => setModalGraficVizibil(false)}
    >
      <View style={styles.modalGraficOverlay}>
        <View style={[styles.modalGraficContent, styles.modalGraficContentDark]}>
          <View style={styles.modalGraficHeader}>
            <Text style={styles.modalGraficTitle}>{graficSelectat?.titlu}</Text>
            <TouchableOpacity onPress={() => setModalGraficVizibil(false)}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.modalGraficScrollContent}
          >
            <View style={[styles.modalGraficContainer, styles.modalGraficContainerDark]}>
              {graficSelectat?.tip === 'line' && (
                <LineChart
                  data={dateGrafic}
                  width={Math.max(screenWidth - 40, dateGrafic.labels.length * 100)}
                  height={400}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(140, 174, 224, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForLabels: {
                      fontSize: 14,
                      fill: '#fff',
                    },
                    propsForBackgroundLines: {
                      stroke: 'rgba(255, 255, 255, 0.1)',
                      strokeWidth: 1,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: '#8caee0',
                    },
                    formatYLabel: (value) => `${value}${graficSelectat?.sufix || ''}`,
                  }}
                  bezier
                  style={[styles.modalGrafic, { marginLeft: 20 }]}
                  fromZero
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={true}
                  withHorizontalLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  segments={5}
                  yAxisSuffix=""
                  yAxisInterval={1}
                  renderDotContent={({ x, y, index, data }) => {
                    if (!data || !data[index]) return null;
                    const ziua = dateGrafic.labels[index];
                    const oreSomn = Number(data[index]).toFixed(1);
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            `Ore de somn - ${ziua}`,
                            `Ai dormit ${oreSomn} ore în această zi.`
                          );
                        }}
                        style={{
                          position: 'absolute',
                          top: y - 20,
                          left: x - 15,
                          backgroundColor: 'rgba(140, 174, 224, 0.9)',
                          padding: 4,
                          borderRadius: 4,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 10 }}>
                          {oreSomn}h
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
              {graficSelectat?.tip === 'bar' && (
                <BarChart
                  data={dateGrafic}
                  width={Math.max(screenWidth - 40, dateGrafic.labels.length * 100)}
                  height={400}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(140, 174, 224, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForLabels: {
                      fontSize: 14,
                      fill: '#fff',
                    },
                    propsForBackgroundLines: {
                      stroke: 'rgba(255, 255, 255, 0.1)',
                      strokeWidth: 1,
                    },
                    barPercentage: 0.7,
                    formatYLabel: (value) => `${value}`,
                  }}
                  style={[styles.modalGrafic, { marginLeft: 20 }]}
                  fromZero
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={true}
                  withHorizontalLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  segments={5}
                  yAxisSuffix=""
                  yAxisInterval={1}
                  renderBarContent={({ x, y, width, height, index, data }) => {
                    if (!data || !data[index]) return null;
                    return (
                      <View style={{
                        position: 'absolute',
                        top: y - 20,
                        left: x + width/2 - 20,
                        backgroundColor: 'rgba(140, 174, 224, 0.9)',
                        padding: 4,
                        borderRadius: 4,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>
                          {Number(data[index])}
                        </Text>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderStatisticiSomn = () => {
    // Luăm ultimele 7 zile și le sortăm cronologic
    const ultimele7Zile = dateSomn
      .filter(zi => zi && zi.data && zi.oraAdormire && zi.oraTrezire)
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(-7);

    if (ultimele7Zile.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="moon" size={24} color="#8caee0" />
            <Text style={styles.sectionTitle}>Statistici Somn</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.noDataText}>Nu există date disponibile pentru somn</Text>
          </View>
        </View>
      );
    }

    // Formatăm datele pentru afișare
    const date = ultimele7Zile.map(zi => {
      const data = new Date(zi.data);
      return `${data.getDate()}/${data.getMonth() + 1}`;
    });

    // Calculăm orele de somn pentru fiecare zi
    const oreSomn = ultimele7Zile.map(zi => {
      if (!zi.oraAdormire || !zi.oraTrezire) return 0;
      try {
        const [oreAdormire, minuteAdormire] = zi.oraAdormire.split(':').map(Number);
        const [oreTrezire, minuteTrezire] = zi.oraTrezire.split(':').map(Number);
        
        let ore = oreTrezire - oreAdormire;
        let minute = minuteTrezire - minuteAdormire;
        
        if (minute < 0) {
          ore -= 1;
          minute += 60;
        }
        
        if (ore < 0) {
          ore += 24;
        }
        
        const oreTotale = ore + (minute / 60);
        return Math.max(0, Math.min(24, oreTotale));
      } catch (error) {
        console.log('Eroare la procesarea orelor de somn:', error);
        return 0;
      }
    });

    // Calculăm media orelor de somn
    const mediaOreSomn = oreSomn.reduce((acc, ore) => acc + ore, 0) / oreSomn.length;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="moon" size={24} color="#8caee0" />
          <Text style={styles.sectionTitle}>Statistici Somn</Text>
        </View>

        <TouchableOpacity 
          style={[styles.card, styles.graphCard]}
          onPress={() => {
            setGraficSelectat({
              tip: 'line',
              titlu: 'Ore de somn',
              sufix: 'h'
            });
            setDateGrafic({
              labels: date,
              datasets: [{ data: oreSomn }]
            });
            setModalGraficVizibil(true);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.graphCardTitle}>Ore de somn</Text>
            <View style={styles.expandIconContainer}>
              <Icon name="expand" size={20} color="#fff" />
            </View>
          </View>
          <LineChart
            data={{
              labels: date,
              datasets: [{
                data: oreSomn
              }]
            }}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(140, 174, 224, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
                fill: '#fff',
              },
              propsForBackgroundLines: {
                stroke: 'rgba(255, 255, 255, 0.1)',
                strokeWidth: 1,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#8caee0',
              },
              formatYLabel: (value) => `${value}h`,
            }}
            bezier
            style={[styles.chart, { marginHorizontal: -10 }]}
            fromZero
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={5}
            yAxisSuffix=""
            yAxisInterval={1}
            renderDotContent={({ x, y, index, data }) => {
              if (!data || !data[index]) return null;
              return (
                <View style={{
                  position: 'absolute',
                  top: y - 20,
                  left: x - 15,
                  backgroundColor: 'rgba(140, 174, 224, 0.9)',
                  padding: 4,
                  borderRadius: 4,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10 }}>
                    {Number(data[index]).toFixed(1)}h
                  </Text>
                </View>
              );
            }}
          />
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {mediaOreSomn.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Medie ore somn</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {ultimele7Zile.filter(zi => zi.rating && zi.rating >= 4).length}
            </Text>
            <Text style={styles.statLabel}>Nopți bune</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatisticiAlimentatie = () => {
    // Luăm ultimele 7 zile și le sortăm cronologic
    const ultimele7Zile = dateAlimentatie
      .filter(zi => zi && zi.data && zi.mese && zi.mese.length > 0)
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(-7);

    if (ultimele7Zile.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="nutrition" size={24} color="#8caee0" />
            <Text style={styles.sectionTitle}>Statistici Alimentație</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.noDataText}>Nu există date disponibile pentru alimentație</Text>
          </View>
        </View>
      );
    }

    // Formatăm datele pentru afișare
    const date = ultimele7Zile.map(zi => {
      if (!zi.data) return '';
      try {
        // Verificăm dacă data este în format DD.MM.YYYY
        const [ziua, luna] = zi.data.split('.');
        if (ziua && luna) {
          return `${ziua}/${luna}`;
        }
        // Verificăm dacă data este în format ISO (YYYY-MM-DD)
        const [an, lunaISO, ziuaISO] = zi.data.split('-');
        if (an && lunaISO && ziuaISO) {
          return `${ziuaISO}/${lunaISO}`;
        }
        // Dacă nu este în niciunul din formatele așteptate, încercăm să o parsam
        const data = new Date(zi.data);
        if (isNaN(data.getTime())) {
          console.log('Data invalida:', zi.data);
          return '';
        }
        const ziuaFormatata = data.getDate().toString().padStart(2, '0');
        const lunaFormatata = (data.getMonth() + 1).toString().padStart(2, '0');
        return `${ziuaFormatata}/${lunaFormatata}`;
      } catch (error) {
        console.error('Eroare la formatarea datei:', error, zi.data);
        return '';
      }
    });

    // Calculăm caloriile pentru fiecare zi
    const calorii = ultimele7Zile.map(zi => {
      const caloriiZi = zi.mese.reduce((acc, masa) => acc + (masa.calorii || 0), 0);
      return Math.round(caloriiZi);
    });

    // Calculăm macronutrienții pentru toate zilele
    const macronutrienti = ultimele7Zile.reduce((acc, zi) => {
      const ziMacro = zi.mese.reduce((sum, masa) => ({
        proteine: sum.proteine + (masa.proteine || 0),
        carbohidrati: sum.carbohidrati + (masa.carbohidrati || 0),
        grasimi: sum.grasimi + (masa.grasimi || 0)
      }), { proteine: 0, carbohidrati: 0, grasimi: 0 });

      return {
        proteine: acc.proteine + ziMacro.proteine,
        carbohidrati: acc.carbohidrati + ziMacro.carbohidrati,
        grasimi: acc.grasimi + ziMacro.grasimi
      };
    }, { proteine: 0, carbohidrati: 0, grasimi: 0 });

    const totalMacronutrienti = macronutrienti.proteine + macronutrienti.carbohidrati + macronutrienti.grasimi;

    // Calculăm procentele pentru macronutrienți
    const procenteMacro = {
      proteine: Math.round((macronutrienti.proteine / totalMacronutrienti) * 100) || 0,
      carbohidrati: Math.round((macronutrienti.carbohidrati / totalMacronutrienti) * 100) || 0,
      grasimi: Math.round((macronutrienti.grasimi / totalMacronutrienti) * 100) || 0
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="nutrition" size={24} color="#8caee0" />
          <Text style={styles.sectionTitle}>Statistici Alimentație</Text>
        </View>

        <TouchableOpacity 
          style={[styles.card, styles.graphCard]}
          onPress={() => {
            setGraficSelectat({
              tip: 'line',
              titlu: 'Calorii consumate',
              sufix: ' kcal'
            });
            setDateGrafic({
              labels: date,
              datasets: [{ data: calorii }]
            });
            setModalGraficVizibil(true);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.graphCardTitle}>Calorii consumate</Text>
            <View style={styles.expandIconContainer}>
              <Icon name="expand" size={20} color="#fff" />
            </View>
          </View>
          <LineChart
            data={{
              labels: date,
              datasets: [{
                data: calorii
              }]
            }}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(140, 174, 224, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
                fill: '#fff',
              },
              propsForBackgroundLines: {
                stroke: 'rgba(255, 255, 255, 0.1)',
                strokeWidth: 1,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#8caee0',
              },
              formatYLabel: (value) => `${value}`,
            }}
            bezier
            style={[styles.chart, { marginHorizontal: -10 }]}
            fromZero
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={5}
            yAxisSuffix=""
            yAxisInterval={1}
            renderDotContent={({ x, y, index, data }) => {
              if (!data || !data[index]) return null;
              return (
                <View style={{
                  position: 'absolute',
                  top: y - 20,
                  left: x - 15,
                  backgroundColor: 'rgba(140, 174, 224, 0.9)',
                  padding: 4,
                  borderRadius: 4,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10 }}>
                    {Number(data[index])}
                  </Text>
                </View>
              );
            }}
          />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distribuția Macronutrienților</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={[
                {
                  name: 'Proteine',
                  population: procenteMacro.proteine,
                  color: '#8D33FF',
                  legendFontColor: '#032851',
                  legendFontSize: 14
                },
                {
                  name: 'Carbohidrați',
                  population: procenteMacro.carbohidrati,
                  color: '#3b9e20',
                  legendFontColor: '#032851',
                  legendFontSize: 14
                },
                {
                  name: 'Grăsimi',
                  population: procenteMacro.grasimi,
                  color: '#FFC300',
                  legendFontColor: '#032851',
                  legendFontSize: 14
                }
              ].filter(item => item.population > 0)}
              width={200}
              height={160}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[screenWidth/5, 0]}
              style={styles.pieChart}
              absolute
              hasLegend={false}
            />
            <View style={styles.legendContainer}>
              {[
                { name: 'Proteine', color: '#8D33FF', value: procenteMacro.proteine },
                { name: 'Carbohidrați', color: '#3b9e20', value: procenteMacro.carbohidrati },
                { name: 'Grăsimi', color: '#FFC300', value: procenteMacro.grasimi }
              ].filter(item => item.value > 0).map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}: {item.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(calorii.reduce((a, b) => a + b, 0) / calorii.length)}
            </Text>
            <Text style={styles.statLabel}>Medie calorii/zi</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {ultimele7Zile.filter(zi => 
                zi.mese.reduce((acc, masa) => acc + (masa.calorii || 0), 0) > (zi.obiective?.calorii || 2000)
              ).length}
            </Text>
            <Text style={styles.statLabel}>Zile depășite</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatisticiJurnal = () => {
    const ultimele7Zile = dateJurnal.slice(-7);
    
    if (ultimele7Zile.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="journal" size={24} color="#8caee0" />
            <Text style={styles.sectionTitle}>Statistici Jurnal</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.noDataText}>Nu există date disponibile pentru jurnal</Text>
          </View>
        </View>
      );
    }

    const totalNotite = ultimele7Zile.length;
    const notiteFericite = ultimele7Zile.filter(zi => zi.stare === 'fericit').length;
    const notiteNeutre = ultimele7Zile.filter(zi => zi.stare === 'neutru').length;
    const notiteTriste = ultimele7Zile.filter(zi => zi.stare === 'trist').length;

    const totalStari = notiteFericite + notiteNeutre + notiteTriste;

    if (totalStari === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="journal" size={24} color="#8caee0" />
            <Text style={styles.sectionTitle}>Statistici Jurnal</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.noDataText}>Nu există notițe cu stări înregistrate</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="journal" size={24} color="#8caee0" />
          <Text style={styles.sectionTitle}>Statistici Jurnal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distribuția Stărilor</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={[
                {
                  name: 'Fericit',
                  population: Math.round((notiteFericite / totalStari) * 100) || 0,
                  color: '#FFC300',
                  legendFontColor: '#032851',
                  legendFontSize: 14
                },
                {
                  name: 'Neutru',
                  population: Math.round((notiteNeutre / totalStari) * 100) || 0,
                  color: '#8caee0',
                  legendFontColor: '#032851',
                  legendFontSize: 14
                },
                {
                  name: 'Trist',
                  population: Math.round((notiteTriste / totalStari) * 100) || 0,
                  color: '#FF5733',
                  legendFontColor: '#032851',
                  legendFontSize: 14
                }
              ].filter(item => item.population > 0)}
              width={200}
              height={160}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[screenWidth/5, 0]}
              style={styles.pieChart}
              absolute
              hasLegend={false}
            />
            <View style={styles.legendContainer}>
              {[
                { name: 'Fericit', color: '#FFC300', value: Math.round((notiteFericite / totalStari) * 100) || 0 },
                { name: 'Neutru', color: '#8caee0', value: Math.round((notiteNeutre / totalStari) * 100) || 0 },
                { name: 'Trist', color: '#FF5733', value: Math.round((notiteTriste / totalStari) * 100) || 0 }
              ].filter(item => item.value > 0).map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}: {item.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalNotite}</Text>
            <Text style={styles.statLabel}>Total notițe</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round((notiteFericite / Math.max(1, totalNotite)) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Zile fericite</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatisticiAntrenamente = () => {
    // Luăm ultimele 7 zile și le sortăm cronologic
    const ultimele7Zile = dateAntrenamente
      .filter(antrenament => antrenament && antrenament.data && antrenament.exercitii)
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .slice(-7);

    if (ultimele7Zile.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="fitness" size={24} color="#8caee0" />
            <Text style={styles.sectionTitle}>Statistici Antrenamente</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.noDataText}>Nu există date disponibile pentru antrenamente</Text>
          </View>
        </View>
      );
    }

    // Formatăm datele pentru afișare
    const date = ultimele7Zile.map(antrenament => {
      const data = new Date(antrenament.data);
      return `${data.getDate()}/${data.getMonth() + 1}`;
    });

    // Calculăm durata antrenamentelor pentru fiecare zi
    const durata = ultimele7Zile.map(antrenament => parseInt(antrenament.timp) || 0);

    // Calculăm distribuția tipurilor de antrenamente
    const tipuriAntrenamente = ultimele7Zile.reduce((acc, antrenament) => {
      const tip = antrenament.tip || 'Personalizat';
      acc[tip] = (acc[tip] || 0) + 1;
      return acc;
    }, {});

    const totalAntrenamente = Object.values(tipuriAntrenamente).reduce((a, b) => a + b, 0);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="fitness" size={24} color="#8caee0" />
          <Text style={styles.sectionTitle}>Statistici Antrenamente</Text>
        </View>

        {/* Grafic durata antrenamente */}
        <TouchableOpacity 
          style={[styles.card, styles.graphCard]}
          onPress={() => {
            setGraficSelectat({
              tip: 'line',
              titlu: 'Durata antrenamentelor',
              sufix: ' min'
            });
            setDateGrafic({
              labels: date,
              datasets: [{ data: durata }]
            });
            setModalGraficVizibil(true);
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.graphCardTitle}>Durata antrenamentelor</Text>
            <View style={styles.expandIconContainer}>
              <Icon name="expand" size={20} color="#fff" />
            </View>
          </View>
          <LineChart
            data={{
              labels: date,
              datasets: [{
                data: durata
              }]
            }}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(140, 174, 224, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
                fill: '#fff',
              },
              propsForBackgroundLines: {
                stroke: 'rgba(255, 255, 255, 0.1)',
                strokeWidth: 1,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#8caee0',
              },
              formatYLabel: (value) => `${value}`,
            }}
            bezier
            style={[styles.chart, { marginHorizontal: -10 }]}
            fromZero
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={5}
            yAxisSuffix=""
            yAxisInterval={1}
          />
        </TouchableOpacity>

        {/* Distribuția tipurilor de antrenamente */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distribuția Tipurilor de Antrenamente</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={Object.entries(tipuriAntrenamente).map(([tip, count]) => ({
                name: tip,
                population: Math.round((count / totalAntrenamente) * 100) || 0,
                color: tip === 'Leg Day' ? '#FF6B6B' : 
                       tip === 'Pull Day' ? '#4ECDC4' : 
                       tip === 'Push Day' ? '#45B7D1' : '#032851',
                legendFontColor: '#032851',
                legendFontSize: 14
              })).filter(item => item.population > 0)}
              width={200}
              height={160}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[screenWidth/5, 0]}
              style={styles.pieChart}
              absolute
              hasLegend={false}
            />
            <View style={styles.legendContainer}>
              {Object.entries(tipuriAntrenamente).map(([tip, count]) => {
                const procent = Math.round((count / totalAntrenamente) * 100) || 0;
                if (procent === 0) return null;
                return (
                  <View key={tip} style={styles.legendItem}>
                    <View style={[
                      styles.legendColor, 
                      { backgroundColor: tip === 'Leg Day' ? '#FF6B6B' : 
                                       tip === 'Pull Day' ? '#4ECDC4' : 
                                       tip === 'Push Day' ? '#45B7D1' : '#032851' }
                    ]} />
                    <Text style={styles.legendText}>{tip}: {procent}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Statistici generale */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(durata.reduce((a, b) => a + b, 0) / durata.length)}
            </Text>
            <Text style={styles.statLabel}>Medie durată/zi</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(ultimele7Zile.reduce((acc, ant) => acc + ant.exercitii.length, 0) / ultimele7Zile.length)}
            </Text>
            <Text style={styles.statLabel}>Medie exerciții/zi</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCorelatii = () => {
    console.log('Render corelații - date disponibile:');
    console.log('Date somn:', dateSomn.length);
    console.log('Date alimentație:', dateAlimentatie.length);
    console.log('Date jurnal:', dateJurnal.length);
    console.log('Date antrenamente:', dateAntrenamente.length);

    // Luăm datele din ultimele 7 zile pentru toate categoriile
    const ultimele7Zile = {
      data: Array.from({ length: 7 }, (_, i) => {
        const data = new Date();
        data.setDate(data.getDate() - i);
        return data.toISOString().split('T')[0];
      }).reverse()
    };

    console.log('Ultimele 7 zile:', ultimele7Zile.data);

    // Pregătim datele pentru fiecare zi
    const dateCorelate = ultimele7Zile.data.map(data => {
      // Găsim înregistrările pentru ziua curentă
      const somnZi = dateSomn.find(s => s.data === data);
      const alimentatieZi = dateAlimentatie.find(a => a.data === data);
      const antrenamentZi = dateAntrenamente.find(ant => ant.data === data);
      const jurnalZi = dateJurnal.find(j => j.data === data);

      console.log(`Ziua ${data}:`, {
        somn: !!somnZi,
        alimentatie: !!alimentatieZi,
        antrenament: !!antrenamentZi,
        jurnal: !!jurnalZi
      });

      // Calculăm orele de somn
      let oreSomn = 0;
      if (somnZi && somnZi.oraAdormire && somnZi.oraTrezire) {
        const [oreAdormire, minuteAdormire] = somnZi.oraAdormire.split(':').map(Number);
        const [oreTrezire, minuteTrezire] = somnZi.oraTrezire.split(':').map(Number);
        let ore = oreTrezire - oreAdormire;
        let minute = minuteTrezire - minuteAdormire;
        if (minute < 0) {
          ore -= 1;
          minute += 60;
        }
        if (ore < 0) ore += 24;
        oreSomn = ore + (minute / 60);
      }

      // Calculăm caloriile
      const calorii = alimentatieZi?.mese?.reduce((acc, masa) => acc + (masa.calorii || 0), 0) || 0;

      // Calculăm durata antrenamentului
      const durataAntrenament = antrenamentZi ? parseInt(antrenamentZi.timp) || 0 : 0;

      // Obținem starea din jurnal
      const stare = jurnalZi?.stare || 'neutru';

      return {
        data,
        oreSomn,
        calorii,
        durataAntrenament,
        stare,
        ratingSomn: somnZi?.rating || 0
      };
    });

    console.log('Date corelate:', dateCorelate);

    // Calculăm corelațiile
    const corelatii = [];

    // Corelație între somn și antrenamente
    const zileCuAntrenament = dateCorelate.filter(zi => zi.durataAntrenament > 0);
    console.log('Zile cu antrenament:', zileCuAntrenament.length);
    
    if (zileCuAntrenament.length > 0) {
      const medieOreSomnCuAntrenament = zileCuAntrenament.reduce((acc, zi) => acc + zi.oreSomn, 0) / zileCuAntrenament.length;
      const zileFaraAntrenament = dateCorelate.filter(zi => zi.durataAntrenament === 0);
      const medieOreSomnFaraAntrenament = zileFaraAntrenament.length > 0 
        ? zileFaraAntrenament.reduce((acc, zi) => acc + zi.oreSomn, 0) / zileFaraAntrenament.length 
        : 0;

      console.log('Medie ore somn cu antrenament:', medieOreSomnCuAntrenament);
      console.log('Medie ore somn fără antrenament:', medieOreSomnFaraAntrenament);

      if (medieOreSomnCuAntrenament > medieOreSomnFaraAntrenament && medieOreSomnCuAntrenament > 0) {
        corelatii.push({
          titlu: "Antrenamentul Îmbunătățește Somnul",
          descriere: `Dormi cu ${(medieOreSomnCuAntrenament - medieOreSomnFaraAntrenament).toFixed(1)} ore mai mult în zilele cu antrenament`,
          icon: "moon",
          culoare: "#4ECDC4"
        });
      }
    }

    // Corelație între alimentație și antrenamente (mai permisivă)
    const zileCuAntrenamentIntens = dateCorelate.filter(zi => zi.durataAntrenament > 30);
    console.log('Zile cu antrenament intens:', zileCuAntrenamentIntens.length);
    
    if (zileCuAntrenamentIntens.length > 0) {
      const medieCaloriiCuAntrenament = zileCuAntrenamentIntens.reduce((acc, zi) => acc + zi.calorii, 0) / zileCuAntrenamentIntens.length;
      const zileFaraAntrenamentIntens = dateCorelate.filter(zi => zi.durataAntrenament <= 30);
      const medieCaloriiFaraAntrenament = zileFaraAntrenamentIntens.length > 0
        ? zileFaraAntrenamentIntens.reduce((acc, zi) => acc + zi.calorii, 0) / zileFaraAntrenamentIntens.length
        : 0;

      console.log('Medie calorii cu antrenament intens:', medieCaloriiCuAntrenament);
      console.log('Medie calorii fără antrenament intens:', medieCaloriiFaraAntrenament);

      if (medieCaloriiCuAntrenament > medieCaloriiFaraAntrenament && medieCaloriiCuAntrenament > 0) {
        corelatii.push({
          titlu: "Alimentație Adaptată",
          descriere: `Consumi cu ${Math.round(medieCaloriiCuAntrenament - medieCaloriiFaraAntrenament)} calorii mai mult în zilele cu antrenament intens`,
          icon: "nutrition",
          culoare: "#FF6B6B"
        });
      }
    }

    // Corelație între somn și stare (mai permisivă)
    const zileCuSomnBun = dateCorelate.filter(zi => zi.oreSomn >= 6);
    console.log('Zile cu somn bun:', zileCuSomnBun.length);
    
    if (zileCuSomnBun.length > 0) {
      const zileFericiteCuSomnBun = zileCuSomnBun.filter(zi => zi.stare === 'fericit').length;
      const procentFericireCuSomnBun = (zileFericiteCuSomnBun / zileCuSomnBun.length) * 100;

      console.log('Procent fericire cu somn bun:', procentFericireCuSomnBun);

      if (procentFericireCuSomnBun > 40) {
        corelatii.push({
          titlu: "Somnul Îmbunătățește Starea",
          descriere: `${Math.round(procentFericireCuSomnBun)}% din zilele cu somn bun sunt zile fericite`,
          icon: "happy",
          culoare: "#FFC300"
        });
      }
    }

    // Corelație între antrenamente și stare (mai permisivă)
    const zileCuAntrenamentPentruStare = dateCorelate.filter(zi => zi.durataAntrenament > 0);
    console.log('Zile cu antrenament pentru stare:', zileCuAntrenamentPentruStare.length);
    
    if (zileCuAntrenamentPentruStare.length > 0) {
      const zileFericiteCuAntrenament = zileCuAntrenamentPentruStare.filter(zi => zi.stare === 'fericit').length;
      const procentFericireCuAntrenament = (zileFericiteCuAntrenament / zileCuAntrenamentPentruStare.length) * 100;

      console.log('Procent fericire cu antrenament:', procentFericireCuAntrenament);

      if (procentFericireCuAntrenament > 40) {
        corelatii.push({
          titlu: "Antrenamentul Îmbunătățește Starea",
          descriere: `${Math.round(procentFericireCuAntrenament)}% din zilele cu antrenament sunt zile fericite`,
          icon: "fitness",
          culoare: "#45B7D1"
        });
      }
    }

    // Corelații suplimentare pentru cazuri cu puține date
    if (corelatii.length === 0) {
      // Verificăm dacă există cel puțin câteva înregistrări
      const zileCuDate = dateCorelate.filter(zi => zi.oreSomn > 0 || zi.calorii > 0 || zi.durataAntrenament > 0 || zi.stare !== 'neutru');
      
      if (zileCuDate.length >= 3) {
        // Corelație simplă - zilele cu activitate sunt mai fericite
        const zileCuActivitate = zileCuDate.filter(zi => zi.durataAntrenament > 0 || zi.calorii > 1000);
        if (zileCuActivitate.length > 0) {
          const zileFericiteCuActivitate = zileCuActivitate.filter(zi => zi.stare === 'fericit').length;
          const procentFericireCuActivitate = (zileFericiteCuActivitate / zileCuActivitate.length) * 100;
          
          if (procentFericireCuActivitate > 30) {
            corelatii.push({
              titlu: "Activitatea Îmbunătățește Starea",
              descriere: `${Math.round(procentFericireCuActivitate)}% din zilele cu activitate sunt zile fericite`,
              icon: "trending-up",
              culoare: "#8caee0"
            });
          }
        }
      }
    }

    console.log('Corelații găsite:', corelatii.length);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="analytics" size={24} color="#8caee0" />
          <Text style={styles.sectionTitle}>Corelații</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descoperiri</Text>
          <View style={styles.corelatiiContainer}>
            {corelatii.map((corelatie, index) => (
              <View key={index} style={[styles.corelatieCard, { borderColor: corelatie.culoare }]}>
                <View style={[styles.corelatieIconContainer, { backgroundColor: corelatie.culoare }]}>
                  <Icon name={corelatie.icon} size={24} color="#fff" />
                </View>
                <View style={styles.corelatieContent}>
                  <Text style={styles.corelatieTitle}>{corelatie.titlu}</Text>
                  <Text style={styles.corelatieDescription}>{corelatie.descriere}</Text>
                </View>
              </View>
            ))}
            {corelatii.length === 0 && (
              <Text style={styles.noDataText}>
                Nu există suficiente date pentru a identifica corelații semnificative. Adaugă mai multe înregistrări în ultimele 7 zile pentru a vedea corelații.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tendințe Generale</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(dateCorelate.reduce((acc, zi) => acc + zi.oreSomn, 0) / dateCorelate.length)}
              </Text>
              <Text style={styles.statLabel}>Medie ore somn</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(dateCorelate.reduce((acc, zi) => acc + zi.calorii, 0) / dateCorelate.length)}
              </Text>
              <Text style={styles.statLabel}>Medie calorii/zi</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(dateCorelate.reduce((acc, zi) => acc + zi.durataAntrenament, 0) / dateCorelate.length)}
              </Text>
              <Text style={styles.statLabel}>Medie min antrenament</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Image source={require('../../assets/fundaluri/Statistici.png')} style={styles.backgroundImage} />
        <View style={styles.overlay}>
          <Text style={styles.loadingText}>Se încarcă statisticile...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Image source={require('../../assets/fundaluri/Statistici.png')} style={styles.backgroundImage} />
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={preiaDate}>
            <Text style={styles.retryButtonText}>Reîncearcă</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/Statistici.png')} style={styles.backgroundImage} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigare.navigate('MeniuPrincipal')} style={styles.butonInapoi}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            {activeFilters.somn && renderStatisticiSomn()}
            {activeFilters.alimentatie && renderStatisticiAlimentatie()}
            {activeFilters.jurnal && renderStatisticiJurnal()}
            {activeFilters.antrenamente && renderStatisticiAntrenamente()}
            {activeFilters.corelatii && renderCorelatii()}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.filterButton}>
        <Icon name="options" size={24} color="#fff" />
      </TouchableOpacity>
      {renderFilterModal()}
      {renderGraficModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: 50,
  },
  content: {
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8caee0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 170,
    zIndex: 10
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
  filterButton: {
    position: 'absolute',
    top: 160,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 3,
    borderColor: '#8caee0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#8caee0',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#032851',
    marginLeft: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#8caee0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 10,
    paddingLeft: 10,
    overflow: 'visible',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#8caee0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#032851',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#8caee0',
    textAlign: 'center',
  },
  noDataText: {
    color: '#032851',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#032851',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    borderWidth: 2,
    borderColor: '#8caee0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8caee0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  modalFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(140, 174, 224, 0.1)',
    borderWidth: 1,
    borderColor: '#8caee0',
  },
  modalFilterButtonActive: {
    backgroundColor: '#8caee0',
  },
  modalFilterButtonText: {
    color: '#8caee0',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  modalFilterButtonTextActive: {
    color: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '100%',
  },
  expandIconContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    padding: 5,
  },
  modalGraficOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGraficContent: {
    backgroundColor: '#032851',
    borderRadius: 20,
    width: '95%',
    maxHeight: '70%',
    padding: 15,
    marginBottom: 20,
  },
  modalGraficHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalGraficTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalGraficScroll: {
    maxHeight: '90%',
  },
  modalGraficScrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  modalGraficContainer: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 0,
    margin: -10,
    minWidth: screenWidth - 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 0,
    paddingRight: 20,
  },
  modalGrafic: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 20,
    paddingLeft: 0,
    width: '100%',
    alignItems: 'center',
  },
  graphCard: {
    backgroundColor: '#000',
    borderColor: '#8caee0',
  },
  graphCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalGraficContentDark: {
    backgroundColor: '#000',
    borderColor: '#8caee0',
  },
  modalGraficContainerDark: {
    backgroundColor: '#000',
    borderColor: '#8caee0',
  },
  pieChartContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginLeft: -110,
  },
  pieChart: {
    marginVertical: 8,
    borderRadius: 16,
    marginRight: 60,
    width: Math.min(screenWidth * 0.4, 160),
    height: Math.min(screenWidth * 0.4, 160),
    alignSelf: 'center',
  },
  legendContainer: {
    flex: 1,
    paddingLeft: -10,
    justifyContent: 'center',
    maxWidth: '95%',
    minWidth: 150,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#032851',
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  corelatiiContainer: {
    width: '100%',
  },
  corelatieCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  corelatieIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  corelatieContent: {
    flex: 1,
  },
  corelatieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#032851',
    marginBottom: 4,
  },
  corelatieDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default Statistici;