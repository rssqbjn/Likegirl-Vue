const tcb = require('@cloudbase/node-sdk');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});

const db = app.database();

/**
 * 文章管理云函数
 * 对应原PHP项目的article相关功能（点点滴滴）
 * 已添加安全验证，防止恶意操作
 */
exports.main = async (event, context) => {
  const { action, data, page = 1, limit = 10, token, ipInfo } = event;
  
  try {
    // 获取IP信息（优先使用前端传递的）
    const clientIP = ipInfo?.ip || context.CLIENTIP || '未知';
    
    // 记录访问日志
    console.log(`文章云函数被调用 - 操作: ${action}, IP: ${clientIP}, 时间: ${new Date().toISOString()}`);
    
    // 如果有详细的IP信息，也记录下来
    if (ipInfo) {
      console.log(`IP详情: 位置=${ipInfo.location || '未知'}, 国家=${ipInfo.country || '未知'}, 地区=${ipInfo.region || '未知'}, 城市=${ipInfo.city || '未知'}`);
    }
    
    switch (action) {
      // 公开访问的操作（无需鉴权）
      case 'getArticles':
        return await getArticles(page, limit);
      case 'getArticle':
        return await getArticleDetail(data?.id);
      case 'getStats':
        return await getArticleStats();
      
      // 需要管理员权限的操作
      case 'addArticle':
        const addAuthResult = await verifyAdminToken(token, ipInfo);
        if (!addAuthResult.success) {
          return addAuthResult;
        }
        return await addArticle(data);
        
      case 'updateArticle':
        const updateAuthResult = await verifyAdminToken(token, ipInfo);
        if (!updateAuthResult.success) {
          return updateAuthResult;
        }
        return await updateArticle(data);
        
      case 'deleteArticle':
        const deleteAuthResult = await verifyAdminToken(token, ipInfo);
        if (!deleteAuthResult.success) {
          return deleteAuthResult;
        }
        return await deleteArticle(data?.id);
        
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('文章管理云函数错误:', error);
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
      console.log('Token验证失败: 未提供token');
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
        ipInfo: ipInfo // 传递IP信息
      }
    });

    if (!authResult.result || !authResult.result.success) {
      console.log('Token验证失败:', authResult.result?.message || '未知错误');
      return {
        success: false,
        message: '认证失败，请重新登录',
        code: 401
      };
    }

    console.log('Token验证成功:', authResult.result.userInfo);
    return {
      success: true,
      userInfo: authResult.result.userInfo
    };
  } catch (error) {
    console.error('Token验证异常:', error);
    return {
      success: false,
      message: '认证服务异常',
      code: 500
    };
  }
}

/**
 * 获取文章列表
 * 对应原PHP: little.php的文章展示功能
 */
