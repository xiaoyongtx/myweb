import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request);
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    
    if (authError) {
      return NextResponse.json({ 
        error: '认证错误', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: '未登录用户' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Error in test-auth:', error);
    return NextResponse.json({ 
      error: '服务器错误', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}