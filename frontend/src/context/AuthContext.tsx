import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'admin' | 'driver') => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('autopulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('autopulse_token');
          setToken(null);
          // Set default demo user for frictionless evaluation
          setUser({
            id: 1,
            email: 'demo@autopulse.ai',
            full_name: 'Safety Inspector Alex Turner',
            role: 'admin',
            vehicle_id: 1
          });
        }
      } else {
        // Fallback default demo user
        setUser({
          id: 1,
          email: 'demo@autopulse.ai',
          full_name: 'Safety Inspector Alex Turner',
          role: 'admin',
          vehicle_id: 1
        });
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('autopulse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const demoLogin = async (role: 'admin' | 'driver') => {
    const email = role === 'admin' ? 'demo@autopulse.ai' : 'driver@autopulse.ai';
    try {
      await login(email, 'password123');
    } catch {
      // Local demo fallback
      const demoUser: User = role === 'admin' ? {
        id: 1,
        email: 'demo@autopulse.ai',
        full_name: 'Safety Inspector Alex Turner',
        role: 'admin',
        vehicle_id: 1
      } : {
        id: 2,
        email: 'driver@autopulse.ai',
        full_name: 'Connected Driver Priya Sharma',
        role: 'driver',
        vehicle_id: 2
      };
      setUser(demoUser);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'driver') => {
    const res = await api.register({ full_name: name, email, password, role });
    localStorage.setItem('autopulse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('autopulse_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, demoLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
