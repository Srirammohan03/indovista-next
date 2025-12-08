
"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children?: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Check local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('indovista_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (id: string, pass: string) => {
    // Simple auth for demo
    if (id === 'Admin' && pass === 'P@55w0rd') {
      const u = { id: 'admin', name: 'Admin User', role: 'Administrator' };
      setUser(u);
      localStorage.setItem('indovista_user', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('indovista_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
