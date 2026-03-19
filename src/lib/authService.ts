import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Admin email list
const ADMIN_EMAILS = ['admin@hydgen.com'];

// Create a single Supabase client instance - ensure it's only created once
let supabaseInstance: any = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase credentials! Check .env file');
    }
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
    const response = await supabase.auth.signInWithPassword({ email, password });
    
    // If sign-in successful, ensure role metadata is set correctly
    if (response.data?.session?.user) {
      // Determine role based on admin email list
      const shouldBeAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      const roleToSet = shouldBeAdmin ? 'admin' : 'user';
      
      // Update metadata to ensure correct role is set
      const { error } = await supabase.auth.updateUser({
        data: { role: roleToSet }
      }).catch((err: any) => {
        console.warn('Could not update metadata:', err);
        return { error: err };
      });
      
      if (!error) {
        // Refresh session to get updated metadata
        const { data: refreshed } = await supabase.auth.getSession();
        if (refreshed.session?.user) {
          response.data.session.user.user_metadata = refreshed.session.user.user_metadata;
        }
      }
    }
    
    return response;
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, newRole: 'admin' | 'user') {
    try {
      const { error } = await supabase.auth.admin
        .updateUserById(userId, {
          user_metadata: { role: newRole }
        });
      
      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('❌ Exception updating user role:', err);
      return false;
    }
  },

  async signOut() {
    try {
      const result = await supabase.auth.signOut();
      // Also clear any localStorage keys that Supabase might have created
      // This ensures a complete sign-out
      const keysToDelete = Object.keys(localStorage).filter(key => 
        key.includes('sb-') || key.includes('supabase') || key.includes('auth')
      );
      keysToDelete.forEach(key => localStorage.removeItem(key));
      return result;
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force clear localStorage even if Supabase signOut fails
      const keysToDelete = Object.keys(localStorage).filter(key => 
        key.includes('sb-') || key.includes('supabase') || key.includes('auth')
      );
      keysToDelete.forEach(key => localStorage.removeItem(key));
      throw error;
    }
  },

  // Get user role from metadata (no database query needed)
  async fetchUserRole(userId: string): Promise<'admin' | 'user'> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        // Get role from user metadata
        const role = data.session.user.user_metadata?.role || 'user';
        return role as 'admin' | 'user';
      }
      return 'user';
    } catch (err: any) {
      console.error('❌ Exception fetching user role:', err.message || err);
      return 'user';
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return null;

      // Return user with cached/default role - don't block on DB query
      const role = await this.fetchUserRole(data.session.user.id);
      
      return {
        id: data.session.user.id,
        email: data.session.user.email || '',
        role,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      // Only handle actual auth changes (login/logout/update)
      // Skip INITIAL_SESSION as it's handled by checkInitialSession()
      if (event === 'INITIAL_SESSION') {
        return;
      }
      
      if (session?.user) {
        try {
          // For login events, get role from metadata immediately
          if (event === 'SIGNED_IN') {
            console.log('👤 User signed in:', session.user.email, '| ID:', session.user.id);
            
            // Get role from metadata (instant, no database query)
            const role = (session.user.user_metadata?.role || 'user') as 'admin' | 'user';
            console.log('👑 Role from metadata:', role, '| Is Admin?', role === 'admin');
            
            const user: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              role,
            };
            
            console.log('✅ Calling callback with user:', JSON.stringify(user));
            callback(user);
          } else if (event === 'USER_UPDATED') {
            console.log('🔄 User updated');
            // For user updates, get user with role from metadata
            const role = (session.user.user_metadata?.role || 'user') as 'admin' | 'user';
            const user: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              role,
            };
            callback(user);
          }
        } catch (error) {
          console.error('❌ Error in auth listener:', error);
          callback(null);
        }
      } else {
        // User logged out or session cleared
        console.log('🚪 User signed out');
        callback(null);
      }
    });
    return subscription;
  },
};
