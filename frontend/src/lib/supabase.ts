// ============================================
// DoneFast - Supabase Client Configuration
// ============================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Prevent initializing with placeholder keys that cause "Invalid Compact JWS" errors
const isPlaceholder = supabaseAnonKey === 'your-anon-key' || supabaseAnonKey.startsWith('[') || supabaseAnonKey.length < 20;

if (isPlaceholder && typeof window !== 'undefined') {
    console.warn('⚠️ Supabase Anon Key belum diatur dengan benar di .env.local. Fitur storage tidak akan berfungsi.');
}

export const supabase = createClient(
    supabaseUrl,
    isPlaceholder ? 'invalid-key-placeholder-to-prevent-jws-error' : supabaseAnonKey
);

export default supabase;
