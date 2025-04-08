import { useState, useCallback } from 'react';

// Generic API hook for handling loading states and errors
export function useApiCall<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    data,
    isLoading,
    error,
    execute,
    reset: () => {
      setData(null);
      setError(null);
      setIsLoading(false);
    }
  };
}

// Export a single function as the default
export default useApiCall; 