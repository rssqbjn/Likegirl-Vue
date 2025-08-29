import { app, ensureLogin } from '@/utils/cloudbase'

// 身份验证状态
let isAuthenticated = false

/**
 * 身份验证
 */
async function authenticate() {
  if (isAuthenticated) {
    return true
  }
  
  try {
    // 尝试匿名登录
    await ensureLogin()
    isAuthenticated = true
    return true
  } catch (error) {
    throw error
  }
}

/**
 * 获取所有统计数据
 */
export async function getAllStats() {
  try {
    // 确保已经身份验证
    await authenticate()
    
    // 并行获取所有统计数据
    const [leavingStats, articleStats, loveListStats, loveImgStats] = await Promise.all([
      getLeavingStats(),
      getArticleStats(), 
      getLoveListStats(),
      getLoveImgStats()
    ])

    return {
      success: true,
      data: {
        leaving: leavingStats.data || { count: 0 },
        article: articleStats.data || { count: 0 },
        loveList: loveListStats.data || { total: 0, completed: 0, uncompleted: 0 },
        loveImg: loveImgStats.data || { count: 0 }
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '获取统计数据失败',
      error: error.message
    }
  }
}

/**
 * 获取留言统计
 */
async function getLeavingStats() {
  try {
    // 确保已经身份验证
    await authenticate()
    
    const result = await app.callFunction({
      name: 'leaving',
      data: {
        action: 'getStats'
      }
    })

    if (result.result && result.result.success) {
      return {
        success: true,
        data: result.result.data
      }
    } else {
      throw new Error(result.result?.message || '获取留言统计失败')
    }
  } catch (error) {
    return {
      success: false,
      data: { count: 0 }
    }
  }
}

/**
 * 获取文章统计
 */
async function getArticleStats() {
  try {
    // 确保已经身份验证
    await authenticate()
    
    const result = await app.callFunction({
      name: 'article',
      data: {
        action: 'getStats'
      }
    })

    if (result.result && result.result.success) {
      return {
        success: true,
        data: result.result.data
      }
    } else {
      throw new Error(result.result?.message || '获取文章统计失败')
    }
  } catch (error) {
    return {
      success: false,
      data: { count: 0 }
    }
  }
}

/**
 * 获取恋爱清单统计
 */
async function getLoveListStats() {
  try {
    // 确保已经身份验证
    await authenticate()
    
    const result = await app.callFunction({
      name: 'lovelist',
      data: {
        action: 'getStats'
      }
    })

    if (result.result && result.result.success) {
      return {
        success: true,
        data: result.result.data
      }
    } else {
      throw new Error(result.result?.message || '获取恋爱清单统计失败')
    }
  } catch (error) {
    return {
      success: false,
      data: { total: 0, completed: 0, uncompleted: 0 }
    }
  }
}

/**
 * 获取恋爱相册统计
 */
async function getLoveImgStats() {
  try {
    // 确保已经身份验证
    await authenticate()
    
    const result = await app.callFunction({
      name: 'loveImg',
      data: {
        action: 'getStats'
      }
    })

    if (result.result && result.result.success) {
      return {
        success: true,
        data: result.result.data
      }
    } else {
      throw new Error(result.result?.message || '获取恋爱相册统计失败')
    }
  } catch (error) {
    return {
      success: false,
      data: { count: 0 }
    }
  }
}
