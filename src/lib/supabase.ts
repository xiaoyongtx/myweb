import { createBrowserClient } from '@supabase/ssr';

// 从环境变量中获取Supabase的URL和anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 检查环境变量是否存在
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and/or anon key are missing from environment variables.');
}

// 创建并导出一个单例的Supabase客户端
// 这确保了在整个应用中只使用一个客户端实例
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);