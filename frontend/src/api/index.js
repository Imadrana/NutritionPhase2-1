import axios from "axios";

// Create a reusable axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_AZURE_FUNCTION_URL // <- reads from .env file
});

export default api;
