import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

// 创建服务端Supabase客户端
export const createSupabaseServerClient = (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or key is missing');
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {
        // 在API路由中，我们通常不需要设置cookies
        // 因为认证状态由客户端管理
      },
      remove() {
        // 在API路由中，我们通常不需要删除cookies
      },
    },
  });
};