/**
 * IP地址获取工具
 */

/**
 * 获取用户IP地址和地理位置信息
 */
export async function getUserIPInfo() {
  try {
    // 尝试多个免费API，提供容错机制
    const apis = [
      {
        name: 'ipapi.co',
        url: 'https://ipapi.co/json/',
        parser: (data) => ({
          ip: data.ip,
          country: data.country_name || '未知',
          region: data.region || '未知',
          city: data.city || '未知',
          location: `${data.country_name || '未知'}-${data.region || '未知'}-${data.city || '未知'}`
        })
      },
      {
        name: 'ip-api.com',
        url: 'http://ip-api.com/json/?lang=zh-CN',
        parser: (data) => ({
          ip: data.query,
          country: data.country || '未知',
          region: data.regionName || '未知',
          city: data.city || '未知',
          location: `${data.country || '未知'}-${data.regionName || '未知'}-${data.city || '未知'}`
        })
      },
      {
        name: 'ipinfo.io',
        url: 'https://ipinfo.io/json',
        parser: (data) => {
          const [city, region] = (data.region || '').split(',');
          return {
            ip: data.ip,
            country: data.country || '未知',
            region: region || data.region || '未知',
            city: city || data.city || '未知',
            location: `${data.country || '未知'}-${region || data.region || '未知'}-${city || data.city || '未知'}`
          };
        }
      }
    ];

    // 依次尝试各个API
    for (const api of apis) {
      try {
        
        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          timeout: 5000
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const result = api.parser(data);
        
        if (result.ip && result.ip !== '127.0.0.1') {
          return result;
        }
      } catch (error) {
        continue;
      }
    }

    // 如果所有API都失败，返回默认值
    return {
      ip: '127.0.0.1',
      country: '未知',
      region: '未知', 
      city: '未知',
      location: '未知'
    };

  } catch (error) {
    return {
      ip: '127.0.0.1',
      country: '未知',
      region: '未知',
      city: '未知', 
      location: '未知'
    };
  }
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browser = '未知浏览器';
  let version = '';

  if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || '';
  } else if (userAgent.indexOf('Edge') > -1) {
    browser = 'Edge';
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || '';
  }

  return {
    browser,
    version,
    userAgent,
    platform: navigator.platform,
    language: navigator.language
  };
}

/**
 * 获取设备信息
 */
export function getDeviceInfo() {
  const width = window.screen.width;
  const height = window.screen.height;
  
  let deviceType = 'Desktop';
  if (width <= 768) {
    deviceType = 'Mobile';
  } else if (width <= 1024) {
    deviceType = 'Tablet';
  }

  return {
    deviceType,
    screenWidth: width,
    screenHeight: height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  };
}

/**
 * 获取完整的用户环境信息
 */
export async function getUserEnvironmentInfo() {
  try {
    const [ipInfo, browserInfo, deviceInfo] = await Promise.all([
      getUserIPInfo(),
      Promise.resolve(getBrowserInfo()),
      Promise.resolve(getDeviceInfo())
    ]);

    return {
      ...ipInfo,
      ...browserInfo,
      ...deviceInfo,
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  } catch (error) {
    console.error('获取用户环境信息失败:', error);
    return {
      ip: '127.0.0.1',
      location: '未知',
      browser: '未知浏览器',
      deviceType: 'Desktop',
      timestamp: Date.now()
    };
  }
}

/**
 * IP本地存储管理
 */
const IP_STORAGE_KEY = 'user_ip_info';
const IP_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6小时

/**
 * 从本地存储获取IP信息
 */
export function getStoredIPInfo() {
  try {
    const stored = localStorage.getItem(IP_STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const now = Date.now();
    
    // 检查是否过期
    if (now - data.timestamp > IP_CACHE_DURATION) {
      localStorage.removeItem(IP_STORAGE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('获取本地IP信息失败:', error);
    localStorage.removeItem(IP_STORAGE_KEY);
    return null;
  }
}

/**
 * 保存IP信息到本地存储
 */
export function storeIPInfo(ipInfo) {
  try {
    const data = {
      ...ipInfo,
      timestamp: Date.now()
    };
    localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存IP信息到本地存储失败:', error);
    return false;
  }
}

/**
 * 获取或刷新IP信息（优先使用缓存）
 */
export async function getOrRefreshIPInfo() {
  // 先尝试从本地存储获取
  const stored = getStoredIPInfo();
  if (stored && stored.ip && stored.ip !== '127.0.0.1') {
    return stored;
  }
  
  // 本地存储无效，重新获取
  const ipInfo = await getUserIPInfo();
  
  // 保存到本地存储
  if (ipInfo.ip && ipInfo.ip !== '127.0.0.1') {
    storeIPInfo(ipInfo);
  }
  
  return ipInfo;
}

/**
 * 清除本地IP缓存
 */
export function clearStoredIPInfo() {
  try {
    localStorage.removeItem(IP_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清除本地IP缓存失败:', error);
    return false;
  }
}
