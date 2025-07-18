import { createBrowserClient } from '@supabase/ssr';

// 创建Supabase客户端（浏览器端）
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key is missing');
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
};