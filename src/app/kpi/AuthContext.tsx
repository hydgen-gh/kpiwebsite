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

  // Set up auth listener on mount - handles both initial session check and state changes
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let subscription: any = null;

    const checkInitialSession = async () => {
      try {
        console.log('🔍 Checking initial session');
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          console.log('✅ Initial session check complete:', currentUser?.email || 'No user', '| Role:', currentUser?.role);
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Initial session check error:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      try {
        console.log('🎧 Setting up auth listener in context');
        subscription = authService.onAuthStateChange((updatedUser) => {
          if (isMounted) {
            console.log('📢 Auth context callback fired:', updatedUser?.email, '| Role:', updatedUser?.role, '| Is Admin?', updatedUser?.role === 'admin');
            setUser(updatedUser);
          }
        });
      } catch (error) {
        console.error('❌ Auth listener setup error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set a timeout to ensure loading state is cleared after 3 seconds max
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth check timeout, clearing loading state');
        setLoading(false);
      }
    }, 3000);

    // Check initial session and set up listener
    checkInitialSession();
    setupAuthListener();

    return () => {
      console.log('Cleaning up auth context');
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signIn for:', email);
      const response = await authService.signIn(email, password);
      
      const { error, data } = response;
      if (error) {
        console.error('SignIn error:', error);
        throw new Error(error.message || 'Login failed');
      }
      if (!data.session) {
        console.error('No session in response:', data);
        throw new Error('No session created after login');
      }
      
      console.log('SignIn successful, session created for:', data.session.user.email);
      // Auth state listener will handle setting the user and clearing loading state
    } catch (err: any) {
      console.error('SignIn exception:', err);
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
