const tcb = require('@cloudbase/node-sdk');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * 恋爱相册云函数
 * 对应原PHP项目的loveImg.php相关功能
 */
exports.main = async (event, context) => {
  const { action, data, page = 1, limit = 12, token, ipInfo } = event;
  
  try {
    // 对于写操作需要验证管理员权限
    const writeActions = ['addPhoto', 'updatePhoto', 'deletePhoto'];
    if (writeActions.includes(action)) {
      const authResult = await verifyAdminToken(token, ipInfo);
      if (!authResult.success) {
        return authResult;
      }
    }
    
    switch (action) {
      case 'getPhotos':
        return await getPhotos(page, limit);
      case 'addPhoto':
        return await addPhoto(data);
      case 'updatePhoto':
        return await updatePhoto(data);
      case 'deletePhoto':
        return await deletePhoto(data.id);
      case 'getPhotoDetail':
        return await getPhotoDetail(data.id);
      case 'getStats':
        return await getPhotoStats();
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('恋爱相册云函数错误:', error);
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
 * 获取相册列表
 * 对应原PHP: loveImg.php的相册展示功能
 */
async function getPhotos(page = 1, limit = 12) {
  try {
    const skip = (page - 1) * limit;
    
    // 按日期倒序获取相册
    const result = await db.collection('loveImg')
      .orderBy('imgDatd', 'desc')
      .skip(skip)
      .limit(limit)
      .get();
    
    // 获取总数
    const countResult = await db.collection('loveImg').count();
    
    // 处理相册数据
    const photos = result.data.map(photo => ({
      ...photo,
      formattedDate: formatDate(photo.imgDatd),
      // 如果图片URL是相对路径，转换为绝对路径
      fullImageUrl: photo.imgUrl && photo.imgUrl.startsWith('http') ? photo.imgUrl : `https://your-domain.com/${photo.imgUrl || ''}`
    }));
    
    return {
      success: true,
      message: '获取成功',
      data: {
        list: photos,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  } catch (error) {
    console.error('获取相册列表错误:', error);
    return {
      success: false,
      message: '获取相册列表失败',
      error: error.message
    };
  }
}

/**
 * 添加相册
 * 对应原PHP: admin/loveImgAdd.php
 */
async function addPhoto(data) {
  try {
    const { imgDatd, imgText, imgUrl } = data;
    
    // 数据验证
    if (!imgDatd || !imgText || !imgUrl) {
      return {
        success: false,
        message: '请填写完整的相册信息'
      };
    }
    
    // 构造相册数据
    const photoData = {
      imgDatd: imgDatd,
      imgText: imgText.trim(),
      imgUrl: imgUrl.trim(),
      createTime: new Date().toISOString()
    };
    
    // 插入相册
    const result = await db.collection('loveImg').add(photoData);
    
    return {
      success: true,
      message: '相册添加成功',
      data: {
        id: result.id,
        ...photoData,
        formattedDate: formatDate(photoData.imgDatd)
      }
    };
  } catch (error) {
    console.error('添加相册错误:', error);
    return {
      success: false,
      message: '相册添加失败',
      error: error.message
    };
  }
}

/**
 * 更新相册
 * 对应原PHP: admin/ImgUpdaPost.php
 */
async function updatePhoto(data) {
  try {
    const { id, imgDatd, imgText, imgUrl } = data;
    
    if (!id) {
      return {
        success: false,
        message: '缺少相册ID'
      };
    }
    
    // 构造更新数据
    const updateData = {
      imgDatd: imgDatd,
      imgText: imgText.trim(),
      imgUrl: imgUrl.trim(),
      updateTime: new Date().toISOString()
    };
    
    // 更新相册
    await db.collection('loveImg').doc(id).update(updateData);
    
    return {
      success: true,
      message: '相册更新成功',
      data: updateData
    };
  } catch (error) {
    console.error('更新相册错误:', error);
    return {
      success: false,
      message: '相册更新失败',
      error: error.message
    };
  }
}

/**
 * 删除相册
 * 对应原PHP: admin/delImg.php
 */
async function deletePhoto(photoId) {
  try {
    if (!photoId) {
      return {
        success: false,
        message: '缺少相册ID'
      };
    }
    
    // 删除相册
    await db.collection('loveImg').doc(photoId).remove();
    
    return {
      success: true,
      message: '相册删除成功'
    };
  } catch (error) {
    console.error('删除相册错误:', error);
    return {
      success: false,
      message: '相册删除失败',
      error: error.message
    };
  }
}

/**
 * 获取相册详情
 */
async function getPhotoDetail(photoId) {
  try {
    if (!photoId) {
      return {
        success: false,
        message: '缺少相册ID'
      };
    }
    
    const result = await db.collection('loveImg').doc(photoId).get();
    
    if (result.data && result.data.length > 0) {
      const photo = result.data[0];
      return {
        success: true,
        message: '获取成功',
        data: {
          ...photo,
          formattedDate: formatDate(photo.imgDatd),
          fullImageUrl: photo.imgUrl && photo.imgUrl.startsWith('http') ? photo.imgUrl : `https://your-domain.com/${photo.imgUrl || ''}`
        }
      };
    } else if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
      // 处理直接返回对象的情况
      const photo = result.data;
      return {
        success: true,
        message: '获取成功',
        data: {
          ...photo,
          formattedDate: formatDate(photo.imgDatd),
          fullImageUrl: photo.imgUrl && photo.imgUrl.startsWith('http') ? photo.imgUrl : `https://your-domain.com/${photo.imgUrl || ''}`
        }
      };
    } else {
      return {
        success: false,
        message: '未找到相册信息'
      };
    }
  } catch (error) {
    console.error('获取相册详情错误:', error);
    return {
      success: false,
      message: '获取相册详情失败',
      error: error.message
    };
  }
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * 验证图片URL格式
 */
function isValidImageUrl(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || url.startsWith('data:image/');
}

/**
 * 获取相册统计信息
 */
async function getPhotoStats() {
  try {
    const countResult = await db.collection('loveImg').count();
    
    return {
      success: true,
      message: '获取相册统计成功',
      data: {
        count: countResult.total,
        total: countResult.total
      }
    };
  } catch (error) {
    console.error('获取相册统计错误:', error);
    return {
      success: false,
      message: '获取相册统计失败',
      error: error.message
    };
  }
}
