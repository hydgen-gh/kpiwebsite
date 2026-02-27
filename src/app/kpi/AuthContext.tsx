import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthUser } from '../../lib/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    let subscription: any;

    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const setupAuthListener = async () => {
      try {
        subscription = await authService.onAuthStateChange((updatedUser) => {
          setUser(updatedUser);
        });
      } catch (error) {
        console.error('Auth listener setup error:', error);
      }
    };

    // Run both in parallel
    Promise.all([checkAuth(), setupAuthListener()]).catch(console.error);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await authService.signIn(email, password);
    if (error) {
      throw new Error(error.message || 'Login failed');
    }
    if (!data.session) {
      throw new Error('No session created after login');
    }
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const signUp = async (email: string, password: string) => {
    const { error, data } = await authService.signUp(email, password);
    if (error) {
      throw new Error(error.message || 'Sign up failed');
    }
    if (!data.user) {
      throw new Error('No user created after sign up');
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
