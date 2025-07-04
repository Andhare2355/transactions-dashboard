import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.params || config.data || '');
  return config;
});
API.interceptors.response.use((response) => {
  console.log('API Response:', response.config.url, response.data);
  return response;
});

export const fetchTransactions = (month, search, page) =>
  API.get(`/transactions?month=${month}&search=${search}&page=${page}`);

export const fetchStats = (month) => API.get(`/statistics?month=${month}`);
export const fetchBar = (month) => API.get(`/barchart?month=${month}`);
export const fetchPie = (month) => API.get(`/piechart?month=${month}`);
export const fetchCombined = (month) => API.get(`/combined?month=${month}`);
export const seedData = () => API.get(`/init`);
