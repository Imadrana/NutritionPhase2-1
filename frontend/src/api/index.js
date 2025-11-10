import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_AZURE_FUNCTION_URL,
});

export default api;
