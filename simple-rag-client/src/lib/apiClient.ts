import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving secure cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// We can add response interceptors to handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Handle global logout redirect if token expires
      // window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
