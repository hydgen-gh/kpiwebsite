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
    let isMounted = true;

    const checkAuthWithTimeout = async () => {
      // Maximum 5 seconds for auth check
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 5000)
      );

      try {
        const currentUser = await Promise.race([
          authService.getCurrentUser(),
          timeoutPromise,
        ]);
        if (isMounted) {
          setUser(currentUser as AuthUser | null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const setupAuthListener = async () => {
      try {
        subscription = await authService.onAuthStateChange((updatedUser) => {
          if (isMounted) {
            setUser(updatedUser);
          }
        });
      } catch (error) {
        console.error('Auth listener setup error:', error);
      }
    };

    // Start both operations
    checkAuthWithTimeout();
    setupAuthListener();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Set a timeout for the entire signIn operation
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Login timeout - please try again')), 10000)
    );

    try {
      const signInPromise = authService.signIn(email, password);
      const { error, data } = await Promise.race([
        signInPromise,
        timeoutPromise,
      ]) as any;

      if (error) {
        throw new Error(error.message || 'Login failed');
      }
      if (!data.session) {
        throw new Error('No session created after login');
      }
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    }
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
