import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://hsvdhpbkrywahtnkmlfy.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdmRocGJrcnl3YWh0bmttbGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNzExODAsImV4cCI6MjExMDg0NzE4MH0.rauiS_T8WKSyLbpYvzEXYKeT4u4lUkjwq1p165-DIvo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
