// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Restore token from storage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('engmart_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('engmart_token');
      localStorage.removeItem('engmart_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
