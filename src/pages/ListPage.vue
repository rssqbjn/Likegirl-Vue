<template>
  <div class="list-page-wrapper">
    <!-- Header组件 -->
    <Header />
    
    <div id="pjax-container">
      <div class="central">
        <div class="title">
          <h1>总有些惊奇的际遇 比方说当我遇见你</h1>
        </div>
        <div class="row central central-800">
          <div v-if="!hideElement" class="card col-lg-12 col-md-12 col-sm-12 col-sm-x-12 card-center">
            <div class="list_texts animated fadeInUp delay-03s">
              <div class="lovelist">
                <div v-for="item in loveList" :key="item.id" class="love-item">
                  <li class="cike" @click="toggleItem(item.id)">
                    <span v-if="item.icon" class="status-icon completed">✓</span>
                    <span v-else class="status-icon pending">○</span>
                    <span>{{ item.eventname }}</span>
                    <span v-if="item.imgurl && item.imgurl !== '0'" class="image-icon">📷</span>
                  </li>
                  <ul :class="{ 'show': expandedItems.includes(item.id) }">
                    <li v-if="item.imgurl">
                      <img 
                        :src="item.imgurl" 
                        :alt="item.eventname"
                        @load="onImageLoad"
                        @error="onImageError"
                      />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="empty-state">
            <div class="empty-icon">💕</div>
            <p>还没有记录恋爱事件哦~</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer组件 -->
    <Footer />
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { app, ensureLogin } from '@/utils/cloudbase'

export default {
  name: 'ListPage',
  components: {
    Header,
    Footer
  },
  setup() {
    // 响应式数据
    const loveList = ref([])
    const expandedItems = ref([])
    const loading = ref(true)
    
    // 计算属性
    const hideElement = computed(() => loveList.value.length < 1)
    
    
    // 身份验证状态
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
    
    // 方法
    const fetchLoveList = async (page = 1, limit = 100) => {
      try {
        loading.value = true
        
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }
        
        // 调用云函数lovelist
        const result = await app.callFunction({
          name: 'lovelist',
          data: {
            action: 'getList',
            page: page,
            limit: limit
          }
        })
        
        if (result.result && result.result.success) {
          const data = result.result.data
          // 获取列表并倒序排列，让新增加的显示在最上边（参考AdminLoveListPage的实现）
          const list = data.list || []
          
          // 转换数据格式以适配前端显示
          loveList.value = list.map(item => ({
            id: item.id || item._id,
            _id: item._id,
            eventname: item.eventname,
            icon: item.icon === 1 || item.isCompleted === true, // 转换为boolean
            imgurl: item.imgurl && item.imgurl !== '0' ? item.fullImageUrl || item.imgurl : null,
            hasImage: item.hasImage || (item.imgurl && item.imgurl !== '0'),
            createTime: item.createTime || item.created_at || item.timestamp || new Date().getTime()
          })).reverse() // 使用reverse()方法实现倒序排列，最新的在最上面
          
          
        } else {
          
          showError(result.result?.message || '获取数据失败')
          // 如果获取失败，设置空数组避免页面报错
          loveList.value = []
        }
      } catch (error) {
        
        showError('网络请求失败，请检查网络连接')
        loveList.value = []
      } finally {
        loading.value = false
      }
    }
    
    // 错误提示方法
    const showError = (message) => {
      // 这里可以集成消息提示组件，暂时使用alert
      alert(message)
    }
    
    const toggleItem = (itemId) => {
      const index = expandedItems.value.indexOf(itemId)
      if (index > -1) {
        expandedItems.value.splice(index, 1)
      } else {
        expandedItems.value.push(itemId)
      }
    }
    
    const onImageLoad = (event) => {
      event.target.style.opacity = '1'
    }
    
    const onImageError = (event) => {
      // 设置默认的错误图片或隐藏图片
      event.target.style.display = 'none'
      // 可以在父元素中显示错误提示
      const errorMsg = document.createElement('div')
      errorMsg.textContent = '图片加载失败'
      errorMsg.style.cssText = 'text-align: center; color: #999; padding: 2rem; font-size: 0.9rem;'
      event.target.parentNode.appendChild(errorMsg)
    }
    
    // 生命周期
    onMounted(async () => {
      try {
        // 先进行身份验证，再获取数据
        await authenticate()
        await fetchLoveList()
      } catch (error) {
        
        showError('初始化失败，请刷新页面重试')
      }
    })
    
    return {
      loveList,
      expandedItems,
      loading,
      hideElement,
      isAuthenticated,
      toggleItem,
      onImageLoad,
      onImageError
    }
  }
}
</script>

