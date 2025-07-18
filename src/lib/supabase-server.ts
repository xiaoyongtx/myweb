import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 创建Supabase服务端客户端
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set(name, value, options as any);
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete(name, options as any);
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}