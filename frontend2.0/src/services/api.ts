import axios, { AxiosError } from 'axios';

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface OrderText {
  order_text: string;
}

export interface IngredientUpdate {
  amount: number;
  unit: string;
}

export interface IngredientUpdates {
  ingredients: {
    [key: string]: IngredientUpdate;
  };
}

// API functions for orders
export const submitOrder = async (orderText: string) => {
  try {
    const response = await api.post('/orders', { order_text: orderText });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

export const getOrders = async (
  startDate: Date | null = null,
  endDate: Date | null = null,
  status: string | null = null
) => {
  try {
    let url = '/orders?';
    
    if (startDate) url += `start_date=${startDate.toISOString()}&`;
    if (endDate) url += `end_date=${endDate.toISOString()}&`;
    if (status) url += `status=${status}`;
    
    const response = await api.get(url);
    return response.data.orders;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

// API functions for menu
export const getMenu = async () => {
  try {
    const response = await api.get('/menu');
    return response.data.menu;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

// API functions for inventory
export const getTodayInventoryNeeds = async () => {
  try {
    const response = await api.get('/inventory/today');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

export const getInventory = async () => {
  try {
    const response = await api.get('/inventory');
    return response.data.inventory;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

export const updateInventory = async (updates: IngredientUpdates) => {
  try {
    const response = await api.post('/inventory', updates);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

export const processTodayOrders = async () => {
  try {
    const response = await api.post('/inventory/process-today');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

// API to upload ingredients image for detection
export const uploadImageForDetection = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/inventory/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};


// Get detection results by detection ID
export const getDetectionResults = async (detectionId: string) => {
  try {
    const response = await api.get(`/inventory/detected/${detectionId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

// Get image URL (helper function)
export const getAnnotatedImageUrl = (imageId: string): string => {
  return `${API_BASE_URL}/inventory/image/${imageId}`;
};

// Confirm detected ingredients and update inventory
export const confirmDetectionUpdate = async (detectionId: string, ingredients: any[]) => {
  try {
    const response = await api.post(`/inventory/update/${detectionId}`, {
      ingredients
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.response?.data || error;
  }
};

export default api; 