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
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const search = searchParams.get('search');

    // 构建查询
    let query = supabase
      .from('netdisk_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 添加平台筛选
    if (platform) {
      query = query.eq('platform', platform);
    }

    // 添加搜索筛选
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: links, error } = await query;

    if (error) {
      console.error('Error fetching netdisk links:', error);
      return NextResponse.json({ error: '获取链接失败' }, { status: 500 });
    }

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error in GET /api/netdisk-links:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request);
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const { links } = body;

    if (!links || !Array.isArray(links)) {
      return NextResponse.json({ error: '无效的链接数据' }, { status: 400 });
    }

    // 为每个链接添加用户ID
    const linksWithUserId = links.map(link => ({
      ...link,
      user_id: user.id,
    }));

    const { data: insertedLinks, error } = await supabase
      .from('netdisk_links')
      .insert(linksWithUserId)
      .select();

    if (error) {
      console.error('Error inserting netdisk links:', error);
      return NextResponse.json({ error: '保存链接失败' }, { status: 500 });
    }

    return NextResponse.json({ links: insertedLinks });
  } catch (error) {
    console.error('Error in POST /api/netdisk-links:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request);
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: '缺少链接ID' }, { status: 400 });
    }

    const linkIds = ids.split(',');

    const { error } = await supabase
      .from('netdisk_links')
      .delete()
      .eq('user_id', user.id)
      .in('id', linkIds);

    if (error) {
      console.error('Error deleting netdisk links:', error);
      return NextResponse.json({ error: '删除链接失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/netdisk-links:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}