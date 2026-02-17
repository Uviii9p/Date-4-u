import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // This works for local dev via next.config.mjs proxy OR Vercel
    timeout: 10000,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
