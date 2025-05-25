import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { albumService, getPhotoUrl } from '../services/api';

const Albume = () => {
  const navigation = useNavigation();
  const [albums, setAlbums] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const loadedAlbums = await albumService.getAllAlbums();
      setAlbums(loadedAlbums);
    } catch (error) {
      console.error('Eroare la încărcarea albumelor:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca albumele');
    }
  };

  const createAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert('Eroare', 'Numele albumului nu poate fi gol');
      return;
    }

    try {
      await albumService.createAlbum(newAlbumName.trim());
      setNewAlbumName('');
      setIsCreateModalVisible(false);
      loadAlbums();
    } catch (error) {
      console.error('Eroare la crearea albumului:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea albumul');
    }
  };

  const deleteAlbum = (albumId) => {
    Alert.alert(
      'Ștergere album',
      'Ești sigur că vrei să ștergi acest album?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await albumService.deleteAlbum(albumId);
              loadAlbums();
            } catch (error) {
              console.error('Eroare la ștergerea albumului:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge albumul');
            }
          },
        },
      ]
    );
  };

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => navigation.navigate('AlbumDetalii', { albumId: item._id })}
    >
      <View style={styles.albumCover}>
        {item.coverPhoto ? (
          <Image source={{ uri: getPhotoUrl(item.coverPhoto) }} style={styles.albumImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="images-outline" size={40} color="#fff" />
          </View>
        )}
        <View style={styles.albumInfo}>
          <Text style={styles.albumName}>{item.name}</Text>
          <Text style={styles.photoCount}>{item.photos.length} poze</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteAlbum(item._id)}
      >
        <Icon name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/fundaluri/Albume.png')} style={styles.backgroundImage} />

      <TouchableOpacity onPress={() => navigation.navigate('MeniuPrincipal')} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={albums}
        renderItem={renderAlbumItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Creează album nou</Text>
            <TextInput
              style={styles.input}
              placeholder="Numele albumului"
              placeholderTextColor="#666"
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text style={styles.buttonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={createAlbum}
              >
                <Text style={styles.buttonText}>Creează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 167,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  listContent: {
    padding: 20,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 15,
    padding: 10,
  },
  albumCover: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    marginLeft: 15,
  },
  albumName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  photoCount: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  deleteButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Albume; 