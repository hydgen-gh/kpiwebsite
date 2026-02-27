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
    let loadingTimeout: NodeJS.Timeout;

    const initAuth = async () => {
      // Set a timeout for loading state (max 3 seconds)
      loadingTimeout = setTimeout(() => {
        setLoading(false);
      }, 3000);

      try {
        // Get the current session from cache first (fast)
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        clearTimeout(loadingTimeout);
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        clearTimeout(loadingTimeout);
        setLoading(false);
      }

      // Setup listener for future auth changes
      try {
        subscription = await authService.onAuthStateChange((updatedUser) => {
          setUser(updatedUser);
        });
      } catch (error) {
        console.error('Auth listener setup error:', error);
      }
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      clearTimeout(loadingTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password);
    if (error) throw error;
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await authService.signUp(email, password);
    if (error) throw error;
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
