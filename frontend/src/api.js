import axios from 'axios';

const api = axios.create({
  baseURL: 'https://possystem-mjwb.onrender.com/api'
});

export default api;