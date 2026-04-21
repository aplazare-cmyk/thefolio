// frontend/src/api/axios.js
import axios from 'axios';

// Use REACT_APP_API_URL in production (set in Vercel env vars)
// Falls back to localhost for local development
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default API;