async function getArticles(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    
    // 按时间倒序获取文章 - 优先使用createTime，兼容旧版articletime
    const result = await db.collection('article')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get();
    
    // 获取总数
    const countResult = await db.collection('article').count();
    
    // 处理文章数据
    const articles = result.data.map(article => ({
      ...article,
      // 优先使用createTime，兼容旧版articletime
      formattedTime: formatDate(article.createTime || article.articletime),
      // 提取文章摘要（去除HTML标签，截取前100字符）
      summary: extractSummary(article.articletext, 100),
      // 计算阅读时间（按每分钟200字计算）
      readingTime: Math.ceil(article.articletext.replace(/<[^>]*>/g, '').length / 200)
    }));
    
    return {
      success: true,
      message: '获取成功',
      data: {
        list: articles,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  } catch (error) {
    console.error('获取文章列表错误:', error);
    return {
      success: false,
      message: '获取文章列表失败',
      error: error.message
    };
  }
}

/**
 * 获取文章详情
 * 对应原PHP项目的文章详情页面
 * 支持通过自定义ID或文档_id查询
 */
async function getArticleDetail(articleId) {
  try {
    if (!articleId) {
      return {
        success: false,
        message: '缺少文章ID'
      };
    }
    
    let result;
    
    // 首先尝试通过自定义ID字段查询
    if (!isNaN(articleId)) {
      // 如果是数字，通过自定义id字段查询
      result = await db.collection('article').where({
        id: parseInt(articleId)
      }).get();
      
      if (result.data && result.data.length > 0) {
        const article = result.data[0];
        
        return {
          success: true,
          message: '获取成功',
          data: {
            ...article,
            // 优先使用createTime，兼容旧版articletime
            formattedTime: formatDate(article.createTime || article.articletime),
            // 处理文章内容中的HTML标签
            processedContent: processArticleContent(article.articletext || ''),
            readingTime: Math.ceil((article.articletext || '').replace(/<[^>]*>/g, '').length / 200)
          }
        };
      }
    }
    
    // 如果通过自定义ID没找到，尝试通过文档_id查询
    try {
      result = await db.collection('article').doc(articleId).get();
      
      if (result.data) {
        const article = result.data;
        
        return {
          success: true,
          message: '获取成功',
          data: {
            ...article,
            formattedTime: formatDate(article.articletime),
            // 处理文章内容中的HTML标签
            processedContent: processArticleContent(article.articletext || ''),
            readingTime: Math.ceil((article.articletext || '').replace(/<[^>]*>/g, '').length / 200)
          }
        };
      }
    } catch (docError) {
      console.log('通过文档ID查询失败，可能ID格式不正确:', docError.message);
    }
    
    return {
      success: false,
      message: '未找到文章'
    };
    
  } catch (error) {
    console.error('获取文章详情错误:', error);
    return {
      success: false,
      message: '获取文章详情失败',
      error: error.message
    };
  }
}

/**
 * 添加文章
 * 对应原PHP: admin/littleAdd.php
 */
async function addArticle(data) {
  try {
    const { articletitle, articletext, articlename } = data;
    
    // 数据验证
    if (!articletitle || !articletext || !articlename) {
      return {
        success: false,
        message: '请填写完整的文章信息'
      };
    }
    
    // 构造文章数据
    const articleData = {
      articletitle: articletitle.trim(),
      articletext: articletext,
      articlename: articlename.trim(),
      articletime: new Date().toISOString().split('T')[0], // YYYY-MM-DD格式
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };
    
    // 插入文章
    const result = await db.collection('article').add(articleData);
    
    return {
      success: true,
      message: '文章添加成功',
      data: {
        id: result.id,
        ...articleData,
        formattedTime: formatDate(articleData.articletime),
        summary: extractSummary(articleData.articletext, 100)
      }
    };
  } catch (error) {
    console.error('添加文章错误:', error);
    return {
      success: false,
      message: '文章添加失败',
      error: error.message
    };
  }
}

/**
 * 更新文章
 * 对应原PHP: admin/littleupda.php
 */
async function updateArticle(data) {
  try {
    const { _id, articletitle, articletext, articlename, articletime } = data;
    
    if (!_id) {
      return {
        success: false,
        message: '缺少文章ID'
      };
    }
    
    // 构造更新数据
    const updateData = {
      articletitle: articletitle.trim(),
      articletext: articletext,
      articlename: articlename.trim(),
      articletime: articletime || new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString()
    };
    
    // 更新文章
    await db.collection('article').doc(_id).update(updateData);
    
    return {
      success: true,
      message: '文章更新成功',
      data: {
        ...updateData,
        formattedTime: formatDate(updateData.articletime),
        summary: extractSummary(updateData.articletext, 100)
      }
    };
  } catch (error) {
    console.error('更新文章错误:', error);
    return {
      success: false,
      message: '文章更新失败',
      error: error.message
    };
  }
}

/**
 * 删除文章
 * 对应原PHP: admin/dellitt.php
 */
async function deleteArticle(articleId) {
  try {
    if (!articleId) {
      return {
        success: false,
        message: '缺少文章ID'
      };
    }
    
    // 删除文章
    await db.collection('article').doc(articleId).remove();
    
    return {
      success: true,
      message: '文章删除成功'
    };
  } catch (error) {
    console.error('删除文章错误:', error);
    return {
      success: false,
      message: '文章删除失败',
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
 * 提取文章摘要
 */
function extractSummary(content, maxLength = 100) {
  try {
    // 去除HTML标签
    const textContent = content.replace(/<[^>]*>/g, '');
    // 去除多余空白字符
    const cleanText = textContent.replace(/\s+/g, ' ').trim();
    // 截取指定长度
    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...' 
      : cleanText;
  } catch (error) {
    return '无法提取摘要';
  }
}

/**
 * 处理文章内容
 * 对应原PHP项目的HTML内容处理
 */
function processArticleContent(content) {
  try {
    // 处理引用标签
    let processedContent = content.replace(/<quote>/g, '<blockquote class="quote">');
    processedContent = processedContent.replace(/<\/quote>/g, '</blockquote>');
    
    // 处理居中标签
    processedContent = processedContent.replace(/<center>/g, '<div class="text-center">');
    processedContent = processedContent.replace(/<\/center>/g, '</div>');
    
    // 处理视频标签，添加控制属性
    processedContent = processedContent.replace(/<video([^>]*)>/g, '<video$1 controls playsinline>');
    
    // 处理图片标签，添加响应式类
    processedContent = processedContent.replace(/<img([^>]*)>/g, '<img$1 class="responsive-image">');
    
    return processedContent;
  } catch (error) {
    console.error('处理文章内容错误:', error);
    return content;
  }
}

/**
 * 搜索文章
 */
async function searchArticles(keyword, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    
    // 使用正则表达式进行模糊搜索
    const result = await db.collection('article')
      .where({
        $or: [
          { articletitle: new RegExp(keyword, 'i') },
          { articletext: new RegExp(keyword, 'i') },
          { articlename: new RegExp(keyword, 'i') }
        ]
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(limit)
      .get();
    
    // 获取搜索结果总数
    const countResult = await db.collection('article')
      .where({
        $or: [
          { articletitle: new RegExp(keyword, 'i') },
          { articletext: new RegExp(keyword, 'i') },
          { articlename: new RegExp(keyword, 'i') }
        ]
      })
      .count();
    
    const articles = result.data.map(article => ({
      ...article,
      // 优先使用createTime，兼容旧版articletime
      formattedTime: formatDate(article.createTime || article.articletime),
      summary: extractSummary(article.articletext, 100),
      // 高亮搜索关键词
      highlightedTitle: highlightKeyword(article.articletitle, keyword),
      highlightedSummary: highlightKeyword(extractSummary(article.articletext, 100), keyword)
    }));
    
    return {
      success: true,
      message: '搜索成功',
      data: {
        list: articles,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit),
        keyword: keyword
      }
    };
  } catch (error) {
    console.error('搜索文章错误:', error);
    return {
      success: false,
      message: '搜索失败',
      error: error.message
    };
  }
}

/**
 * 获取文章统计数据
 */
async function getArticleStats() {
  try {
    // 获取文章总数
    const countResult = await db.collection('article').count();
    
    return {
      success: true,
      message: '获取文章统计成功',
      data: {
        count: countResult.total,
        total: countResult.total
      }
    };
  } catch (error) {
    console.error('获取文章统计错误:', error);
    return {
      success: false,
      message: '获取文章统计失败',
      error: error.message
    };
  }
}

/**
 * 高亮关键词
 */
function highlightKeyword(text, keyword) {
  if (!keyword || !text) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
