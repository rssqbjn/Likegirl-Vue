const tcb = require('@cloudbase/node-sdk');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * IP管理云函数
 * 处理IP封禁、非法访问记录等功能
 */
exports.main = async (event, context) => {
  const { action, data, token, ipInfo } = event;
  
  try {
    // 获取IP信息（优先使用前端传递的）
    const clientIP = ipInfo?.ip || context.CLIENTIP || '未知';
    
    // 记录访问日志
    console.log(`IP管理云函数被调用 - 操作: ${action}, IP: ${clientIP}, 时间: ${new Date().toISOString()}`);
    
    // 需要管理员权限的操作
    const adminActions = ['getIpList', 'addIpBan', 'deleteIpBan', 'getIllegalAccess', 'clearIllegalAccess'];
    
    if (adminActions.includes(action)) {
      const authResult = await verifyAdminToken(token, ipInfo);
      if (!authResult.success) {
        return {
          success: false,
          message: '需要管理员权限',
          code: 401
        };
      }
    }
    
    switch (action) {
      case 'getIpList':
        return await getIpList(data);
      case 'addIpBan':
        return await addIpBan(data, context, ipInfo);
      case 'deleteIpBan':
        return await deleteIpBan(data, context, ipInfo);
      case 'getIllegalAccess':
        return await getIllegalAccess(data);
      case 'addIllegalAccess':
        return await addIllegalAccess(data, ipInfo);
      case 'clearIllegalAccess':
        return await clearIllegalAccess(data, context, ipInfo);
      case 'checkIpBan':
        return await checkIpBan(data);
      case 'getIpStats':
        return await getIpStats();
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('IP管理云函数错误:', error);
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
      console.log('Token验证失败: 未提供认证令牌');
      return {
        success: false,
        message: '未提供认证令牌'
      };
    }

    console.log('开始验证Token:', token.substring(0, 20) + '...');

    // 调用auth云函数验证token，传递IP信息
    const authResult = await app.callFunction({
      name: 'auth',
      data: {
        action: 'verifyToken',
        data: { token },
        ipInfo: ipInfo // 传递IP信息
      }
    });

    if (!authResult.result || !authResult.result.success) {
      console.log('Token验证失败:', authResult.result?.message || '未知错误');
      return {
        success: false,
        message: authResult.result?.message || 'Token验证失败'
      };
    }

    console.log('Token验证成功:', authResult.result.userInfo);
    return {
      success: true,
      message: 'Token有效',
      userInfo: authResult.result.userInfo
    };
  } catch (error) {
    console.error('Token验证失败:', error);
    return {
      success: false,
      message: 'Token验证失败'
    };
  }
}

/**
 * 获取IP封禁列表
 */
async function getIpList(data) {
  try {
    const { page = 1, limit = 100 } = data || {};
    
    const result = await db.collection('ipBan')
      .orderBy('createTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get();
    
    const total = await db.collection('ipBan').count();
    
    return {
      success: true,
      message: '获取IP封禁列表成功',
      data: {
        list: result.data,
        total: total.total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total.total / limit)
      }
    };
  } catch (error) {
    console.error('获取IP封禁列表错误:', error);
    return {
      success: false,
      message: '获取IP封禁列表失败',
      error: error.message
    };
  }
}

/**
 * 添加IP封禁
 */
async function addIpBan(data, context, ipInfo) {
  try {
    const { ip, reason, location, duration } = data;
    // 优先使用前端传递的IP信息
    const operatorIP = ipInfo?.ip || context.CLIENTIP || 'unknown';
    
    if (!ip || !reason) {
      return {
        success: false,
        message: 'IP地址和封禁原因不能为空'
      };
    }
    
    // 检查IP是否已经被封禁
    const existingBan = await db.collection('ipBan')
      .where({
        ip: ip,
        status: 1
      })
      .get();
    
    if (existingBan.data.length > 0) {
      return {
        success: false,
        message: '该IP已经被封禁'
      };
    }
    
    // 计算过期时间
    let expireTime = null;
    if (duration && duration > 0) {
      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + duration);
      expireTime = expireDate.toISOString();
    }
    
    // 添加IP封禁记录
    const result = await db.collection('ipBan').add({
      ip: ip,
      reason: reason,
      location: location || '未知',
      createTime: new Date().toISOString(),
      expireTime: expireTime,
      operatorIP: operatorIP,
      status: 1 // 1=生效，0=失效
    });
    
    // 记录操作日志
    await recordIPOperation('add', ip, reason, operatorIP, context);
    
    return {
      success: true,
      message: 'IP封禁添加成功',
      data: result
    };
  } catch (error) {
    console.error('添加IP封禁错误:', error);
    return {
      success: false,
      message: 'IP封禁添加失败',
      error: error.message
    };
  }
}

