import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const user = await AuthService.login(username, password);
      if (user) {
        setUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};