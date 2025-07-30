import { NextResponse } from 'next/server';

// 使用多个备用API，以防某个API失败
const IP_APIS = {
  // 获取IP地址的API
  ipify: 'https://api.ipify.org?format=json',
  ipinfo: 'https://ipinfo.io/json',
  httpbin: 'https://httpbin.org/ip',

  // 获取IP详细信息的API - 按优先级排序
  ipinfo_detail: (ip: string) => `https://ipinfo.io/${ip}/json`,
  ipwhois: (ip: string) => `https://ipwho.is/${ip}`,
  ipapi: (ip: string) => `https://ipapi.co/${ip}/json/`
};

// 添加缓存以提高性能
const CACHE_DURATION = 3600; // 1小时，单位：秒
const ipCache = new Map<string, { data: any, timestamp: number }>();

// 国家代码转换为中文名称的辅助函数
function getCountryName(countryCode: string): string {
  const countryNames: { [key: string]: string } = {
    'CN': '中国',
    'US': '美国',
    'JP': '日本',
    'KR': '韩国',
    'GB': '英国',
    'DE': '德国',
    'FR': '法国',
    'CA': '加拿大',
    'AU': '澳大利亚',
    'SG': '新加坡',
    'HK': '香港',
    'TW': '台湾',
    'RU': '俄罗斯',
    'IN': '印度',
    'BR': '巴西',
    'IT': '意大利',
    'ES': '西班牙',
    'NL': '荷兰',
    'SE': '瑞典',
    'NO': '挪威',
    'DK': '丹麦',
    'FI': '芬兰',
    'CH': '瑞士',
    'AT': '奥地利',
    'BE': '比利时',
    'IE': '爱尔兰',
    'PT': '葡萄牙',
    'GR': '希腊',
    'PL': '波兰',
    'CZ': '捷克',
    'HU': '匈牙利',
    'RO': '罗马尼亚',
    'BG': '保加利亚',
    'HR': '克罗地亚',
    'SI': '斯洛文尼亚',
    'SK': '斯洛伐克',
    'LT': '立陶宛',
    'LV': '拉脱维亚',
    'EE': '爱沙尼亚',
    'MT': '马耳他',
    'CY': '塞浦路斯',
    'LU': '卢森堡'
  };
  return countryNames[countryCode] || countryCode;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');
  const noCache = searchParams.get('no_cache') === 'true';

  try {
    // 如果没有提供IP，获取访问者的真实IP
    let ipToLookup: string = ip || '';

    if (!ipToLookup) {
      // 从请求头中获取访问者的真实IP地址
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

      if (cfConnectingIp) {
        ipToLookup = cfConnectingIp;
      } else if (forwarded) {
        // x-forwarded-for 可能包含多个IP，取第一个
        ipToLookup = forwarded.split(',')[0].trim();
      } else if (realIp) {
        ipToLookup = realIp;
      }

      // 如果还是没有获取到IP，返回错误
      if (!ipToLookup) {
        return NextResponse.json({
          error: '无法获取访问者IP地址',
          tip: '可能是因为您在本地环境或代理后面'
        }, { status: 400 });
      }

      // 如果检测到本地IP地址，通过外部API获取真实公网IP
      if (ipToLookup === '127.0.0.1' || ipToLookup === '::1' || ipToLookup.startsWith('192.168.') || ipToLookup.startsWith('10.') || ipToLookup.startsWith('172.')) {

        // 尝试多个API获取公网IP
        const ipApis = [
          { name: 'ipify', url: IP_APIS.ipify, parseResponse: (data: any) => data.ip },
          { name: 'ipinfo', url: IP_APIS.ipinfo, parseResponse: (data: any) => data.ip },
          { name: 'httpbin', url: IP_APIS.httpbin, parseResponse: (data: any) => data.origin }
        ];

        let foundPublicIp = false;
        for (const api of ipApis) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(api.url, {
              cache: 'no-store',
              headers: { 'Accept': 'application/json' },
              signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));

            if (response.ok) {
              const data = await response.json();
              const extractedIp = api.parseResponse(data);
              if (extractedIp && extractedIp !== ipToLookup) {
                ipToLookup = extractedIp;
                foundPublicIp = true;
                break;
              }
            }
          } catch (error) {
            continue;
          }
        }

        if (!foundPublicIp) {
          return NextResponse.json({
            error: '无法获取公网IP地址',
            tip: '本地环境且外部IP查询服务不可用'
          }, { status: 400 });
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


    // 获取IP详细信息 - 尝试多个API
    let ipDetails = null;

    // API配置数组，按优先级排序
    const geoApis = [
      {
        name: 'ipinfo',
        url: IP_APIS.ipinfo_detail(ipToLookup),
        parser: (data: any) => {
          const loc = data.loc ? data.loc.split(',') : [null, null];
          return {
            ip: ipToLookup,
            country: data.country ? getCountryName(data.country) : '未知',
            region: data.region || '未知',
            city: data.city || '未知',
            isp: data.org ? data.org.replace(/^AS\d+\s+/, '') : '未知',
            timezone: data.timezone || '未知',
            lat: loc[0] ? parseFloat(loc[0]) : undefined,
            lon: loc[1] ? parseFloat(loc[1]) : undefined,
            asn: data.org?.match(/AS\d+/)?.[0],
            org: data.org,
            type: data.anycast ? 'Anycast' : undefined,
            mobile: false,
            proxy: false,
            hosting: data.org?.toLowerCase().includes('hosting') ||
              data.org?.toLowerCase().includes('cloud') ||
              data.org?.toLowerCase().includes('server') || false
          };
        }
      },
      {
        name: 'ipwhois',
        url: IP_APIS.ipwhois(ipToLookup),
        parser: (data: any) => ({
          ip: ipToLookup,
          country: data.country || '未知',
          region: data.region || '未知',
          city: data.city || '未知',
          isp: data.connection?.isp || data.isp || '未知',
          timezone: data.timezone?.id || '未知',
          lat: data.latitude,
          lon: data.longitude,
          asn: data.connection?.asn ? `AS${data.connection.asn}` : undefined,
          org: data.connection?.org || data.org,
          type: data.type,
          mobile: data.is_mobile || false,
          proxy: data.is_proxy || false,
          hosting: data.is_hosting || false
        })
      },
      {
        name: 'ipapi',
        url: IP_APIS.ipapi(ipToLookup),
        parser: (data: any) => ({
          ip: ipToLookup,
          country: data.country_name || '未知',
          region: data.region || '未知',
          city: data.city || '未知',
          isp: data.org || '未知',
          timezone: data.timezone || '未知',
          lat: data.latitude,
          lon: data.longitude,
          asn: data.asn,
          org: data.org,
          type: data.type,
          mobile: data.connection?.mobile || false,
          proxy: data.connection?.proxy || false,
          hosting: data.connection?.hosting || false
        })
      }
    ];

    // 依次尝试各个API
    for (const api of geoApis) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(api.url, {
          cache: 'no-store',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (response.ok) {
          const data = await response.json();

          // 检查响应是否有效
          if (api.name === 'ipapi' && data.error) {
            continue;
          }

          if (api.name === 'ipwhois' && !data.success) {
            continue;
          }

          // 解析数据
          ipDetails = api.parser(data);
          break;
        } else {
        }
      } catch (err) {
        continue;
      }
    }

    // 如果所有地理位置API都失败了，至少返回IP地址
    if (!ipDetails) {
      const fallbackResponse = {
        ip: ipToLookup,
        country: '未知',
        region: '未知',
        city: '未知',
        isp: '未知',
        timezone: '未知',
        asn: undefined,
        org: undefined,
        type: undefined,
        mobile: false,
        proxy: false,
        hosting: false
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