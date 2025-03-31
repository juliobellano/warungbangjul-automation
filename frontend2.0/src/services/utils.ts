import { Ingredient, Order } from './types';

/**
 * Format a date to a readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

/**
 * Format ingredient amount with unit
 */
export const formatIngredientAmount = (
  amount: number,
  unit: string
): string => {
  return `${amount} ${unit}`;
};


/**
 * Calculate total for orders in a period
 */
export const calculateTotalSales = (orders: Order[]): number => {
  return orders.reduce((total, order) => total + order.total_price, 0);
};

/**
 * Format inventory data for display
 */
export const formatInventoryForDisplay = (
  inventory: { [key: string]: Ingredient }
): { name: string; amount: string; unitCost: string }[] => {
  return Object.entries(inventory).map(([key, ingredient]) => {
    return {
      name: ingredient.name || key,
      amount: formatIngredientAmount(ingredient.amount, ingredient.unit),
      unitCost: ingredient.unit_cost ? formatCurrency(ingredient.unit_cost) : 'N/A'
    };
  });
};

/**
 * Helper to create a date range for filtering
 */
export const createDateRange = (
  daysBack: number
): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  return { startDate, endDate };
}; 