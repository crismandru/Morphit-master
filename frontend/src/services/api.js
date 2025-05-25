import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPhotoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const pozaService = {
  getAllPhotos: async () => {
    const response = await api.get('/poze');
    return response.data;
  },

  uploadPhoto: async (poza, latime, inaltime) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: poza.uri,
      type: 'image/jpeg',
      name: 'poza.jpg',
    });
    formData.append('width', latime);
    formData.append('height', inaltime);

    const response = await api.post('/poze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePhoto: async (pozaId) => {
    const response = await api.delete(`/poze/${pozaId}`);
    return response.data;
  },
};

export const albumService = {
  getAllAlbums: async () => {
    const response = await api.get('/albume');
    return response.data;
  },

  createAlbum: async (name) => {
    const response = await api.post('/albume', { name });
    return response.data;
  },

  getAlbum: async (albumId) => {
    const response = await api.get(`/albume/${albumId}`);
    return response.data;
  },

  addPhotosToAlbum: async (albumId, pozaIds) => {
    const response = await api.post(`/albume/${albumId}/photos`, { photoIds: pozaIds });
    return response.data;
  },

  removePhotoFromAlbum: async (albumId, pozaId) => {
    const response = await api.delete(`/albume/${albumId}/photos/${pozaId}`);
    return response.data;
  },

  setCoverPhoto: async (albumId, pozaId) => {
    const response = await api.put(`/albume/${albumId}/cover`, { photoId: pozaId });
    return response.data;
  },

  deleteAlbum: async (albumId) => {
    const response = await api.delete(`/albume/${albumId}`);
    return response.data;
  },
};

export default api; 