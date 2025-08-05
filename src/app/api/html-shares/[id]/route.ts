import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('html_shares')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('获取HTML分享失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  
  try {
    const body = await request.json();
    const { title, html_content, description, is_public } = body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (html_content !== undefined) updateData.html_content = html_content;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (is_public !== undefined) updateData.is_public = is_public;
    
    const { data, error } = await supabase
      .from('html_shares')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('更新HTML分享失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  
  try {
    const { error } = await supabase
      .from('html_shares')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除HTML分享失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 更新浏览次数
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'increment_view') {
      const { error } = await supabase.rpc('increment_view_count', {
        share_id: id
      });
      
      if (error) {
        // 如果RPC函数不存在，使用常规更新
        const { data: currentData } = await supabase
          .from('html_shares')
          .select('view_count')
          .eq('id', id)
          .single();
        
        if (currentData) {
          await supabase
            .from('html_shares')
            .update({ view_count: currentData.view_count + 1 })
            .eq('id', id);
        }
      }
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: '无效的操作' }, { status: 400 });
  } catch (error) {
    console.error('更新HTML分享失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}