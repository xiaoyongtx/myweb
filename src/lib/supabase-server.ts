import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 创建Supabase服务端客户端
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  
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
            cookieStore.set({ name, value, ...options as Record<string, unknown> });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.delete(name);
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}