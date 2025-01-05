import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Test the connection and log table structure
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful');
      console.log('Sample post structure:', data?.[0]);
    }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
  }
};

testConnection();
