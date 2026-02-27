import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single Supabase client with optimized settings
// Setting db.timeout to 5 seconds and using persistent sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

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

      // Try to get user role from database, with a 3 second timeout
      let role = 'user';
      try {
        const dbQueryPromise = supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DB timeout')), 3000)
        );

        const { data: userData } = await Promise.race([
          dbQueryPromise,
          timeoutPromise,
        ]) as any;

        if (userData?.role) {
          role = userData.role;
        }
      } catch (dbError) {
        // If database query fails or times out, default to 'user' role
        console.warn('Could not fetch user role from database, defaulting to user role');
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
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
    return data.subscription;
  },
};
