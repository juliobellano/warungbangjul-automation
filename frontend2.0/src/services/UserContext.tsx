'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  userName: '',
  setUserName: () => {},
});

// Hook to use the context
export const useUser = () => useContext(UserContext);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string>('');

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext; 