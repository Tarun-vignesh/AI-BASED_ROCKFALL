import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '@/lib/api';

const DEMO_MODE_KEY = 'mining_demo_mode';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  role?: string;
  mine_site_id?: string;
}

export const DEMO_USER: User = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'demo@mining-safety.app',
  full_name: 'Demo Operator',
  role: 'operator',
  mine_site_id: 'ms-001-demo-mine',
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const enterDemoMode = () => {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    setIsDemoMode(true);
    setUser(DEMO_USER);
    setLoading(false);
  };

  const fetchCurrentUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await api.get<User>('/api/auth/me');
      setUser(userData);
      setIsDemoMode(false);
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch current user:', err);
      removeStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const restoreDemoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';
    if (restoreDemoMode) {
      setIsDemoMode(true);
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    localStorage.removeItem(DEMO_MODE_KEY);
    setIsDemoMode(false);
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      setStoredToken(res.access_token);
      setUser(res.user);
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    localStorage.removeItem(DEMO_MODE_KEY);
    setIsDemoMode(false);
    setLoading(true);

    try {
      await api.post('/api/auth/register', {
        email,
        password,
        full_name: fullName || email.split('@')[0],
      });
      // Auto login after registration
      await login(email, password);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    if (isDemoMode || localStorage.getItem(DEMO_MODE_KEY) === 'true') {
      localStorage.removeItem(DEMO_MODE_KEY);
      setIsDemoMode(false);
      setUser(null);
      return;
    }

    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      removeStoredToken();
      setUser(null);
      setIsDemoMode(false);
    }
  };

  const value = {
    user,
    loading,
    isDemoMode,
    enterDemoMode,
    signOut,
    login,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};