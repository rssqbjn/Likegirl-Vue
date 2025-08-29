const tcb = require('@cloudbase/node-sdk');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * 管理员云函数
 * 对应原PHP项目的后台管理功能
 */
exports.main = async (event, context) => {
  const { action, data, token, ipInfo } = event;
  
  try {
    // 验证管理员权限（除了登录操作外都需要验证）
    if (action !== 'login') {
      const authResult = await verifyAdminToken(token, ipInfo);
      if (!authResult.success) {
        return authResult;
      }
    }
    
    switch (action) {
      case 'login':
        return await adminLogin(data, ipInfo);
      case 'getDashboard':
        return await getDashboard();
      case 'getStatistics':
        return await getStatistics();
      case 'manageLeavings':
        return await manageLeavings(data);
      case 'manageImages':
        return await manageImages(data);
      case 'manageLovelist':
        return await manageLovelist(data);
      case 'getSystemInfo':
        return await getSystemInfo();
      case 'clearCache':
        return await clearCache();
      case 'backupData':
        return await backupData();
      case 'restoreData':
        return await restoreData(data);
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('管理员云函数错误:', error);
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
 * 管理员登录
 */
async function adminLogin(data, ipInfo) {
  try {
    // 调用auth云函数进行登录，传递IP信息
    const authResult = await app.callFunction({
      name: 'auth',
      data: {
        action: 'adminLogin',
        data: data,
        ipInfo: ipInfo
      }
    });

    return authResult.result;
  } catch (error) {
    console.error('管理员登录错误:', error);
    return {
      success: false,
      message: '登录失败',
      error: error.message
    };
  }
}

/**
 * 获取仪表板数据
 */
async function getDashboard() {
  try {
    const [
      leavingsResult,
      imagesResult,
      lovelistResult,
      articlesResult
    ] = await Promise.all([
      db.collection('leaving').count(),
      db.collection('loveImg').count(),
      db.collection('lovelist').count(),
      db.collection('article').count()
    ]);

    // 获取最近的留言
    const recentLeavings = await db.collection('leaving')
      .orderBy('createTime', 'desc')
      .limit(5)
      .get();

    // 获取最近的相册
    const recentImages = await db.collection('loveImg')
      .orderBy('imgDatd', 'desc')
      .limit(5)
      .get();

    return {
      success: true,
      message: '获取仪表板数据成功',
      data: {
        statistics: {
          totalUsers: usersResult.total,
          totalLeavings: leavingsResult.total,
          totalImages: imagesResult.total,
          totalLovelist: lovelistResult.total,
          totalArticles: articlesResult.total
        },
        recentLeavings: recentLeavings.data,
        recentImages: recentImages.data,
        lastUpdate: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('获取仪表板数据错误:', error);
    return {
      success: false,
      message: '获取仪表板数据失败',
      error: error.message
    };
  }
}

/**
 * 获取统计数据
 */
async function getStatistics() {
  try {
    // 获取各种统计数据
    const [
      totalLeavings,
      totalImages,
      totalLovelist,
      completedLovelist
    ] = await Promise.all([
      db.collection('leaving').count(),
      db.collection('loveImg').count(),
      db.collection('lovelist').count(),
      db.collection('lovelist').where({ icon: 1 }).count()
    ]);

    // 计算完成率
    const completionRate = totalLovelist.total > 0 
      ? Math.round((completedLovelist.total / totalLovelist.total) * 100)
      : 0;

    // 获取每月留言统计
    const monthlyLeavings = await getMonthlyStatistics('leaving', 'createTime');
    
    // 获取每月相册统计
    const monthlyImages = await getMonthlyStatistics('loveImg', 'imgDatd');

    return {
      success: true,
      message: '获取统计数据成功',
      data: {
        overview: {
          totalUsers: totalUsers.total,
          totalLeavings: totalLeavings.total,
          totalImages: totalImages.total,
          totalLovelist: totalLovelist.total,
          completedLovelist: completedLovelist.total,
          completionRate: completionRate
        },
        monthlyData: {
          leavings: monthlyLeavings,
          images: monthlyImages
        },
        updateTime: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return {
      success: false,
      message: '获取统计数据失败',
      error: error.message
    };
  }
}

/**
 * 获取月度统计数据
 */
async function getMonthlyStatistics(collection, dateField) {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const result = await db.collection(collection)
      .where({
        [dateField]: db.command.gte(sixMonthsAgo.toISOString().split('T')[0])
      })
      .get();

    // 按月份分组统计
    const monthlyStats = {};
    result.data.forEach(item => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
    });

    // 填充缺失的月份
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        month: monthKey,
        count: monthlyStats[monthKey] || 0
      });
    }

    return months;
  } catch (error) {
    console.error('获取月度统计错误:', error);
    return [];
  }
}

/**
 * 管理留言
 */
async function manageLeavings(data) {
  try {
    const { operation, leavingId, leavingData, page = 1, limit = 20 } = data;

    switch (operation) {
      case 'list':
        const skip = (page - 1) * limit;
        const leavings = await db.collection('leaving')
          .orderBy('createTime', 'desc')
          .skip(skip)
          .limit(limit)
          .get();
        
        const total = await db.collection('leaving').count();
        
        return {
          success: true,
          message: '获取留言列表成功',
          data: {
            list: leavings.data,
            total: total.total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total.total / limit)
          }
        };

      case 'approve':
        if (!leavingId) {
          return {
            success: false,
            message: '缺少留言ID'
          };
        }
        
        const approveResult = await db.collection('leaving')
          .doc(leavingId)
          .update({
            status: 'approved',
            approveTime: new Date().toISOString()
          });
        
        return {
          success: true,
          message: '留言审核通过',
          data: approveResult
        };

      case 'reject':
        if (!leavingId) {
          return {
            success: false,
            message: '缺少留言ID'
          };
        }
        
        const rejectResult = await db.collection('leaving')
          .doc(leavingId)
          .update({
            status: 'rejected',
            rejectTime: new Date().toISOString()
          });
        
        return {
          success: true,
          message: '留言已拒绝',
          data: rejectResult
        };

      case 'delete':
        if (!leavingId) {
          return {
            success: false,
            message: '缺少留言ID'
          };
        }
        
        const deleteResult = await db.collection('leaving')
          .doc(leavingId)
          .remove();
        
        return {
          success: true,
          message: '留言删除成功',
          data: deleteResult
        };

      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('管理留言错误:', error);
    return {
      success: false,
      message: '管理留言失败',
      error: error.message
    };
  }
}

/**
 * 管理相册
 */
async function manageImages(data) {
  try {
    const { operation, imageId, imageData, page = 1, limit = 20 } = data;

    switch (operation) {
      case 'list':
        const skip = (page - 1) * limit;
        const images = await db.collection('loveImg')
          .orderBy('imgDatd', 'desc')
          .skip(skip)
          .limit(limit)
          .get();
        
        const total = await db.collection('loveImg').count();
        
        return {
          success: true,
          message: '获取相册列表成功',
          data: {
            list: images.data,
            total: total.total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total.total / limit)
          }
        };

      case 'update':
        if (!imageId || !imageData) {
          return {
            success: false,
            message: '缺少必要参数'
          };
        }
        
        const updateResult = await db.collection('loveImg')
          .doc(imageId)
          .update(imageData);
        
        return {
          success: true,
          message: '相册更新成功',
          data: updateResult
        };

      case 'delete':
        if (!imageId) {
          return {
            success: false,
            message: '缺少相册ID'
          };
        }
        
        const deleteResult = await db.collection('loveImg')
          .doc(imageId)
          .remove();
        
        return {
          success: true,
          message: '相册删除成功',
          data: deleteResult
        };

      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('管理相册错误:', error);
    return {
      success: false,
      message: '管理相册失败',
      error: error.message
    };
  }
}

/**
 * 管理恋爱列表
 */
async function manageLovelist(data) {
  try {
    const { operation, itemId, itemData } = data;

    switch (operation) {
      case 'list':
        const lovelist = await db.collection('lovelist')
          .orderBy('id', 'asc')
          .get();
        
        return {
          success: true,
          message: '获取恋爱列表成功',
          data: lovelist.data
        };

      case 'update':
        if (!itemId || !itemData) {
          return {
            success: false,
            message: '缺少必要参数'
          };
        }
        
        const updateResult = await db.collection('lovelist')
          .doc(itemId)
          .update(itemData);
        
        return {
          success: true,
          message: '恋爱列表更新成功',
          data: updateResult
        };

      case 'toggle':
        if (!itemId) {
          return {
            success: false,
            message: '缺少项目ID'
          };
        }
        
        // 获取当前状态
        const currentItem = await db.collection('lovelist')
          .doc(itemId)
          .get();
        
        if (!currentItem.data.length) {
          return {
            success: false,
            message: '项目不存在'
          };
        }
        
        const newIcon = currentItem.data[0].icon === 1 ? 0 : 1;
        const toggleResult = await db.collection('lovelist')
          .doc(itemId)
          .update({
            icon: newIcon,
            updateTime: new Date().toISOString()
          });
        
        return {
          success: true,
          message: '状态切换成功',
          data: {
            ...toggleResult,
            newIcon: newIcon
          }
        };

      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('管理恋爱列表错误:', error);
    return {
      success: false,
      message: '管理恋爱列表失败',
      error: error.message
    };
  }
}

/**
 * 获取系统信息
 */
async function getSystemInfo() {
  try {
    const systemInfo = {
      version: '5.2.0',
      environment: process.env.TCB_ENV || 'unknown',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      message: '获取系统信息成功',
      data: systemInfo
    };
  } catch (error) {
    console.error('获取系统信息错误:', error);
    return {
      success: false,
      message: '获取系统信息失败',
      error: error.message
    };
  }
}

/**
 * 清除缓存
 */
async function clearCache() {
  try {
    // 这里可以实现具体的缓存清除逻辑
    // 目前只是模拟操作
    
    return {
      success: true,
      message: '缓存清除成功',
      data: {
        clearedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('清除缓存错误:', error);
    return {
      success: false,
      message: '清除缓存失败',
      error: error.message
    };
  }
}

/**
 * 备份数据
 */
async function backupData() {
  try {
    const collections = ['users', 'leaving', 'loveImg', 'lovelist', 'article', 'text', 'login', 'about', 'diySet', 'leavSet'];
    const backupData = {};

    for (const collection of collections) {
      try {
        const result = await db.collection(collection).get();
        backupData[collection] = result.data;
      } catch (error) {
        console.warn(`备份集合 ${collection} 失败:`, error.message);
        backupData[collection] = [];
      }
    }

    const backup = {
      version: '5.2.0',
      timestamp: new Date().toISOString(),
      data: backupData
    };

    return {
      success: true,
      message: '数据备份成功',
      data: backup
    };
  } catch (error) {
    console.error('备份数据错误:', error);
    return {
      success: false,
      message: '数据备份失败',
      error: error.message
    };
  }
}

/**
 * 恢复数据
 */
async function restoreData(data) {
  try {
    const { backupData } = data;

    if (!backupData || !backupData.data) {
      return {
        success: false,
        message: '无效的备份数据'
      };
    }

    const results = [];
    
    for (const [collection, items] of Object.entries(backupData.data)) {
      try {
        // 清空现有数据
        const existingData = await db.collection(collection).get();
        for (const item of existingData.data) {
          await db.collection(collection).doc(item._id).remove();
        }

        // 恢复数据
        for (const item of items) {
          delete item._id; // 删除原有ID，让数据库生成新ID
          await db.collection(collection).add(item);
        }

        results.push({
          collection: collection,
          success: true,
          count: items.length
        });
      } catch (error) {
        results.push({
          collection: collection,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    return {
      success: true,
      message: `数据恢复完成，成功${successCount}个集合，失败${failCount}个集合`,
      data: {
        results: results,
        successCount: successCount,
        failCount: failCount
      }
    };
  } catch (error) {
    console.error('恢复数据错误:', error);
    return {
      success: false,
      message: '数据恢复失败',
      error: error.message
    };
  }
}