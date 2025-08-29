const tcb = require('@cloudbase/node-sdk')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
})

const db = app.database()

// JWT密钥
const JWT_SECRET = 'your-suproduction'
const JWT_EXPIRES_IN = '24h' // token过期时间

/**
 * 管理员认证云函数
 */
exports.main = async (event, context) => {
  const { action, data, ipInfo } = event
  
  try {
    switch (action) {
      case 'adminLogin':
        return await adminLogin(data, context, ipInfo)
      case 'verifyToken':
        return await verifyToken(data, context, ipInfo)
      default:
        return {
          success: false,
          message: '未知操作类型'
        }
    }
  } catch (error) {
    console.error('认证操作失败:', error)
    return {
      success: false,
      message: '操作失败',
      error: error.message
    }
  }
}

/**
 * 管理员登录
 */
async function adminLogin(data, context, ipInfo) {
  try {
    const { username, password } = data
    
    // 优先使用前端传递的IP信息，如果没有则尝试从context获取
    const clientIP = ipInfo?.ip || getClientIP(context)
    
    // 添加调试信息，显示当前IP和来源信息
    console.log('登录尝试 - 用户名:', username, '客户端IP:', clientIP)
    console.log('IP信息来源:', ipInfo ? '前端传递' : 'context获取')
    if (ipInfo) {
      console.log('前端传递的IP详情:', ipInfo)
    }
    
    if (!username || !password) {
      return {
        success: false,
        message: '用户名和密码不能为空'
      }
    }
    
    // 如果IP是unknown，跳过IP封禁检查（开发环境兼容）
    if (clientIP !== 'unknown') {
      // 检查IP是否被封禁
      const ipBanCheck = await checkIPBan(clientIP)
      if (!ipBanCheck.allowed) {
        return {
          success: false,
          message: `您的IP(${clientIP})已被封禁，无法登录`,
          code: 403,
          clientIP: clientIP  // 返回IP信息供前端显示
        }
      }
    } else {
      console.log('IP获取失败，跳过IP封禁检查（开发环境兼容）')
    }
    
    // 检查登录频率限制
    const rateLimitCheck = await checkLoginRateLimit(clientIP)
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: '登录尝试过于频繁，请稍后再试',
        code: 429
      }
    }
    
    // 从login表中获取管理员账号信息
    const loginResult = await db.collection('login').where({
      user: username
    }).get()
    
    if (!loginResult.data || loginResult.data.length === 0) {
      // 记录失败的登录尝试
      await recordFailedLogin(username, clientIP, context)
      
      return {
        success: false,
        message: '用户名或密码错误'
      }
    }
    
    const adminData = loginResult.data[0]
    
    // 使用MD5验证密码
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex')
    
    // 验证密码
    if (hashedPassword !== adminData.pw) {
      // 记录失败的登录尝试
      await recordFailedLogin(username, clientIP, context)
      
      return {
        success: false,
        message: '用户名或密码错误'
      }
    }

    const token = generateToken(username)
    
    // 记录成功的登录日志
    await recordLoginLog(username, context, ipInfo)
    
    return {
      success: true,
      message: '登录成功',
      token: token,
      userInfo: {
        username: adminData.user,
        name: '管理员',
        qq: '123456789',
        loginTime: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('管理员登录失败:', error)
    return {
      success: false,
      message: '登录失败，请稍后重试'
    }
  }
}

/**
 * 验证token
 */
async function verifyToken(data, context, ipInfo) {
  try {
    const { token } = data
    // 优先使用前端传递的IP信息，如果没有则尝试从context获取
    const clientIP = ipInfo?.ip || getClientIP(context)
    
    if (!token) {
      // 记录token验证失败
      await recordTokenVerifyFailure(clientIP, 'Token不能为空', context, ipInfo)
      return {
        success: false,
        message: 'Token不能为空'
      }
    }
    
    const decoded = decodeToken(token)
    
    if (!decoded || !decoded.username) {
      // 记录token验证失败
      await recordTokenVerifyFailure(clientIP, 'Token无效', context, ipInfo)
      return {
        success: false,
        message: 'Token无效'
      }
    }
    
    return {
      success: true,
      message: 'Token有效',
      userInfo: {
        username: decoded.username,
        name: '管理员',
        qq: '123456789'
      }
    }
    
  } catch (error) {
    console.error('Token验证失败:', error)
    const clientIP = ipInfo?.ip || getClientIP(context)
    // 记录token验证失败
    await recordTokenVerifyFailure(clientIP, 'Token验证异常', context, ipInfo)
    return {
      success: false,
      message: 'Token验证失败'
    }
  }
}


