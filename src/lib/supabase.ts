// Re-export the singleton Supabase client from authService to prevent duplicate instances
import { supabase } from './authService';
export { supabase };
