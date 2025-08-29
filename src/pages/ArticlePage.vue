<template>
  <div>
    <!-- 引入头部组件 -->
    <Header />
    
    <div id="pjax-container">
      <div class="central">
        <div class="article-container">
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">加载中...</div>
          </div>
          
          <div v-else-if="article" class="article-content">
            <div class="article-header">
              <h1 class="article-title">{{ article.articletitle }}</h1>
              <div class="article-meta">
                <span class="author">{{ article.articlename }}</span>
                <span class="separator">记录于</span>
                <span class="date">{{ article.articletime }}</span>
              </div>
            </div>
            
            <div class="article-body">
              <div v-html="article.content"></div>
            </div>
            
            <div class="article-footer">
              <router-link to="/little" class="back-btn">
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                返回列表
              </router-link>
            </div>
          </div>
          
          <div v-else class="error-state">
            <h3>文章不存在</h3>
            <p>抱歉，您访问的文章不存在或已被删除。</p>
            <router-link to="/little" class="back-btn">返回列表</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 引入底部组件 -->
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'

const route = useRoute()

// 响应式数据
const article = ref(null)
const loading = ref(true)
const isAuthenticated = ref(false)


// 身份验证方法
const authenticate = async () => {
  try {
    // 尝试匿名登录
    await ensureLogin()
    isAuthenticated.value = true
    
  } catch (error) {
    
    throw error
  }
}

// 获取文章详情
const fetchArticle = async () => {
  try {
    loading.value = true
    const articleId = route.params.id
    
    if (!articleId) {
      throw new Error('缺少文章ID')
    }
    
    // 确保已经身份验证
    if (!isAuthenticated.value) {
      await authenticate()
    }
    
    
    
    // 调用云函数article获取文章详情
    const result = await app.callFunction({
      name: 'article',
      data: {
        action: 'getArticle',
        data: {
          id: articleId
        }
      }
    })
    
    
    
    
    if (result.result && result.result.success) {
      let data = result.result.data
      
      // 检查数据结构，如果是数组则取第一个元素
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]
      } else if (data && typeof data === 'object' && data[0]) {
        // 如果数据被包装成对象形式的数组
        data = data[0]
      }
      
      
      
      // 格式化日期
      const formatDate = (dateStr) => {
        if (!dateStr) return '未知时间'
        try {
          // 如果已经是格式化的日期，直接返回
          if (dateStr.includes('/')) return dateStr
          
          // 处理 YYYY-MM-DD 格式
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) return dateStr
          
          return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        } catch (error) {
          
          return dateStr || '未知时间'
        }
      }
      
      // 处理文章内容
      const processContent = (content) => {
        if (!content) return '暂无内容'
        
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
          ;
          return content;
        }
      }
      
      // 转换数据格式以适配前端显示
      article.value = {
        id: data._id || data.id,
        articletitle: data.articletitle || '无标题',
        articlename: data.articlename || '匿名',
        articletime: formatDate(data.articletime),
        content: processContent(data.articletext),
        readingTime: Math.ceil((data.articletext || '').replace(/<[^>]*>/g, '').length / 200) || 1
      }
      
      
      
    } else {
      
      
      article.value = null
    }
    
  } catch (error) {
    
    article.value = null
    // 可以添加用户友好的错误提示
    if (error.message.includes('缺少文章ID')) {
      
    } else {
      
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    // 先进行身份验证，再获取数据
    await authenticate()
    await fetchArticle()
  } catch (error) {
    
    loading.value = false
  }
})
</script>

<style scoped>
/* 引入Google字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* 页面容器样式 */
.central {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 200px);
}

.article-container {
  padding-top: 100px;
  margin: 0.5rem 0;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
}

.loading-spinner {
  font-size: 1.1rem;
  color: #667eea;
  position: relative;
}