/**
 * 检查IP封禁状态（调用ipManage云函数）
 */
async function checkIPBan(ip) {
  try {
    const result = await app.callFunction({
      name: 'ipManage',
      data: {
        action: 'checkIpBan',
        data: { ip }
      }
    });

    return result.result;
  } catch (error) {
    console.error('检查IP封禁失败:', error);
    return { allowed: true }; // 出错时允许访问
  }
}

/**
 * 检查登录频率限制
 */
async function checkLoginRateLimit(ip) {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // 查询5分钟内的登录尝试次数
    const result = await db.collection('login_attempts')
      .where({
        ip: ip,
        attemptTime: db.command.gte(fiveMinutesAgo)
      })
      .count();
    
    const maxAttempts = 5; // 5分钟内最多5次尝试
    
    if (result.total >= maxAttempts) {
      return { 
        allowed: false, 
        message: `5分钟内登录尝试次数过多，已达到${maxAttempts}次限制` 
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('检查登录频率限制失败:', error);
    return { allowed: true };
  }
}

/**
 * 记录失败的登录尝试
 */
async function recordFailedLogin(username, ip, context) {
  try {
    await db.collection('login_attempts').add({
      data: {
        username: username,
        ip: ip,
        success: false,
        attemptTime: new Date(),
        userAgent: context.CLIENTUA || 'unknown'
      }
    });
  } catch (error) {
    console.error('记录失败登录尝试失败:', error);
  }
}

/**
 * 记录登录日志
 */
async function recordLoginLog(username, context, ipInfo) {
  try {
    const logData = {
      action: 'login',
      username,
      operateTime: new Date(),
      ip: ipInfo?.ip || context.CLIENTIP || 'unknown',
      userAgent: context.CLIENTUA || 'unknown'
    }
    
    // 如果有更详细的IP信息，也记录下来
    if (ipInfo) {
      logData.ipDetails = {
        location: ipInfo.location || '未知',
        country: ipInfo.country || '未知',
        region: ipInfo.region || '未知',
        city: ipInfo.city || '未知'
      }
    }
    
    await db.collection('admin_logs').add({
      data: logData
    })
  } catch (error) {
    console.error('记录登录日志失败:', error)
  }
}

/**
 * 生成JWT token
 */
function generateToken(username) {
  const payload = {
    username,
    iat: Math.floor(Date.now() / 1000), // 签发时间
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * 获取客户端IP地址
 */
function getClientIP(context) {
  // 尝试多种方式获取IP
  const possibleIPs = [
    context.CLIENTIP,
    context.clientIP,
    context.CLIENT_IP,
    context.remoteAddress,
    context.ip
  ];
  
  for (const ip of possibleIPs) {
    if (ip && ip !== 'unknown' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  
  // 如果都获取不到，返回unknown
  return 'unknown';
}

/**
 * 记录Token验证失败
 */
async function recordTokenVerifyFailure(ip, reason, context, ipInfo) {
  try {
    console.log(`=== 开始记录Token验证失败 ===`)
    console.log(`IP: ${ip}, Reason: ${reason}`)
    console.log(`IP类型: ${typeof ip}, IP值: "${ip}"`)
    console.log(`ipInfo:`, ipInfo)
    
    if (!ip || ip === 'unknown') {
      console.log(`跳过记录：IP为空或unknown (ip="${ip}")`)
      return // 无法获取IP时不记录
    }

    // 记录本次失败
    const failureData = {
      ip: ip,
      reason: reason,
      failureTime: new Date(),
      userAgent: context.CLIENTUA || 'unknown'
    }
    
    // 如果有更详细的IP信息，也记录下来
    if (ipInfo) {
      failureData.ipDetails = {
        location: ipInfo.location || '未知',
        country: ipInfo.country || '未知',
        region: ipInfo.region || '未知',
        city: ipInfo.city || '未知'
      }
    }
    
    console.log(`准备保存的失败数据:`, failureData)
    
    const addResult = await db.collection('token_verify_failures').add({
      data: failureData
    })
    
    console.log(`Token验证失败记录保存成功，ID: ${addResult.id}`)

    // 检查是否需要记录为非法访问
    await checkAndRecordIllegalAccess(ip, context, ipInfo)

  } catch (error) {
    console.error('记录Token验证失败错误:', error)
    console.error('错误详情:', error.message)
    console.error('错误堆栈:', error.stack)
  }
}

/**
 * 检查并记录非法访问
 */
async function checkAndRecordIllegalAccess(ip, context, ipInfo) {
  try {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000) // 5分钟前

    console.log(`=== 开始检查IP ${ip} 的失败记录 ===`)
    console.log(`当前时间: ${now.toISOString()} (${now.toString()})`)
    console.log(`5分钟前: ${fiveMinutesAgo.toISOString()} (${fiveMinutesAgo.toString()})`)
    console.log(`查询时间范围: ${fiveMinutesAgo.toISOString()} 到 ${now.toISOString()}`)

    // 先查询所有该IP的记录（不限时间）
    const allRecords = await db.collection('token_verify_failures')
      .where(db.command.or([
        { 'data.ip': ip },
        { 'data.ipDetails.ip': ip }
      ]))
      .get()
    
    console.log(`IP ${ip} 的所有失败记录数量: ${allRecords.data.length}`)
    if (allRecords.data.length > 0) {
      console.log('最近3条记录详情:')
      allRecords.data.slice(0, 3).forEach((record, index) => {
        try {
          const recordTime = new Date(record.data.failureTime)
          const timeDiff = now.getTime() - recordTime.getTime()
          const minutesDiff = Math.floor(timeDiff / (1000 * 60))
          
          console.log(`记录${index + 1}:`, {
            _id: record._id,
            ip: record.data.ip,
            ipDetailsIp: record.data.ipDetails?.ip,
            failureTime: record.data.failureTime,
            failureTimeISO: recordTime.toISOString(),
            reason: record.data.reason,
            timeDiffMs: timeDiff,
            minutesDiff: minutesDiff,
            isWithin5Min: timeDiff <= 5 * 60 * 1000
          })
        } catch (timeError) {
          console.log(`记录${index + 1} 时间处理错误:`, {
            _id: record._id,
            ip: record.data.ip,
            failureTime: record.data.failureTime,
            error: timeError.message
          })
        }
      })
    }

    // 查询5分钟内该IP的token验证失败次数
    // 修正查询路径：数据存储在data字段下
    const failureCount = await db.collection('token_verify_failures')
      .where(db.command.or([
        {
          'data.ip': ip,
          'data.failureTime': db.command.gte(fiveMinutesAgo)
        },
        {
          'data.ipDetails.ip': ip,
          'data.failureTime': db.command.gte(fiveMinutesAgo)
        }
      ]))
      .count()

    console.log(`IP ${ip} 在5分钟内token验证失败次数: ${failureCount.total}`)

    // 也获取具体的记录来调试
    const recentFailures = await db.collection('token_verify_failures')
      .where(db.command.or([
        {
          'data.ip': ip,
          'data.failureTime': db.command.gte(fiveMinutesAgo)
        },
        {
          'data.ipDetails.ip': ip,
          'data.failureTime': db.command.gte(fiveMinutesAgo)
        }
      ]))
      .get()

    console.log(`5分钟内的具体失败记录:`)
    recentFailures.data.forEach((record, index) => {
      const recordTime = new Date(record.data.failureTime)
      const timeDiff = now.getTime() - recordTime.getTime()
      console.log(`失败记录${index + 1}:`, {
        _id: record._id,
        ip: record.data.ip,
        ipDetailsIp: record.data.ipDetails?.ip,
        failureTime: record.data.failureTime,
        reason: record.data.reason,
        timeDiff: timeDiff,
        minutesDiff: Math.floor(timeDiff / (1000 * 60))
      })
    })

    // 如果失败次数达到5次，记录为非法访问
    if (failureCount.total >= 5) {
      console.log(`IP ${ip} 达到非法访问阈值，开始记录`)
      
      // 构建非法访问数据，匹配数据表结构
      const illegalAccessData = {
        ip: ip,
        filePath: `/auth/token_verify_failure_${failureCount.total}`,
        accessTime: now.toISOString(),
        userAgent: context.CLIENTUA || 'unknown',
        location: ipInfo?.location || '未知',
        status: 1
      }
      
      // 调用ipManage云函数记录非法访问
      await app.callFunction({
        name: 'ipManage',
        data: {
          action: 'addIllegalAccess',
          data: illegalAccessData
        }
      })

      console.log(`已将IP ${ip} 记录到非法访问表`)

      // 检查该IP一天内的非法访问次数，决定是否封禁
      await checkAndBanIPIfNeeded(ip, ipInfo)

      // 清理该IP的失败记录，避免重复记录
      // 修正查询路径：数据存储在data字段下
      await db.collection('token_verify_failures')
        .where(db.command.or([
          {
            'data.ip': ip,
            'data.failureTime': db.command.gte(fiveMinutesAgo)
          },
          {
            'data.ipDetails.ip': ip,
            'data.failureTime': db.command.gte(fiveMinutesAgo)
          }
        ]))
        .remove()
    }

  } catch (error) {
    console.error('检查并记录非法访问失败:', error)
  }
}

/**
 * 检查并封禁IP（如果一天内非法访问超过3次）
 */
async function checkAndBanIPIfNeeded(ip, ipInfo) {
  try {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24小时前

    // 查询该IP一天内的非法访问次数
    // 同时查询 ip 字段和 ipDetails.ip 字段，确保兼容性
    const illegalCount = await db.collection('illegalAccess')
      .where(db.command.or([
        {
          ip: ip,
          accessTime: db.command.gte(oneDayAgo.toISOString())
        },
        {
          'ipDetails.ip': ip,
          accessTime: db.command.gte(oneDayAgo.toISOString())
        }
      ]))
      .count()

    console.log(`IP ${ip} 在24小时内非法访问次数: ${illegalCount.total}`)

    // 如果一天内非法访问超过3次，自动封禁该IP
    if (illegalCount.total >= 3) {
      console.log(`IP ${ip} 一天内非法访问超过3次，开始自动封禁`)
      
      // 检查该IP是否已经被封禁
      const existingBan = await db.collection('ipBan')
        .where({
          ip: ip,
          status: 1
        })
        .get()
      
      if (existingBan.data.length > 0) {
        console.log(`IP ${ip} 已经被封禁，跳过重复封禁`)
        return
      }
      
      // 直接在数据库中添加封禁记录，避免权限问题
      const expireDate = new Date()
      expireDate.setHours(expireDate.getHours() + 24) // 封禁24小时
      
      const banData = {
        ip: ip,
        reason: `一天内非法访问${illegalCount.total}次，系统自动封禁`,
        location: ipInfo?.location || '未知',
        createTime: now.toISOString(),
        expireTime: expireDate.toISOString(),
        operatorIP: 'system', // 标记为系统自动操作
        status: 1 // 1=生效，0=失效
      }
      
      // 直接添加到数据库，绕过权限检查
      const banResult = await db.collection('ipBan').add(banData)
      
      if (banResult.id) {
        console.log(`IP ${ip} 自动封禁成功，封禁ID: ${banResult.id}`)
        
        // 记录操作日志
        try {
          await db.collection('ip_operation_logs').add({
            operation: 'auto_ban', // 标记为自动封禁
            targetIP: ip,
            reason: `一天内非法访问${illegalCount.total}次，系统自动封禁`,
            operatorIP: 'system',
            userAgent: 'auth-function',
            operationTime: now.toISOString()
          })
        } catch (logError) {
          console.error('记录自动封禁日志失败:', logError)
        }
      } else {
        console.error(`IP ${ip} 自动封禁失败: 数据库操作失败`)
      }
    }

  } catch (error) {
    console.error('检查并封禁IP失败:', error)
  }
}

/**
 * 解码并验证JWT token
 */
function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('JWT Token验证成功:', decoded)
    return decoded
  } catch (error) {
    console.error('JWT Token验证失败:', error.message)
    return null
  }
}
