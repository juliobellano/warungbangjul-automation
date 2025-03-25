import axios from 'axios';

// In production, this will use the environment variable
// In development, it will fall back to a relative path
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', error);
    }
    
    if (error.response) {
      // The request was made and the server responded with an error status
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ detail: 'No response from server. Please try again later.' });
    } else {
      // Something happened in setting up the request
      return Promise.reject({ detail: error.message });
    }
  }
);

export const submitOrder = async (orderText) => {
  const response = await api.post('/orders', { order_text: orderText });
  return response.data;
};

export const getOrders = async (startDate = null, endDate = null, status = null) => {
  let url = '/orders?';
  if (startDate) url += `start_date=${startDate.toISOString()}&`;
  if (endDate) url += `end_date=${endDate.toISOString()}&`;
  if (status) url += `status=${status}`;
  
  const response = await api.get(url);
  return response.data.orders;
};

export const getMenu = async () => {
  const response = await api.get('/menu');
  return response.data.menu;
};

export const getInventoryNeeds = async (days = 7) => {
  const response = await api.get(`/inventory/calculate?days=${days}`);
  return response.data;
};

export const getSalesAnalytics = async (startDate = null, endDate = null) => {
  const payload = {};
  if (startDate) payload.start_date = startDate.toISOString();
  if (endDate) payload.end_date = endDate.toISOString();
  
  const response = await api.post('/analytics/sales', payload);
  return response.data.analytics;
};

export const getTodayInventoryNeeds = async () => {
  const response = await api.get('/inventory/today');
  return response.data;
};

export const getProfitabilityMetrics = async (startDate = null, endDate = null) => {
  const payload = {};
  if (startDate) payload.start_date = startDate.toISOString();
  if (endDate) payload.end_date = endDate.toISOString();
  
  const response = await api.post('/analytics/profitability', payload);
  return response.data.profitability;
};