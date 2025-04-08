// Order-related types
export interface Order {
  id: string;
  customer_name: string;
  items: OrderItem[];
  total_price: number;
  order_date: string;
  status: string;
  total_amount?: number;
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

// CV interface
export interface DetectedIngredient {
  ingredient_name: string;
  confidence: number;
  suggested_quantity: number;
  unit: string;
  count?: number;
  isAdjusted?: boolean; // UI state flag
}

export interface DetectionResult {
  detection_id: string;
  ingredients: DetectedIngredient[];
  image_url: string;
  timestamp: string;
}

export interface DetectionUploadResponse {
  detection_id: string;
  message: string;
}

export interface DetectionUpdateResponse {
  success: boolean;
  message: string;
  update_result: {
    success: boolean;
    updated_count: number;
    results: Record<string, {
      success: boolean;
      message: string;
      new_quantity: number;
      unit: string;
    }>
  }
}