import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for connection status
console.log('🔌 Supabase Connection Check:');
console.log('  - URL configured:', !!supabaseUrl);
console.log('  - Anon Key configured:', !!supabaseAnonKey);
if (supabaseUrl) {
  console.log('  - Supabase URL:', supabaseUrl);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Database features will be unavailable.');
  console.warn('  Please check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Test the connection
async function testConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Skipping connection test - credentials not configured');
    return;
  }

  try {
    // Try to query a simple table or use a health check
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️ Supabase connection test result:', error.message);
      console.log('  This may be normal if the table does not exist yet.');
      console.log('  Run the migration SQL in your Supabase dashboard.');
    } else {
      console.log('✅ Supabase connected successfully!');
      console.log('  Database is ready to use.');
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
  }
}

// Run connection test
testConnection();

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const configured = !!(supabaseUrl && supabaseAnonKey);
  console.log('📊 isSupabaseConfigured called:', configured);
  return configured;
};

export default supabase;
