const tcb = require('@cloudbase/node-sdk');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * 恋爱列表云函数
 * 对应原PHP项目的list.php相关功能
 */
exports.main = async (event, context) => {
  const { action, data, page = 1, limit = 20, token, ipInfo } = event;
  
  try {
    // 写操作需要验证管理员权限
    const writeActions = ['addItem', 'updateItem', 'deleteItem', 'toggleStatus'];
    if (writeActions.includes(action)) {
      const authResult = await verifyAdminToken(token, ipInfo);
      if (!authResult.success) {
        return authResult;
      }
    }
    
    switch (action) {
      case 'getList':
        return await getLoveList(page, limit);
      case 'addItem':
        return await addListItem(data);
      case 'updateItem':
        return await updateListItem(data);
      case 'deleteItem':
        return await deleteListItem(data.id);
      case 'toggleStatus':
        return await toggleItemStatus(data.id, data.icon);
      case 'getStats':
        return await getListStats();
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('恋爱列表云函数错误:', error);
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
 * 获取恋爱列表
 * 对应原PHP: list.php的列表展示功能
 */
async function getLoveList(page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    
    // 按ID顺序获取列表（保持原有顺序）
    const result = await db.collection('lovelist')
      .orderBy('id', 'asc')
      .skip(skip)
      .limit(limit)
      .get();
    
    // 获取总数
    const countResult = await db.collection('lovelist').count();
    
    // 处理列表数据
    const listItems = result.data.map(item => ({
      ...item,
      isCompleted: item.icon === 1,
      hasImage: item.imgurl && item.imgurl !== '0',
      fullImageUrl: (item.imgurl && item.imgurl !== '0') 
        ? (item.imgurl.startsWith('http') ? item.imgurl : `https://your-domain.com/${item.imgurl}`)
        : null
    }));
    
    return {
      success: true,
      message: '获取成功',
      data: {
        list: listItems,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  } catch (error) {
    console.error('获取恋爱列表错误:', error);
    return {
      success: false,
      message: '获取恋爱列表失败',
      error: error.message
    };
  }
}

/**
 * 添加列表项
 * 对应原PHP: admin/lovelistAdd.php
 */
async function addListItem(data) {
  try {
    const { eventname, imgurl = '0', icon = 0 } = data;
    
    // 数据验证
    if (!eventname || !eventname.trim()) {
      return {
        success: false,
        message: '请填写事件内容'
      };
    }
    
    // 获取当前最大ID
    const maxIdResult = await db.collection('lovelist')
      .orderBy('id', 'desc')
      .limit(1)
      .get();
    
    let nextId = 1;
    if (maxIdResult.data && maxIdResult.data.length > 0) {
      nextId = maxIdResult.data[0].id + 1;
    }
    
    // 构造列表项数据
    const listItemData = {
      id: nextId,
      eventname: eventname.trim(),
      imgurl: imgurl.trim() || '0',
      icon: parseInt(icon),
      createTime: new Date().toISOString()
    };
    
    // 插入列表项
    const result = await db.collection('lovelist').add(listItemData);
    
    return {
      success: true,
      message: '列表项添加成功',
      data: {
        _id: result.id,
        ...listItemData,
        isCompleted: listItemData.icon === 1,
        hasImage: listItemData.imgurl !== '0'
      }
    };
  } catch (error) {
    console.error('添加列表项错误:', error);
    return {
      success: false,
      message: '列表项添加失败',
      error: error.message
    };
  }
}

/**
 * 更新列表项
 * 对应原PHP: admin/listupda.php
 */
async function updateListItem(data) {
  try {
    const { _id, eventname, imgurl, icon } = data;
    
    if (!_id) {
      return {
        success: false,
        message: '缺少列表项ID'
      };
    }
    
    // 构造更新数据
    const updateData = {
      eventname: eventname.trim(),
      imgurl: imgurl ? imgurl.trim() : '0',
      icon: parseInt(icon),
      updateTime: new Date().toISOString()
    };
    
    // 更新列表项
    await db.collection('lovelist').doc(_id).update(updateData);
    
    return {
      success: true,
      message: '列表项更新成功',
      data: {
        ...updateData,
        isCompleted: updateData.icon === 1,
        hasImage: updateData.imgurl !== '0'
      }
    };
  } catch (error) {
    console.error('更新列表项错误:', error);
    return {
      success: false,
      message: '列表项更新失败',
      error: error.message
    };
  }
}

/**
 * 删除列表项
 * 对应原PHP: admin/dellist.php
 */
async function deleteListItem(itemId) {
  try {
    if (!itemId) {
      return {
        success: false,
        message: '缺少列表项ID'
      };
    }
    
    // 删除列表项
    await db.collection('lovelist').doc(itemId).remove();
    
    return {
      success: true,
      message: '列表项删除成功'
    };
  } catch (error) {
    console.error('删除列表项错误:', error);
    return {
      success: false,
      message: '列表项删除失败',
      error: error.message
    };
  }
}

/**
 * 切换完成状态
 * 对应原PHP项目的状态切换功能
 */
async function toggleItemStatus(itemId, newStatus) {
  try {
    if (!itemId) {
      return {
        success: false,
        message: '缺少列表项ID'
      };
    }
    
    const icon = parseInt(newStatus) === 1 ? 1 : 0;
    
    // 更新状态
    await db.collection('lovelist').doc(itemId).update({
      icon: icon,
      updateTime: new Date().toISOString()
    });
    
    return {
      success: true,
      message: icon === 1 ? '标记为已完成' : '标记为未完成',
      data: {
        icon: icon,
        isCompleted: icon === 1
      }
    };
  } catch (error) {
    console.error('切换状态错误:', error);
    return {
      success: false,
      message: '状态切换失败',
      error: error.message
    };
  }
}

/**
 * 获取列表统计信息
 */
async function getListStats() {
  try {
    // 获取总数
    const totalResult = await db.collection('lovelist').count();
    
    // 获取已完成数量
    const completedResult = await db.collection('lovelist')
      .where({
        icon: 1
      })
      .count();
    
    // 获取未完成数量
    const uncompletedResult = await db.collection('lovelist')
      .where({
        icon: 0
      })
      .count();
    
    // 计算完成率
    const completionRate = totalResult.total > 0 
      ? Math.round((completedResult.total / totalResult.total) * 100) 
      : 0;
    
    return {
      success: true,
      message: '获取成功',
      data: {
        total: totalResult.total,
        completed: completedResult.total,
        uncompleted: uncompletedResult.total,
        completionRate: completionRate
      }
    };
  } catch (error) {
    console.error('获取列表统计错误:', error);
    return {
      success: false,
      message: '获取列表统计失败',
      error: error.message
    };
  }
}

/**
 * 批量更新列表项状态
 */
async function batchUpdateStatus(itemIds, status) {
  try {
    const icon = parseInt(status) === 1 ? 1 : 0;
    const updatePromises = itemIds.map(id => 
      db.collection('lovelist').doc(id).update({
        icon: icon,
        updateTime: new Date().toISOString()
      })
    );
    
    await Promise.all(updatePromises);
    
    return {
      success: true,
      message: `批量${icon === 1 ? '完成' : '取消完成'}成功`,
      data: {
        updatedCount: itemIds.length,
        icon: icon
      }
    };
  } catch (error) {
    console.error('批量更新状态错误:', error);
    return {
      success: false,
      message: '批量更新失败',
      error: error.message
    };
  }
}