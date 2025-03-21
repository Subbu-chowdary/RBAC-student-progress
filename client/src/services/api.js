// college-portal/client/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // Adjust to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
