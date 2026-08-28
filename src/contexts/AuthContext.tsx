import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const DEMO_MODE_KEY = 'mining_demo_mode';

export const DEMO_USER: User = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'demo@mining-safety.app',
  app_metadata: { provider: 'demo' },
  user_metadata: { name: 'Demo User' },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
} as User;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  signOut: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const enterDemoMode = () => {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    setIsDemoMode(true);
    setSession(null);
    setUser(DEMO_USER);
    setLoading(false);
  };

  useEffect(() => {
    const restoreDemoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';
    if (restoreDemoMode) {
      setIsDemoMode(true);
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isDemoMode || localStorage.getItem(DEMO_MODE_KEY) === 'true') {
      localStorage.removeItem(DEMO_MODE_KEY);
      setIsDemoMode(false);
      setUser(null);
      setSession(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    isDemoMode,
    enterDemoMode,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};