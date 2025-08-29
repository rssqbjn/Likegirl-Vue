const tcb = require('@cloudbase/node-sdk');
const config = require('./config');
const crypto = require('crypto');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * 设置管理云函数
 */
exports.main = async (event, context) => {
  const { action, data, token, ipInfo } = event;
  
  try {
    // 对于写操作需要验证管理员权限
    const writeActions = ['updateSettings', 'updateDiySettings', 'updateLeaveSettings', 'updateUserSettings'];
    if (writeActions.includes(action)) {
      const authResult = await verifyAdminToken(token, ipInfo);
      if (!authResult.success) {
        return authResult;
      }
    }
    
    switch (action) {
      case 'getSettings':
        return await getSettings(data);
      case 'updateSettings':
        return await updateSettings(event);
      case 'getDiySettings':
        return await getDiySettings();
      case 'updateDiySettings':
        return await updateDiySettings(event);
      case 'getLeaveSettings':
        return await getLeaveSettings();
      case 'updateLeaveSettings':
        return await updateLeaveSettings(event);
      case 'updateUserSettings':
        return await updateUserSettings(event);
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('设置管理云函数错误:', error);
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
 * 获取基础设置
 */
async function getSettings(data) {
  try {
    const { type } = data || {};
    
    if (type) {
      // 获取特定类型的设置
      const result = await db.collection(type).get();
      
      return {
        success: true,
        message: '获取设置成功',
        data: result.data
      };
    } else {
      // 获取所有基础设置
      const [textResult, loginResult, aboutResult] = await Promise.all([
        db.collection('text').get(),
        db.collection('login').get(),
        db.collection('about').get()
      ]);
      
      return {
        success: true,
        message: '获取设置成功',
        data: {
          text: textResult.data[0] || {},
          login: loginResult.data[0] || {},
          about: aboutResult.data[0] || {}
        }
      };
    }
  } catch (error) {
    console.error('获取设置错误:', error);
    return {
      success: false,
      message: '获取设置失败',
      error: error.message
    };
  }
}

/**
 * 更新基础设置
 */
async function updateSettings(data) {
  try {
    const { type, settings } = data || {};
    
    if (!type || !settings) {
      return {
        success: false,
        message: '缺少必要参数'
      };
    }
    
    // 检查集合是否存在数据
    const existingData = await db.collection(type).get();
    
    let result;
    if (existingData.data.length > 0) {
      // 更新现有数据
      result = await db.collection(type)
        .doc(existingData.data[0]._id)
        .update(settings);
    } else {
      // 创建新数据
      result = await db.collection(type).add(settings);
    }
    
    return {
      success: true,
      message: '设置更新成功',
      data: result
    };
  } catch (error) {
    console.error('更新设置错误:', error);
    return {
      success: false,
      message: '设置更新失败',
      error: error.message
    };
  }
}

/**
 * 获取自定义设置
 */
async function getDiySettings() {
  try {
    const result = await db.collection('diySet').get();
    
    return {
      success: true,
      message: '获取自定义设置成功',
      data: result.data[0] || {}
    };
  } catch (error) {
    console.error('获取自定义设置错误:', error);
    return {
      success: false,
      message: '获取自定义设置失败',
      error: error.message
    };
  }
}

/**
 * 更新自定义设置
 */
async function updateDiySettings(event) {
  try {
    const { settings } = event || {};
    
    if (!settings) {
      return {
        success: false,
        message: '缺少设置数据'
      };
    }
    
    // 检查是否存在数据
    const existingData = await db.collection('diySet').get();
    
    let result;
    if (existingData.data.length > 0) {
      // 更新现有数据
      result = await db.collection('diySet')
        .doc(existingData.data[0]._id)
        .update(settings);
    } else {
      // 创建新数据
      result = await db.collection('diySet').add(settings);
    }
    
    return {
      success: true,
      message: '自定义设置更新成功',
      data: result
    };
  } catch (error) {
    console.error('更新自定义设置错误:', error);
    return {
      success: false,
      message: '自定义设置更新失败',
      error: error.message
    };
  }
}

/**
 * 获取留言设置
 */
async function getLeaveSettings() {
  try {
    const result = await db.collection('leavSet').get();
    
    return {
      success: true,
      message: '获取留言设置成功',
      data: result.data[0] || {}
    };
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
async function updateLeaveSettings(event) {
  try {
    const { settings } = event || {};
    
    if (!settings) {
      return {
        success: false,
        message: '缺少设置数据'
      };
    }
    
    // 检查是否存在数据
    const existingData = await db.collection('leavSet').get();
    
    let result;
    if (existingData.data.length > 0) {
      // 更新现有数据
      result = await db.collection('leavSet')
        .doc(existingData.data[0]._id)
        .update(settings);
    } else {
      // 创建新数据
      result = await db.collection('leavSet').add(settings);
    }
    
    return {
      success: true,
      message: '留言设置更新成功',
      data: result
    };
  } catch (error) {
    console.error('更新留言设置错误:', error);
    return {
      success: false,
      message: '留言设置更新失败',
      error: error.message
    };
  }
}

/**
 * 更新用户设置（综合更新text、login、diySet表）
 */
async function updateUserSettings(event) {
  try {
    const { data } = event;
    
    if (!data) {
      return {
        success: false,
        message: '缺少设置数据'
      };
    }
    
    const { 
      userName, userQQ, animation,
      cssCon, headCon, footerCon,
      adminName, password,
      securityCode
    } = data;
    
    // 从配置文件读取安全码
    const expectedSecurityCode = config.SECURITY_CODE;
    if (securityCode !== expectedSecurityCode) {
      return {
        success: false,
        message: '安全码错误',
        statusCode: '7'
      };
    }
    
    const results = [];
    let statusCode = '';
    
    // 更新text表（基本信息）
    try {
      const textData = {
        userName: userName || '',
        userQQ: userQQ || '',
        Animation: animation || '1'
      };
      
      const existingText = await db.collection('text').get();
      if (existingText.data.length > 0) {
        await db.collection('text')
          .doc(existingText.data[0]._id)
          .update(textData);
      } else {
        await db.collection('text').add(textData);
      }
      
      results.push({ table: 'text', success: true });
      statusCode += '3';
    } catch (error) {
      console.error('更新text表失败:', error);
      results.push({ table: 'text', success: false, error: error.message });
      statusCode += '4';
    }
    
    // 更新diySet表（自定义设置）
    try {
      const diyData = {
        cssCon: cssCon || '',
        headCon: headCon || '',
        footerCon: footerCon || ''
      };
      
      const existingDiy = await db.collection('diySet').get();
      if (existingDiy.data.length > 0) {
        await db.collection('diySet')
          .doc(existingDiy.data[0]._id)
          .update(diyData);
      } else {
        await db.collection('diySet').add(diyData);
      }
      
      results.push({ table: 'diySet', success: true });
      statusCode += '5';
    } catch (error) {
      console.error('更新diySet表失败:', error);
      results.push({ table: 'diySet', success: false, error: error.message });
      statusCode += '6';
    }
    
    // 更新login表（登录信息）
    try {
      const loginData = {
        user: adminName || 'admin'
      };
      
      // 如果提供了密码，则更新密码
      if (password && password.trim()) {
        loginData.pw = crypto.createHash('md5').update(password).digest('hex');
      }
      
      const existingLogin = await db.collection('login').get();
      if (existingLogin.data.length > 0) {
        await db.collection('login')
          .doc(existingLogin.data[0]._id)
          .update(loginData);
      } else {
        await db.collection('login').add(loginData);
      }
      
      results.push({ table: 'login', success: true });
      statusCode += '1';
    } catch (error) {
      console.error('更新login表失败:', error);
      results.push({ table: 'login', success: false, error: error.message });
      statusCode += '0';
    }
    
    return {
      success: true,
      message: '用户设置更新完成',
      statusCode: statusCode,
      data: {
        results: results,
        updatedTables: results.filter(r => r.success).map(r => r.table),
        failedTables: results.filter(r => !r.success).map(r => r.table)
      }
    };
    
  } catch (error) {
    console.error('更新用户设置错误:', error);
    return {
      success: false,
      message: '用户设置更新失败',
      error: error.message
    };
  }
}