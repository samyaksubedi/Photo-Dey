import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  apiRequest,
  refreshAccessToken,
  setAccessToken,
  setAuthenticationLostHandler,
} from '../lib/api';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signOutEverywhere: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setAuthenticationLostHandler(() => {
      if (active) setUser(null);
    });
    const restoreSession = async () => {
      const token = await refreshAccessToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const response = await apiRequest<User>('/auth/me', { authenticated: true });
        if (active) setUser(response.data);
      } catch {
        setAccessToken(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void restoreSession();
    return () => {
      active = false;
      setAuthenticationLostHandler(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        const response = await apiRequest<{ accessToken: string; user: User }>(
          '/auth/signIn',
          {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          },
        );
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
      },
      signUp: async (name, email, password) => {
        await apiRequest<User>('/auth/signUp', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
      },
      signOut: async () => {
        try {
          await apiRequest('/auth/logout', {
            method: 'POST',
            authenticated: true,
          });
        } finally {
          setAccessToken(null);
          setUser(null);
        }
      },
      signOutEverywhere: async () => {
        try {
          await apiRequest('/auth/logout-all', {
            method: 'POST',
            authenticated: true,
          });
        } finally {
          setAccessToken(null);
          setUser(null);
        }
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