<style scoped>
/* 页面包装器 */
.list-page-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
  padding-top: 80px;
}

/* 标题样式 */
.title {
  text-align: center;
  margin: 2rem 0;
}

.title h1 {
  color: black;
  font-size: 2.2rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  
}

/* 中央容器 */
.central {
  max-width: 1200px !important;
  margin: 0 auto;
  padding: 0 2rem;
}

.central-800 {
  max-width: 800px !important;
}

/* 行布局样式 */
.row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

/* 卡片样式 */
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 卡片居中样式 */
.card-center {
  margin: 0 auto;
  max-width: 100%;
  width: 100%;
}

/* 列表文本容器 */
.list_texts {
  background: #fff;
  padding: 2rem 2rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: row;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 8px 12px #ebedf0;
  border: 1px solid rgba(208, 206, 206, 0.6) !important;
  animation-duration: 0.8s;
  animation-fill-mode: both;
}

/* 恋爱列表样式 */
.lovelist {
  padding: 0;
  margin: 0;
  transition: height 2s;
  width: 100%;
  line-height: 3rem;
}

.love-item {
  margin-bottom: 0;
}

/* 列表项样式 */
li {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

li.cike {
  border-bottom: 1px solid rgba(208, 206, 206, 0.6) !important;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0;
  line-height: 3rem;
}

li.cike:hover {
  cursor: url('../Style/cur/hover.cur'), pointer;
}

li.cike:last-child {
  border-bottom: 1px solid rgba(208, 206, 206, 0.6) !important;
}

/* 状态图标样式 */
.status-icon {
  font-style: normal;
  margin-right: 0.8rem;
  font-size: 1.8rem;
  font-weight: bold;
  display: inline-block;
  width: 1.5rem;
  text-align: center;
}

.status-icon.completed {
  color: #19ffa0;
}

.status-icon.pending {
  color: #ddd;
}

.image-icon {
  margin-left: auto;
  font-size: 1.2rem;
  color: #667eea;
}

/* 事件名称 */
li.cike span:not(.status-icon):not(.image-icon) {
  flex: 1;
  font-size: 1.3rem;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  color: #333;
}

/* 图片容器 */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.5s ease;
  opacity: 0;
}

ul.show {
  max-height: 500px;
  opacity: 1;
  padding: 0;
}

ul li {
  border: none;
  padding: 0;
}

ul li img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-height: 450px;
  box-shadow: 0 4px 8px 0 rgb(28 31 33 / 15%);
  border-radius: 12px;
  border: 1px solid rgba(208, 206, 206, 0.6) !important;
  margin: 1.5rem 0;
  transition: all 0.3s ease;
  opacity: 0;
  display: block;
}

ul li img:hover {
  cursor: url('../Style/cur/hover.cur'), pointer;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.2rem;
  opacity: 0.8;
  margin: 0;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

/* 响应式设计 */
@media (max-width: 768px) {
  .list-page-wrapper {
    padding-top: 60px;
  }
  
  .central {
    padding: 0 1rem;
  }
  
  .title h1 {
    font-size: 1.8rem;
  }
  
  .card {
    padding: 1.5rem;
    border-radius: 16px;
  }
  
  li.cike {
    padding: 0.8rem 0;
  }
  
  li.cike span {
    font-size: 1rem;
  }
  
  ul li img {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .title h1 {
    font-size: 1.5rem;
  }
  
  .card {
    padding: 1rem;
  }
  
  li.cike {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .icon {
    margin-left: 0;
  }
}
</style>