import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitOrder = async (orderText) => {
  try {
    const response = await api.post('/orders', { order_text: orderText });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getOrders = async (startDate = null, endDate = null, status = null) => {
  try {
    let url = '/orders?';
    if (startDate) url += `start_date=${startDate.toISOString()}&`;
    if (endDate) url += `end_date=${endDate.toISOString()}&`;
    if (status) url += `status=${status}`;
    
    const response = await api.get(url);
    return response.data.orders;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getMenu = async () => {
  try {
    const response = await api.get('/menu');
    return response.data.menu;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getInventoryNeeds = async (days = 7) => {
  try {
    const response = await api.get(`/inventory/calculate?days=${days}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getSalesAnalytics = async (startDate = null, endDate = null) => {
  try {
    const payload = {};
    if (startDate) payload.start_date = startDate.toISOString();
    if (endDate) payload.end_date = endDate.toISOString();
    
    const response = await api.post('/analytics/sales', payload);
    return response.data.analytics;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getTodayInventoryNeeds = async () => {
  try {
    const response = await api.get('/inventory/today');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getProfitabilityMetrics = async (startDate = null, endDate = null) => {
  try {
    const payload = {};
    if (startDate) payload.start_date = startDate.toISOString();
    if (endDate) payload.end_date = endDate.toISOString();
    
    const response = await api.post('/analytics/profitability', payload);
    return response.data.profitability;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};