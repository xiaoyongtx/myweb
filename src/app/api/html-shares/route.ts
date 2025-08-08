import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const type = searchParams.get('type'); // 'public' | 'my'
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const limit = parseInt(searchParams.get('limit') || '50');
  
  try {
    let query = supabase.from('html_shares').select('*');
    
    if (type === 'public') {
      query = query.eq('is_public', true);
    }
    
    // 排序
    if (sortBy === 'view_count') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query.limit(limit);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('获取HTML分享列表失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, html_content, description, is_public, user_id } = body;
    
    if (!title || !html_content || !user_id) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('html_shares')
      .insert({
        user_id,
        title: title.trim(),
        html_content,
        description: description?.trim() || null,
        is_public: is_public ?? true
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('创建HTML分享失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}