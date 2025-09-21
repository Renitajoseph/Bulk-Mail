'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STATUS_KEY = 'bulkmail_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem(AUTH_STATUS_KEY);
    if (authStatus) {
      setIsAuthenticated(JSON.parse(authStatus));
    }
    setIsLoaded(true);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STATUS_KEY, JSON.stringify(true));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STATUS_KEY);
  };

  const value = { isAuthenticated, login, logout };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
