<template>
  <div class="little-page-wrapper">
    <!-- 引入头部组件 -->
    <Header />
    
    <div id="pjax-container">
      <div class="central">
        <div class="title">
          <h1>{{ siteConfig.deci1 }}</h1>
        </div>
        <div class="row">
          <div
            v-for="article in articles"
            :key="article.id"
            class="card article-card"
            :class="{ 'animated fadeInUp delay-03s': siteConfig.animation }"
          >
            <div class="little_texts">
              <router-link :to="`/page/${article.id}`">
                <div class="top-title textOneHide">
                  {{ article.articletitle }}
                </div>
              </router-link>
              <div class="info">
                <span>
                  <svg class="little_icon" aria-hidden="true">
                    <use xlink:href="#icon-shoucang"></use>
                  </svg>
                  {{ article.articlename }} <i>记录于</i> {{ article.articletime }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">加载中...</div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="!loading && articles.length === 0" class="empty-state">
            <div class="empty-content">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <h3>暂无记录</h3>
              <p>还没有任何恋爱小记，快去创建第一条记录吧～</p>
            </div>
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
import { useRouter } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'

const router = useRouter()

// 响应式数据
const articles = ref([])
const loading = ref(true)
const isAuthenticated = ref(false)
const siteConfig = ref({
  title: 'Like Girl 5.2.0',
  card1: '恋爱小记',
  deci1: '记录我们的点点滴滴',
  animation: true
})


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

// 获取文章列表
const fetchArticles = async (page = 1, limit = 20) => {
  try {
    loading.value = true
    
    // 确保已经身份验证
    if (!isAuthenticated.value) {
      await authenticate()
    }
    
    // 调用云函数article获取文章列表
    const result = await app.callFunction({
      name: 'article',
      data: {
        action: 'getArticles',
        page: page,
        limit: limit
      }
    })
    
    if (result.result && result.result.success) {
      const data = result.result.data
      // 转换数据格式以适配前端显示
      articles.value = data.list.map(article => ({
        id: article._id,
        articletitle: article.articletitle,
        articlename: article.articlename,
        articletime: article.formattedTime || article.articletime,
        summary: article.summary,
        readingTime: article.readingTime
      }))
      
      
    } else {
      
      articles.value = []
    }
    
  } catch (error) {
    
    articles.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    // 先进行身份验证，再获取数据
    await authenticate()
    await fetchArticles()
  } catch (error) {
    
    loading.value = false
  }
})
</script>

<style scoped>
/* 页面包装器 - 全屏背景 */
.little-page-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  width: 100%;
}

/* 页面容器样式 */
.central {
  max-width: 800px !important;
  margin: 0 auto !important;
  padding: 2rem !important;
  min-height: calc(100vh - 200px);
  width: 100% !important;
}

/* 移除宽度限制，让内容占满容器 */

/* 标题样式 */
.title {
  text-align: center;
  margin: 3rem 0 2rem;
  padding-top: 80px; /* 为固定头部留出空间 */
}

.title h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  position: relative;
}

.title h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* 行布局 */
.row {
  display: flex !important;
  flex-direction: column !important;
  gap: 1.5rem;
  width: 100% !important;
  max-width: none !important;
}

/* 卡片样式 */
.card {
  background: white !important;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
  margin: 0 !important;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.card:hover::before {
  left: 100%;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

/* 文本内容样式 */
.little_texts {
  width: 100%;
  text-align: center;
}

.top-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  text-decoration: none;
  text-align: center;
}

.top-title:hover {
  color: #667eea;
}

.textOneHide {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.little_icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.card:hover .little_icon {
  transform: translateX(3px);
}

.info {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
}

.info span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  justify-content: center;
}

.info i {
  font-style: normal;
  color: #999;
  margin: 0 0.3rem;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
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

/* 空状态样式 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

.empty-content {
  text-align: center;
  max-width: 300px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #ccc;
  margin-bottom: 1.5rem;
}

.empty-content h3 {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.empty-content p {
  color: #999;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .central {
    padding: 1rem 0.5rem;
  }
  
  .title {
    margin: 2rem 0 1.5rem;
    padding-top: 60px;
  }
  
  .title h1 {
    font-size: 2rem;
  }
  
  .card {
    padding: 1.5rem;
    margin: 0 0.5rem;
  }
  
  .top-title {
    font-size: 1.2rem;
    justify-content: center;
    text-align: center;
  }
  
  .info {
    font-size: 0.85rem;
    justify-content: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .title h1 {
    font-size: 1.8rem;
  }
  
  .card {
    padding: 1.2rem;
  }
  
  .top-title {
    font-size: 1.1rem;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-align: center;
  }
  
  .little_icon {
    align-self: center;
  }
  
  .info {
    justify-content: center;
    text-align: center;
  }
}

/* 动画效果 */
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.fadeInUp {
  animation-name: fadeInUp;
}

.delay-03s {
  animation-delay: 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* 网格系统 */
.col-lg-12, 
.col-md-12, 
.col-sm-12, 
.col-sm-x-12 {
  width: 100%;
}

/* 链接样式重置 */
a {
  text-decoration: none;
  color: inherit;
}

a:hover {
  text-decoration: none;
}
</style>