import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  login: (phone: string) => void;
  logout: () => void;
  showSplash: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedAuth = localStorage.getItem('carServiceAuth');
    if (storedAuth) {
      const { phone } = JSON.parse(storedAuth);
      setPhoneNumber(phone);
      setIsAuthenticated(true);
    }

    // Hide splash after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const login = (phone: string) => {
    setPhoneNumber(phone);
    setIsAuthenticated(true);
    localStorage.setItem('carServiceAuth', JSON.stringify({ phone }));
  };

  const logout = () => {
    setPhoneNumber(null);
    setIsAuthenticated(false);
    localStorage.removeItem('carServiceAuth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, phoneNumber, login, logout, showSplash }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
