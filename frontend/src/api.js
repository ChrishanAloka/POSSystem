import axios from 'axios';

const api = axios.create({
  baseURL: 'https://possystem-eo7h.onrender.com/api'
});

export default api;