/**
 * 删除IP封禁
 */
async function deleteIpBan(data, context, ipInfo) {
  try {
    const { id } = data;
    // 优先使用前端传递的IP信息
    const operatorIP = ipInfo?.ip || context.CLIENTIP || 'unknown';
    
    if (!id) {
      return {
        success: false,
        message: '缺少封禁记录ID'
      };
    }
    
    // 获取封禁记录信息用于日志
    const banInfo = await db.collection('ipBan').doc(id).get();
    
    const result = await db.collection('ipBan').doc(id).remove();
    
    // 记录操作日志
    if (banInfo.data) {
      await recordIPOperation('delete', banInfo.data.ip, '解除封禁', operatorIP, context);
    }
    
    return {
      success: true,
      message: 'IP封禁删除成功',
      data: result
    };
  } catch (error) {
    console.error('删除IP封禁错误:', error);
    return {
      success: false,
      message: 'IP封禁删除失败',
      error: error.message
    };
  }
}

/**
 * 记录IP操作日志
 */
async function recordIPOperation(operation, ip, reason, operatorIP, context) {
  try {
    await db.collection('ip_operation_logs').add({
      operation: operation, // add, delete, clear
      targetIP: ip,
      reason: reason,
      operatorIP: operatorIP,
      userAgent: context.CLIENTUA || 'unknown',
      operationTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('记录IP操作日志失败:', error);
  }
}

/**
 * 添加非法访问记录
 */
async function addIllegalAccess(data, ipInfo) {
  try {
    const { ip, filePath, accessTime, userAgent, location, status } = data;
    
    if (!ip || !filePath) {
      return {
        success: false,
        message: 'IP地址和文件路径不能为空'
      };
    }
    
    // 检查是否已经存在相同的记录（避免重复记录）
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    const existingRecord = await db.collection('illegalAccess')
      .where({
        ip: ip,
        filePath: filePath,
        accessTime: db.command.gte(oneMinuteAgo.toISOString())
      })
      .get();
    
    if (existingRecord.data.length > 0) {
      console.log(`IP ${ip} 的相同非法访问记录已存在，跳过重复记录`);
      return {
        success: true,
        message: '记录已存在，跳过重复记录'
      };
    }
    
    // 构建非法访问记录数据，匹配数据表结构
    const illegalAccessData = {
      ip: ip,
      filePath: filePath,
      accessTime: accessTime || new Date().toISOString(),
      userAgent: userAgent || 'unknown',
      location: location || '未知',
      status: status !== undefined ? status : 1
    };
    
    // 添加非法访问记录
    const result = await db.collection('illegalAccess').add(illegalAccessData);
    
    console.log(`已记录IP ${ip} 的非法访问: ${filePath}`);
    
    return {
      success: true,
      message: '非法访问记录添加成功',
      data: result
    };
  } catch (error) {
    console.error('添加非法访问记录错误:', error);
    return {
      success: false,
      message: '添加非法访问记录失败',
      error: error.message
    };
  }
}

/**
 * 获取非法访问记录
 */
async function getIllegalAccess(data) {
  try {
    const { page = 1, limit = 100 } = data || {};
    
    const result = await db.collection('illegalAccess')
      .orderBy('accessTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get();
    
    const total = await db.collection('illegalAccess').count();
    
    return {
      success: true,
      message: '获取非法访问记录成功',
      data: {
        list: result.data,
        total: total.total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total.total / limit)
      }
    };
  } catch (error) {
    console.error('获取非法访问记录错误:', error);
    return {
      success: false,
      message: '获取非法访问记录失败',
      error: error.message
    };
  }
}

/**
 * 清空非法访问记录
 */
async function clearIllegalAccess(data, context, ipInfo) {
  try {
    const { days = 30 } = data || {};
    // 优先使用前端传递的IP信息
    const operatorIP = ipInfo?.ip || context.CLIENTIP || 'unknown';
    
    // 删除指定天数之前的记录
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await db.collection('illegalAccess')
      .where({
        accessTime: db.command.lt(cutoffDate.toISOString())
      })
      .remove();
    
    // 记录操作日志
    await recordIPOperation('clear', 'batch', `清空${days}天前的非法访问记录`, operatorIP, context);
    
    return {
      success: true,
      message: `清空${days}天前的非法访问记录成功`,
      data: {
        deleted: result.deleted
      }
    };
  } catch (error) {
    console.error('清空非法访问记录错误:', error);
    return {
      success: false,
      message: '清空非法访问记录失败',
      error: error.message
    };
  }
}

/**
 * 检查IP是否被封禁
 */
async function checkIpBan(data) {
  try {
    const { ip } = data;
    
    if (!ip) {
      return {
        success: false,
        message: 'IP地址不能为空'
      };
    }
    
    // 先清理过期的封禁记录
    await cleanExpiredBans();
    
    const result = await db.collection('ipBan')
      .where({
        ip: ip,
        status: 1
      })
      .get();
    
    let isBanned = false;
    let banInfo = null;
    
    if (result.data.length > 0) {
      const ban = result.data[0];
      
      // 检查是否过期
      if (ban.expireTime) {
        const now = new Date();
        const expireTime = new Date(ban.expireTime);
        
        if (now > expireTime) {
          // 封禁已过期，更新状态
          await db.collection('ipBan').doc(ban._id).update({
            status: 0,
            expiredTime: now.toISOString()
          });
          isBanned = false;
        } else {
          isBanned = true;
          banInfo = ban;
        }
      } else {
        // 永久封禁
        isBanned = true;
        banInfo = ban;
      }
    }
    
    return {
      success: true,
      message: '检查IP封禁状态成功',
      allowed: !isBanned,  // 添加 allowed 字段，与 isBanned 相反
      data: {
        isBanned: isBanned,
        banInfo: banInfo
      }
    };
  } catch (error) {
    console.error('检查IP封禁状态错误:', error);
    return {
      success: false,
      message: '检查IP封禁状态失败',
      error: error.message
    };
  }
}

/**
 * 清理过期的封禁记录
 */
async function cleanExpiredBans() {
  try {
    const now = new Date().toISOString();
    
    // 查找已过期但状态仍为1的记录
    const expiredBans = await db.collection('ipBan')
      .where({
        status: 1,
        expireTime: db.command.lt(now)
      })
      .get();
    
    // 批量更新过期记录的状态
    const updatePromises = expiredBans.data.map(ban => 
      db.collection('ipBan').doc(ban._id).update({
        status: 0,
        expiredTime: now
      })
    );
    
    await Promise.all(updatePromises);
    
    return expiredBans.data.length;
  } catch (error) {
    console.error('清理过期封禁记录失败:', error);
    return 0;
  }
}


/**
 * 获取IP统计信息
 */
async function getIpStats() {
  try {
    const [banCount, illegalCount] = await Promise.all([
      db.collection('ipBan').where({ status: 1 }).count(),
      db.collection('illegalAccess').count()
    ]);
    
    // 获取今日非法访问数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIllegalCount = await db.collection('illegalAccess')
      .where({
        accessTime: db.command.gte(today.toISOString())
      })
      .count();
    
    return {
      success: true,
      message: '获取IP统计信息成功',
      data: {
        totalBanned: banCount.total,
        totalIllegal: illegalCount.total,
        todayIllegal: todayIllegalCount.total
      }
    };
  } catch (error) {
    console.error('获取IP统计信息错误:', error);
    return {
      success: false,
      message: '获取IP统计信息失败',
      error: error.message
    };
  }
}