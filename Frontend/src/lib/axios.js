import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true, // Include credentials in requests
  timeout: 30000, // 30 seconds timeout for image uploads
  maxBodyLength: 10 * 1024 * 1024, // 10MB max body length
  maxContentLength: 10 * 1024 * 1024, // 10MB max content length
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timed out');
    } else if (!error.response) {
      console.error('❌ Network error: Server not responding');
    } else {
      console.error(`❌ Server error ${error.response.status}:`, error.response.data);
    }
    return Promise.reject(error);
  }
);