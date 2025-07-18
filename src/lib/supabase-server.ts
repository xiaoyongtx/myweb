import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 创建一个简单的cookie存储对象
const cookieStore = {
  get(name: string) {
    try {
      // 使用同步方式获取cookie
      return cookies().get(name)?.value;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return undefined;
    }
  },
  set(name: string, value: string, options: Record<string, unknown>) {
    try {
      // 使用同步方式设置cookie
      cookies().set({ name, value, ...options as Record<string, unknown> });
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  },
  remove(name: string, options: Record<string, unknown>) {
    try {
      // 使用同步方式删除cookie
      cookies().delete({ name, ...options as Record<string, unknown> });
    } catch (error) {
      console.error('Error removing cookie:', error);
    }
  }
};

// 创建Supabase服务端客户端
export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore
    }
  );
}