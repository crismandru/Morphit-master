import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { albumService, pozaService, getPhotoUrl } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const screenWidth = Dimensions.get('window').width;
const numColumns = 3;
const tileSize = screenWidth / numColumns;

const AlbumDetalii = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { albumId } = route.params;

  const [album, setAlbum] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlbum();
  }, [albumId]);

  const loadAlbum = async () => {
    try {
      setIsLoading(true);
      const albumData = await albumService.getAlbum(albumId);
      setAlbum(albumData);
    } catch (error) {
      console.error('Eroare la încărcarea albumului:', error);
      Alert.alert('Eroare', 'Nu s-a putut încărca albumul');
    } finally {
      setIsLoading(false);
    }
  };

  const pickPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const photoIds = [];
        for (const asset of result.assets) {
          const photo = await pozaService.uploadPhoto(asset, asset.width, asset.height);
          photoIds.push(photo._id);
        }
        await albumService.addPhotosToAlbum(albumId, photoIds);
        loadAlbum();
      }
    } catch (error) {
      console.error('Eroare la adăugarea pozelor:', error);
      Alert.alert('Eroare', 'Nu s-au putut adăuga pozele');
    }
  };

  const deletePhoto = (photoId) => {
    Alert.alert(
      'Ștergere poză',
      'Ești sigur că vrei să ștergi această poză din album?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await albumService.removePhotoFromAlbum(albumId, photoId);
              loadAlbum();
              setIsViewMode(false);
            } catch (error) {
              console.error('Eroare la ștergerea pozei:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge poza');
            }
          },
        },
      ]
    );
  };

  const setCoverPhoto = async (photoId) => {
    try {
      await albumService.setCoverPhoto(albumId, photoId);
      Alert.alert('Succes', 'Poza de copertă a fost setată');
      loadAlbum();
    } catch (error) {
      console.error('Eroare la setarea pozei de copertă:', error);
      Alert.alert('Eroare', 'Nu s-a putut seta poza de copertă');
    }
  };

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.photoTile}
      onPress={() => {
        setSelectedPhoto(item);
        setIsViewMode(true);
      }}
    >
      <Image source={{ uri: getPhotoUrl(item.url) }} style={styles.photo} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Se încarcă...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{album?.name}</Text>
        <TouchableOpacity onPress={pickPhotos} style={styles.addButton}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={album?.photos || []}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={isViewMode}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsViewMode(false)}
      >
        <View style={styles.modalContainer}>
          {selectedPhoto && (
            <>
              <Image source={{ uri: getPhotoUrl(selectedPhoto.url) }} style={styles.modalImage} />
              <View style={styles.modalControls}>
                <TouchableOpacity
                  onPress={() => {
                    setCoverPhoto(selectedPhoto._id);
                    setIsViewMode(false);
                  }}
                  style={styles.modalButton}
                >
                  <Icon name="star" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deletePhoto(selectedPhoto._id)}
                  style={styles.modalButton}
                >
                  <Icon name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsViewMode(false)}
                  style={styles.modalButton}
                >
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#032851',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  listContent: {
    padding: 1,
  },
  photoTile: {
    width: tileSize - 2,
    height: tileSize - 2,
    margin: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  modalControls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  modalButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 10,
  },
});

export default AlbumDetalii; 