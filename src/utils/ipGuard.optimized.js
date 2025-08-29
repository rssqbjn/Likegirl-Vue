/**
 * 优化版IP检测守卫
 * 减少不必要的网络请求，提升页面性能
 */

import { getOrRefreshIPInfo } from './ipUtils.js';
import { app, ensureLogin } from './cloudbase.js';

// 缓存机制
const ipCache = {
  ip: null,
  banStatus: null,
  lastCheck: 0,
  cacheTimeout: 10 * 60 * 1000 // 10分钟缓存
};

/**
 * 检查IP是否被封禁 - 带缓存优化
 */
export async function checkIPBan(ip) {
  try {
    const now = Date.now();
    
    // 使用缓存结果
    if (ipCache.ip === ip && 
        ipCache.banStatus && 
        now - ipCache.lastCheck < ipCache.cacheTimeout) {
      return ipCache.banStatus;
    }
    
    // 确保已登录
    await ensureLogin();
    
    const result = await app.callFunction({
      name: 'ipManage',
      data: {
        action: 'checkIpBan',
        data: { ip }
      }
    });

    const banStatus = result.result && result.result.success 
      ? result.result.data 
      : { isBanned: false };

    // 更新缓存
    ipCache.ip = ip;
    ipCache.banStatus = banStatus;
    ipCache.lastCheck = now;

    return banStatus;
  } catch (error) {
    console.error('检查IP封禁状态失败:', error);
    return { isBanned: false };
  }
}

/**
 * IP守卫初始化 - 优化版本
 */
export async function initIPGuard() {
  try {
    // 获取IP信息
    const ipInfo = await getOrRefreshIPInfo();
    
    if (!ipInfo.ip || ipInfo.ip === '127.0.0.1') {
      return { success: true, ip: ipInfo.ip, banned: false };
    }
    
    // 检查IP是否被封禁
    const banResult = await checkIPBan(ipInfo.ip);
    
    if (banResult.isBanned) {
      // IP被封禁，显示警告
      showBanWarning(banResult.banInfo);
      return { 
        success: false, 
        ip: ipInfo.ip, 
        banned: true, 
        banInfo: banResult.banInfo 
      };
    }

    return { success: true, ip: ipInfo.ip, banned: false };

  } catch (error) {
    console.error('IP守卫初始化失败:', error);
    return { success: true, ip: 'unknown', banned: false }; // 出错时允许继续访问
  }
}

/**
 * 显示封禁警告
 */
function showBanWarning(banInfo) {
  const message = banInfo 
    ? `您的IP地址已被封禁\n原因: ${banInfo.reason}\n封禁时间: ${new Date(banInfo.createTime).toLocaleString()}`
    : '您的IP地址已被封禁，请联系管理员';

  // 使用更友好的提示方式
  if (typeof window !== 'undefined' && window.confirm) {
    const shouldRedirect = window.confirm(message + '\n\n点击确定返回首页');
    if (shouldRedirect) {
      window.location.href = '/';
    }
  }
}

/**
 * 路由守卫中间件 - 优化版本
 * 大幅减少检查频率
 */
export async function routeIPGuard(to, from, next) {
  try {
    const now = Date.now();
    
    // 只在缓存过期时才检查
    if (ipCache.lastCheck && now - ipCache.lastCheck < ipCache.cacheTimeout) {
      if (ipCache.banStatus && ipCache.banStatus.isBanned) {
        showBanWarning(ipCache.banStatus.banInfo);
        next(false);
        return;
      }
      next();
      return;
    }

    // 获取当前IP
    const ipInfo = await getOrRefreshIPInfo();
    
    if (!ipInfo.ip || ipInfo.ip === '127.0.0.1') {
      next(); // 无法获取IP时允许继续
      return;
    }

    // 检查IP封禁状态
    const banResult = await checkIPBan(ipInfo.ip);
    
    if (banResult.isBanned) {
      showBanWarning(banResult.banInfo);
      next(false); // 阻止路由跳转
      return;
    }

    next(); // 允许继续
  } catch (error) {
    console.error('路由IP检测失败:', error);
    next(); // 出错时允许继续
  }
}

/**
 * 全局IP检测状态
 */
let globalIPStatus = {
  ip: null,
  isBanned: false,
  lastCheck: 0,
  checkInterval: 10 * 60 * 1000 // 增加到10分钟检查一次
};

/**
 * 获取当前IP状态
 */
export function getCurrentIPStatus() {
  return { ...globalIPStatus };
}

/**
 * 定期检查IP状态 - 优化版本
 */
export function startIPMonitoring() {
  let isUserActive = true;
  let lastActivity = Date.now();

  // 监听用户活动
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  const updateActivity = () => {
    isUserActive = true;
    lastActivity = Date.now();
  };

  activityEvents.forEach(event => {
    document.addEventListener(event, updateActivity, true);
  });

  // 检查用户是否活跃
  setInterval(() => {
    if (Date.now() - lastActivity > 5 * 60 * 1000) {
      isUserActive = false;
    }
  }, 60000);

  // 定期IP检查
  setInterval(async () => {
    try {
      if (!isUserActive) {
        return;
      }

      const now = Date.now();
      if (now - globalIPStatus.lastCheck < globalIPStatus.checkInterval) {
        return;
      }

      const ipInfo = await getOrRefreshIPInfo();
      if (!ipInfo.ip || ipInfo.ip === '127.0.0.1') {
        return;
      }

      const banResult = await checkIPBan(ipInfo.ip);
      
      globalIPStatus = {
        ip: ipInfo.ip,
        isBanned: banResult.isBanned,
        lastCheck: now,
        checkInterval: globalIPStatus.checkInterval,
        banInfo: banResult.banInfo
      };

      if (banResult.isBanned) {
        showBanWarning(banResult.banInfo);
      }

    } catch (error) {
      console.error('定期IP检测失败:', error);
    }
  }, 10 * 60 * 1000);
}
