// Order-related types
export interface Order {
  id: string;
  customer_name: string;
  items: OrderItem[];
  total_price: number;
  created_at: string;
  status: string;
}

export interface OrderItem {
  code: string;
  name: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
}

export interface OrderResponse {
  success: boolean;
  order_id: string;
  order: Order;
}

export interface OrdersResponse {
  orders: Order[];
}

// Menu-related types
export interface MenuItem {
  code: string;
  name: string;
  price: number;
  description?: string;
  ingredients: {
    [key: string]: {
      amount: number;
      unit: string;
    };
  };
}

export interface MenuResponse {
  menu: MenuItem[];
}

// Inventory-related types
export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  unit_cost?: number;
}

export interface InventoryResponse {
  inventory: {
    [key: string]: Ingredient;
  };
}

export interface TodayInventoryResponse {
  ingredients_needed: {
    [key: string]: {
      amount: number;
      unit: string;
    };
  };
  total_orders: number;
}

export interface ProcessTodayOrdersResponse {
  status: string;
  message: string;
  updated_ingredients: {
    [key: string]: {
      previous: {
        amount: number;
        unit: string;
      };
      current: {
        amount: number;
        unit: string;
      };
      difference: {
        amount: number;
        unit: string;
      };
    };
  };
} 