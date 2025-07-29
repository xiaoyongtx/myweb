import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseServerClient(request);
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '缺少链接ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('netdisk_links')
      .delete()
      .eq('user_id', user.id)
      .eq('id', id);

    if (error) {
      console.error('Error deleting netdisk link:', error);
      return NextResponse.json({ error: '删除链接失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/netdisk-links/[id]:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseServerClient(request);
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: '缺少链接ID' }, { status: 400 });
    }

    // 移除不应该更新的字段
    const { id: bodyId, user_id, created_at, ...updateData } = body;
    // 避免未使用变量的警告
    void bodyId;
    void user_id;
    void created_at;

    const { data: updatedLink, error } = await supabase
      .from('netdisk_links')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating netdisk link:', error);
      return NextResponse.json({ error: '更新链接失败' }, { status: 500 });
    }

    return NextResponse.json({ link: updatedLink });
  } catch (error) {
    console.error('Error in PUT /api/netdisk-links/[id]:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}