.loading-spinner::after {
  content: '';
  position: absolute;
  right: -25px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #667eea;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

/* 文章内容样式 - 模仿原版little_texts */
.article-content {
  background: #fff;
  padding: 2rem 0;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 12px #ebedf0;
  border: 1px solid rgba(208, 206, 206, 0.6) !important;
}

.article-header {
  width: 100%;
  text-align: center;
  margin-bottom: 2rem;
}

.article-title {
  font-size: 2rem !important;
  line-height: 3rem !important;
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  color: #333;
}

.article-meta {
  color: #a1a1a1;
  margin-bottom: 2rem;
}

.article-meta span {
  font-size: 1.2rem;
  font-family: 'Noto Serif SC', serif;
}

.author {
  font-weight: 600;
  color: #a1a1a1;
}

.separator {
  font-style: normal;
  margin: 0 0.3rem;
}

.date {
  color: #a1a1a1;
}

/* 分割线样式 */
.article-header::after {
  content: '';
  display: block;
  margin: 2rem auto 0;
  border-top: 1px solid #e3e3e3;
  width: 90%;
}

/* 文章正文样式 - 模仿原版file类 */
.article-body {
  width: 90%;
  margin: 1rem 0 2rem;
  text-align: left;
  font-size: 1.2rem;
  line-height: 2.5rem;
  letter-spacing: 0.2rem;
  font-family: 'Noto Serif SC', serif;
  font-weight: 400;
}

/* 标题样式 - 模仿原版彩色背景 */
.article-body :deep(h1) {
  position: relative;
  padding: 0.5rem 1rem;
  padding-left: 1.5rem;
  box-sizing: border-box;
  border-radius: 0.35rem;
  margin: 0.8rem 0;
  font-size: 1.5rem;
  line-height: 1.5em;
  font-weight: 700;
  background: #e5edff;
  color: #007bff;
}

.article-body :deep(h2) {
  position: relative;
  padding: 0.5rem 1rem;
  padding-left: 1.5rem;
  box-sizing: border-box;
  border-radius: 0.35rem;
  margin: 0.8rem 0;
  font-size: 1.5rem;
  line-height: 1.5em;
  font-weight: 700;
  background: #f3e7ff;
  color: #7f00ff;
}

.article-body :deep(h3) {
  position: relative;
  padding: 0.5rem 1rem;
  padding-left: 1.5rem;
  box-sizing: border-box;
  border-radius: 0.35rem;
  margin: 0.8rem 0;
  font-size: 1.5rem;
  line-height: 1.5em;
  font-weight: 700;
  background: #ffe7ec;
  color: #ff0035;
}

/* 标题前的白色装饰条 */
.article-body :deep(h1::before),
.article-body :deep(h2::before),
.article-body :deep(h3::before) {
  content: "";
  position: absolute;
  background: #ffffff;
  width: 4px;
  height: 70%;
  border-radius: 10rem;
  top: 50%;
  left: 0.95rem;
  transform: translate(-50%, -50%);
}

.article-body :deep(h4),
.article-body :deep(h5),
.article-body :deep(h6) {
  font-size: 1.5rem;
  line-height: 1.5em;
  color: #373737;
  font-weight: 700;
  margin: 0.8rem 0;
}

.article-body :deep(h4) {
  border-bottom: 1px solid #bfbfbf;
}

.article-body :deep(h5) {
  border-bottom: 1px dashed #bfbfbf;
}

/* 段落样式 */
.article-body :deep(p) {
  margin-bottom: 1.2rem;
  text-indent: 2em;
}

/* 文本样式 */
.article-body :deep(b) {
  font-weight: 700;
}

.article-body :deep(s) {
  color: #ff9191;
}

.article-body :deep(i) {
  font-style: italic;
  color: #575757;
}

/* 图片样式 */
.article-body :deep(img) {
  width: 100%;
  height: 100%;
  max-height: 450px;
  object-fit: cover;
  box-shadow: 0 4px 8px 0 rgb(28 31 33 / 15%);
  border-radius: 12px;
  margin: 1.5rem 0;
}

/* 代码样式 */
.article-body :deep(code) {
  padding: 0.2rem 0.3rem;
  border-radius: 0.4rem;
  font-size: 1rem;
  color: #ff5916;
  background-color: rgb(255 241 221);
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  margin: 0 0.3rem;
}

/* 引用块样式 - 模仿原版quote */
.article-body :deep(.quote),
.article-body :deep(blockquote) {
  display: block;
  width: 100% !important;
  padding: 1rem;
  border-left: 4px solid #fd7e14;
  border-radius: 0.35rem;
  color: #fd7e14 !important;
  background-color: rgba(253, 126, 20, 0.1) !important;
  box-sizing: border-box;
  font-weight: 700;
  line-height: 1.5em;
  margin: 1.5rem 0;
}

/* 分割线样式 */
.article-body :deep(hr) {
  height: 5px;
  border: none;
  border-top: 4px dotted #ffa1a7;
  text-align: center;
  width: 75%;
  margin: 35px auto;
}

/* 视频样式 */
.article-body :deep(video) {
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0px 6px 20px rgb(122 122 122 / 35%);
  margin: 1.5rem 0;
}

/* 居中文本样式 */
.article-body :deep(.text-center) {
  text-align: center;
  margin: 1.5rem 0;
}

/* 文章底部样式 - 模仿原版line */
.article-footer {
  padding: 1rem 0 1rem;
  border-top: 1px solid #e3e3e3;
  width: 90%;
  text-align: center;
  font-weight: 300;
  letter-spacing: 2px;
  color: #b5b5b5;
  margin-top: 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  margin-top: 1rem;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  color: white;
}

.back-btn .icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* 错误状态样式 */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 8px 12px #ebedf0;
  border: 1px solid rgba(208, 206, 206, 0.6);
}

.error-state h3 {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 600;
  font-family: 'Noto Serif SC', serif;
}

.error-state p {
  color: #999;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
  font-family: 'Noto Serif SC', serif;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .central {
    padding: 1rem 0.5rem;
  }
  
  .article-container {
    padding-top: 80px;
  }
  
  .article-content {
    padding: 2rem 1rem;
  }
  
  .article-title {
    font-size: 1.8rem !important;
    line-height: 2.5rem !important;
  }
  
  .article-body {
    font-size: 1rem;
    line-height: 2rem;
    letter-spacing: 0.1rem;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .article-content {
    padding: 1.5rem 0.5rem;
  }
  
  .article-title {
    font-size: 1.6rem !important;
    line-height: 2.2rem !important;
  }
  
  .article-body {
    width: 95%;
    font-size: 1rem;
    line-height: 2rem;
    letter-spacing: 0.1rem;
  }
  
  .article-body :deep(p) {
    text-indent: 1.5em;
  }
  
  .article-body :deep(h1),
  .article-body :deep(h2),
  .article-body :deep(h3) {
    font-size: 1.3rem;
    padding: 0.4rem 0.8rem;
    padding-left: 1.2rem;
  }
}
</style>
