import { NextResponse } from 'next/server';

// 使用多个备用API，以防某个API失败
const IP_APIS = {
  // 获取IP地址的API
  ipify: 'https://api.ipify.org?format=json',
  ipinfo: 'https://ipinfo.io/json',
  
  // 获取IP详细信息的API
  ipapi: (ip: string) => `https://ipapi.co/${ip}/json/`,
  ipdata: (ip: string) => `https://api.ipdata.co/${ip}?api-key=test`
};

// 添加缓存以提高性能
const CACHE_DURATION = 3600; // 1小时，单位：秒
const ipCache = new Map<string, { data: any, timestamp: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');
  const noCache = searchParams.get('no_cache') === 'true';
  
  try {
    // 如果没有提供IP，先获取用户的IP
    let ipToLookup: string = ip || '';
    
    if (!ipToLookup) {
      // 尝试从请求头获取IP
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      
      if (forwardedFor) {
        ipToLookup = forwardedFor.split(',')[0].trim();
      } else if (realIp) {
        ipToLookup = realIp;
      } else {
        // 如果请求头中没有IP信息，尝试使用API获取
        try {
          // 添加超时控制
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const ipResponse = await fetch(IP_APIS.ipify, { 
            cache: 'no-store',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));
          
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            ipToLookup = ipData.ip;
          } else {
            // 尝试备用API
            const backupController = new AbortController();
            const backupTimeoutId = setTimeout(() => backupController.abort(), 5000);
            
            const ipInfoResponse = await fetch(IP_APIS.ipinfo, { 
              cache: 'no-store',
              headers: { 'Accept': 'application/json' },
              signal: backupController.signal
            }).finally(() => clearTimeout(backupTimeoutId));
            
            if (ipInfoResponse.ok) {
              const ipInfoData = await ipInfoResponse.json();
              ipToLookup = ipInfoData.ip;
            } else {
              throw new Error('无法获取IP地址');
            }
          }
        } catch (error) {
          console.error('获取IP地址失败:', error);
          throw new Error('无法获取IP地址');
        }
      }
    }
    
    // 如果仍然没有IP，返回错误
    if (!ipToLookup) {
      return NextResponse.json(
        { error: '无法获取IP地址' },
        { status: 400 }
      );
    }
    
    // 检查缓存
    if (!noCache && ipCache.has(ipToLookup)) {
      const cachedData = ipCache.get(ipToLookup);
      if (cachedData && (Date.now() - cachedData.timestamp) / 1000 < CACHE_DURATION) {
        return NextResponse.json(cachedData.data);
      }
    }
    
    // 获取IP详细信息
    let ipDetails = null;
    let error = null;
    
    // 尝试第一个API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const geoResponse = await fetch(IP_APIS.ipapi(ipToLookup), { 
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (geoResponse.ok) {
        const data = await geoResponse.json();
        
        if (!data.error) {
          ipDetails = {
            ip: ipToLookup,
            country: data.country_name || '未知',
            region: data.region || '未知',
            city: data.city || '未知',
            isp: data.org || '未知',
            timezone: data.timezone || '未知',
            lat: data.latitude,
            lon: data.longitude
          };
        } else {
          error = data.reason || '无效的IP地址';
        }
      }
    } catch (err) {
      console.error('第一个API查询失败:', err);
      error = '获取IP地理位置信息失败';
    }
    
    // 如果第一个API失败，尝试第二个API
    if (!ipDetails) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const geoResponse = await fetch(IP_APIS.ipdata(ipToLookup), { 
          cache: 'no-store',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (geoResponse.ok) {
          const data = await geoResponse.json();
          
          ipDetails = {
            ip: ipToLookup,
            country: data.country_name || '未知',
            region: data.region || '未知',
            city: data.city || '未知',
            isp: data.asn?.name || '未知',
            timezone: data.time_zone?.name || '未知',
            lat: data.latitude,
            lon: data.longitude
          };
        }
      } catch (err) {
        console.error('第二个API查询失败:', err);
        // 如果已经有错误，保留原来的错误
        if (!error) {
          error = '获取IP地理位置信息失败';
        }
      }
    }
    
    // 如果两个API都失败了
    if (!ipDetails) {
      // 至少返回IP地址
      const fallbackResponse = {
        ip: ipToLookup,
        country: '未知',
        region: '未知',
        city: '未知',
        isp: '未知',
        timezone: '未知',
        error: error || '无法获取IP详细信息'
      };
      
      return NextResponse.json(fallbackResponse);
    }
    
    // 保存到缓存
    ipCache.set(ipToLookup, {
      data: ipDetails,
      timestamp: Date.now()
    });
    
    // 清理过期缓存
    if (ipCache.size > 100) { // 限制缓存大小
      const now = Date.now();
      for (const [key, value] of ipCache.entries()) {
        if ((now - value.timestamp) / 1000 > CACHE_DURATION) {
          ipCache.delete(key);
        }
      }
    }
    
    return NextResponse.json(ipDetails);
  } catch (error) {
    console.error('IP查询错误:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '获取IP信息失败',
        ip: ip || '未知'
      },
      { status: 500 }
    );
  }
}