const tcb = require('@cloudbase/node-sdk');
const https = require('https');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * 留言板云函数
 * 对应原PHP项目的leaving.php相关功能
 */
exports.main = async (event, context) => {
  const { action, data, page = 1, limit = 10, token, ipInfo } = event;
  
  try {
    // 管理员操作需要验证权限
    const adminActions = ['deleteMessage', 'updateSettings'];
    if (adminActions.includes(action)) {
      const authResult = await verifyAdminToken(token, ipInfo);
      if (!authResult.success) {
        return authResult;
      }
    }
    
    switch (action) {
      case 'getMessages':
        return await getMessages(page, limit);
      case 'addMessage':
        return await addMessage(data, context);
      case 'deleteMessage':
        return await deleteMessage(data.id);
      case 'getSettings':
        return await getLeavingSettings();
      case 'updateSettings':
        return await updateLeavingSettings(data);
      case 'getStats':
        return await getLeavingStats();
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('留言板云函数错误:', error);
    return {
      success: false,
      message: '服务器内部错误',
      error: error.message
    };
  }
};

/**
 * 验证管理员Token
 */
async function verifyAdminToken(token, ipInfo) {
  try {
    if (!token) {
      return {
        success: false,
        message: '未提供认证令牌',
        code: 401
      };
    }

    // 调用auth云函数验证token，传递IP信息
    const authResult = await app.callFunction({
      name: 'auth',
      data: {
        action: 'verifyToken',
        data: { token },
        ipInfo: ipInfo
      }
    });

    if (!authResult.result || !authResult.result.success) {
      return {
        success: false,
        message: '认证失败，请重新登录',
        code: 401
      };
    }

    return {
      success: true,
      userInfo: authResult.result.userInfo
    };
  } catch (error) {
    console.error('Token验证错误:', error);
    return {
      success: false,
      message: '认证服务异常',
      code: 500
    };
  }
}

/**
 * 获取留言列表
 * 对应原PHP: leaving.php的留言显示功能
 */
async function getMessages(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    
    // 按时间倒序获取留言
    const result = await db.collection('leaving')
      .orderBy('time', 'desc')
      .skip(skip)
      .limit(limit)
      .get();
    
    // 获取总数
    const countResult = await db.collection('leaving').count();
    
    // 处理留言数据，添加格式化时间和QQ头像
    const messages = result.data.map(msg => ({
      ...msg,
      formattedTime: formatTime(msg.time),
      qqAvatar: `https://q1.qlogo.cn/g?b=qq&nk=${msg.QQ}&s=100`
    }));
    
    return {
      success: true,
      message: '获取成功',
      data: {
        list: messages,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  } catch (error) {
    console.error('获取留言列表错误:', error);
    return {
      success: false,
      message: '获取留言列表失败',
      error: error.message
    };
  }
}

/**
 * 添加留言
 * 对应原PHP: leaving.php的留言提交功能
 */
async function addMessage(data, context) {
  try {
    const { name, QQ, text, clientIP, clientLocation, browserInfo, deviceInfo, userAgent } = data;
    
    // 获取留言设置
    const settingsResult = await db.collection('leavSet').get();
    let settings = {};
    if (settingsResult.data && settingsResult.data.length > 0) {
      settings = settingsResult.data[0];
    }
    
    // 内容过滤和验证
    const filterResult = await filterContent(text, settings);
    if (!filterResult.success) {
      return filterResult;
    }
    
    // 优先使用前端传递的IP信息，如果没有则尝试从后端获取
    let ip = clientIP || getClientIP(context);
    let city = clientLocation || await getIPLocation(ip);
    
    // 如果前端没有提供IP或IP无效，使用后端方法
    if (!ip || ip === '127.0.0.1' || !isValidIP(ip)) {
      ip = getClientIP(context);
      if (!clientLocation) {
        city = await getIPLocation(ip);
      }
    }
    
    console.log('IP信息:', { 
      clientIP, 
      serverIP: getClientIP(context), 
      finalIP: ip, 
      location: city,
      browserInfo,
      deviceInfo 
    });
    
    // 检查IP是否今天已经留言
    const ipCheckResult = await checkIPDailyLimit(ip);
    if (!ipCheckResult.success) {
      return ipCheckResult;
    }
    
    // 构造留言数据
    const messageData = {
      name: name.trim(),
      QQ: QQ.trim(),
      text: filterResult.filteredText,
      time: Math.floor(Date.now() / 1000).toString(), // 时间戳
      ip: ip,
      city: city,
      // 添加额外的客户端信息
      browserInfo: browserInfo || '',
      deviceInfo: deviceInfo || '',
      userAgent: userAgent || context.headers?.['user-agent'] || ''
    };
    
    // 插入留言
    const result = await db.collection('leaving').add(messageData);
    
    return {
      success: true,
      message: '留言提交成功',
      data: {
        id: result.id,
        ...messageData,
        formattedTime: formatTime(messageData.time),
        qqAvatar: `https://q1.qlogo.cn/g?b=qq&nk=${QQ}&s=100`
      }
    };
  } catch (error) {
    console.error('添加留言错误:', error);
    return {
      success: false,
      message: '留言提交失败',
      error: error.message
    };
  }
}

/**
 * 删除留言（管理员功能）
 * 对应原PHP: admin/delleav.php
 */
async function deleteMessage(messageId) {
  try {
    await db.collection('leaving').doc(messageId).remove();
    
    return {
      success: true,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除留言错误:', error);
    return {
      success: false,
      message: '删除失败',
      error: error.message
    };
  }
}

/**
 * 获取留言设置
 * 对应原PHP: admin/leavSet.php
 */
async function getLeavingSettings() {
  try {
    const result = await db.collection('leavSet').get();
    
    if (result.data && result.data.length > 0) {
      return {
        success: true,
        message: '获取成功',
        data: result.data[0]
      };
    } else {
      return {
        success: false,
        message: '未找到留言设置'
      };
    }
  } catch (error) {
    console.error('获取留言设置错误:', error);
    return {
      success: false,
      message: '获取留言设置失败',
      error: error.message
    };
  }
}

/**
 * 更新留言设置
 */
async function updateLeavingSettings(data) {
  try {
    const result = await db.collection('leavSet').get();
    
    if (result.data && result.data.length > 0) {
      const docId = result.data[0]._id;
      await db.collection('leavSet').doc(docId).update(data);
      
      return {
        success: true,
        message: '更新成功'
      };
    } else {
      return {
        success: false,
        message: '未找到要更新的记录'
      };
    }
  } catch (error) {
    console.error('更新留言设置错误:', error);
    return {
      success: false,
      message: '更新留言设置失败',
      error: error.message
    };
  }
}

/**
 * 内容过滤
 * 对应原PHP项目的违禁词过滤功能
 */
async function filterContent(text, settings) {
  try {
    let filteredText = text.trim();
    
    // 留言长度限制（设置合理的默认值）
    const maxLength = 500; // 设置留言最大长度为500字符
    if (filteredText.length > maxLength) {
      return {
        success: false,
        message: `留言内容不能超过${maxLength}个字符`
      };
    }
    
    // 违禁符号过滤
    if (settings.lanjie) {
      const forbiddenChars = settings.lanjie.split('');
      for (const char of forbiddenChars) {
        if (filteredText.includes(char)) {
          return {
            success: false,
            message: '留言内容包含违禁字符'
          };
        }
      }
    }
    
    // 违禁词过滤
    if (settings.lanjiezf) {
      const forbiddenWords = settings.lanjiezf.split('');
      for (const word of forbiddenWords) {
        if (word && filteredText.includes(word)) {
          return {
            success: false,
            message: '留言内容包含违禁词汇'
          };
        }
      }
    }
    
    return {
      success: true,
      filteredText: filteredText
    };
  } catch (error) {
    console.error('内容过滤错误:', error);
    return {
      success: false,
      message: '内容过滤失败'
    };
  }
}


/**
 * 验证IP地址格式
 */
function isValidIP(ip) {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

/**
 * 获取客户端真实IP
 */
function getClientIP(context) {
  try {
    // 从云函数上下文中获取真实IP
    const headers = context.headers || {};
    
    // 尝试从各种可能的头部获取真实IP
    let ip = headers['x-forwarded-for'] || 
             headers['x-real-ip'] || 
             headers['x-client-ip'] || 
             headers['cf-connecting-ip'] || 
             context.clientIP || 
             '127.0.0.1';
    
    // 如果是多个IP（通过代理），取第一个
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    // 验证IP格式
    if (!isValidIP(ip)) {
      return '127.0.0.1';
    }
    
    return ip;
  } catch (error) {
    console.error('获取IP错误:', error);
    return '127.0.0.1';
  }
}

/**
 * 检查IP每日留言限制
 */
async function checkIPDailyLimit(ip) {
  try {
    // 获取今天的开始时间戳
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000).toString();
    
    // 获取明天的开始时间戳
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Math.floor(tomorrow.getTime() / 1000).toString();
    
    // 查询今天该IP是否已经留言
    const result = await db.collection('leaving')
      .where({
        ip: ip,
        time: db.command.gte(todayTimestamp).and(db.command.lt(tomorrowTimestamp))
      })
      .count();
    
    if (result.total > 0) {
      return {
        success: false,
        message: '您今天已经留言过了，每个IP每天只能留言一次'
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('检查IP限制错误:', error);
    // 如果检查失败，为了安全起见，允许留言
    return {
      success: true
    };
  }
}

/**
 * 获取IP地理位置信息（增强版）
 * 支持多个免费API，提供容错机制
 */
async function getIPLocation(ip) {
  try {
    // 如果是本地IP，直接返回
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return '本地';
    }
    
    // 尝试多个免费API，提供容错
    const apis = [
      {
        name: 'ip-api.com',
        url: `http://ip-api.com/json/${ip}?lang=zh-CN&fields=status,country,regionName,city`,
        parser: (data) => {
          if (data.status === 'success') {
            return `${data.country || '未知'}-${data.regionName || '未知'}-${data.city || '未知'}`;
          }
          return null;
        }
      },
      {
        name: 'ipapi.co',
        url: `https://ipapi.co/${ip}/json/`,
        parser: (data) => {
          if (data.country_name) {
            return `${data.country_name || '未知'}-${data.region || '未知'}-${data.city || '未知'}`;
          }
          return null;
        }
      },
      {
        name: 'ipinfo.io',
        url: `https://ipinfo.io/${ip}/json`,
        parser: (data) => {
          if (data.country) {
            const [city, region] = (data.region || '').split(',');
            return `${data.country || '未知'}-${region || '未知'}-${city || data.city || '未知'}`;
          }
          return null;
        }
      }
    ];
    
    // 依次尝试各个API
    for (const api of apis) {
      try {
        const location = await queryIPAPI(api.url, api.parser);
        if (location) {
          console.log(`IP地理位置查询成功 (${api.name}):`, location);
          return location;
        }
      } catch (error) {
        console.warn(`${api.name} API查询失败:`, error.message);
        continue;
      }
    }
    
    return '未知';
  } catch (error) {
    console.error('获取IP地理位置错误:', error);
    return '未知';
  }
}

/**
 * 查询IP API的通用函数
 */
function queryIPAPI(url, parser) {
  return new Promise((resolve, reject) => {
    const request = (url.startsWith('https') ? https : require('http')).get(url, {
      timeout: 5000, // 5秒超时
      headers: {
        'User-Agent': 'CloudBase-Function/1.0'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const result = parser(jsonData);
          resolve(result);
        } catch (error) {
          reject(new Error('解析响应数据失败'));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 获取留言统计数据
 */
async function getLeavingStats() {
  try {
    // 获取留言总数
    const countResult = await db.collection('leaving').count();
    
    return {
      success: true,
      message: '获取留言统计成功',
      data: {
        count: countResult.total,
        total: countResult.total
      }
    };
  } catch (error) {
    console.error('获取留言统计错误:', error);
    return {
      success: false,
      message: '获取留言统计失败',
      error: error.message
    };
  }
}

/**
 * 格式化时间戳
 */
function formatTime(timestamp) {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
