import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Create a single Supabase client instance - ensure it's only created once
let supabaseInstance: any = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    console.log('Creating Supabase client instance');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export const authService = {
  async signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return null;

      // Try to get user role from database with a 2 second timeout
      let role = 'user';
      try {
        const rolePromise = supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DB timeout')), 2000)
        );

        const result = await Promise.race([rolePromise, timeoutPromise]) as any;
        if (result.data?.role) {
          role = result.data.role;
        }
      } catch (dbError) {
        // If database query fails or times out, default to 'user' role
        console.warn('Could not fetch user role from database, defaulting to user role', dbError);
      }

      return {
        id: data.session.user.id,
        email: data.session.user.email || '',
        role: role as 'admin' | 'user',
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async onAuthStateChange(callback: (user: AuthUser | null) => void) {
    console.log('Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('Auth state change event:', event, 'Session:', session?.user?.email);
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('Error getting user in listener:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
    return subscription;
  },
};
