import { NextRequest, NextResponse } from 'next/server';

// 简单的短链接生成函数
function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 验证URL格式
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// 使用免费的短链接服务
async function createShortUrl(originalUrl: string): Promise<{ shortUrl: string; error?: string }> {
  try {
    // 使用 is.gd 免费短链接服务
    const response = await fetch('https://is.gd/create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        format: 'simple',
        url: originalUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('短链接服务暂时不可用');
    }

    const shortUrl = await response.text();
    
    // 检查是否返回错误信息
    if (shortUrl.includes('Error:') || shortUrl.includes('error')) {
      throw new Error('无法生成短链接，请检查URL是否有效');
    }

    return { shortUrl: shortUrl.trim() };
  } catch (error) {
    console.error('is.gd 服务失败，尝试备用服务:', error);
    
    // 备用方案：使用 tinyurl.com
    try {
      const tinyResponse = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`);
      
      if (!tinyResponse.ok) {
        throw new Error('备用短链接服务也不可用');
      }

      const tinyUrl = await tinyResponse.text();
      
      if (tinyUrl.includes('Error') || tinyUrl.includes('error') || !tinyUrl.startsWith('http')) {
        throw new Error('备用服务无法生成短链接');
      }

      return { shortUrl: tinyUrl.trim() };
    } catch (backupError) {
      console.error('备用服务也失败:', backupError);
      
      // 最后的备用方案：生成本地短链接（仅用于演示）
      const shortCode = generateShortCode();
      return { 
        shortUrl: `https://short.ly/${shortCode}`,
        error: '注意：这是演示链接，实际使用需要配置短链接服务'
      };
    }
  }
}

export async function POST(request: NextRequest) {
  // 添加CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: '请提供要缩短的URL' },
        { status: 400, headers }
      );
    }

    // 验证URL格式
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: '请提供有效的URL（必须包含 http:// 或 https://）' },
        { status: 400, headers }
      );
    }

    // 生成短链接
    const result = await createShortUrl(url);

    return NextResponse.json({
      originalUrl: url,
      shortUrl: result.shortUrl,
      warning: result.error,
      createdAt: new Date().toISOString(),
    }, { headers });

  } catch (error) {
    console.error('短链接生成错误:', error);
    return NextResponse.json(
      { error: '生成短链接时发生错误，请稍后再试' },
      { status: 500, headers }
    );
  }
}

// 处理OPTIONS请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}