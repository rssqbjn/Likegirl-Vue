<template>
  <div>
    <!-- 引入头部组件 -->
    <Header />
    
    <div id="pjax-container">
      <!-- 时间区域 -->
      <div class="time">
        <span id="span_dt_dt">{{ timeText }}</span>
        <b id="tian">{{ days }}天</b>
        <b id="shi">{{ hours }}时</b>
        <b id="fen">{{ minutes }}分</b>
        <b id="miao">{{ seconds }}秒</b>
      </div>
      
      <!-- 卡片区域 -->
      <div class="card-wrap">
        <div class="row central">
          <div 
           class="card-b col-lg-6 col-12 col-sm-12 flex-h"
            :class="{ 'animated fadeInUp': siteConfig.animation }"
            @click="navigateTo('/little')"
          >
            <img src="/Style/img/home/home-page.svg">
            <div class="text">
              <span><router-link to="/little">{{ siteConfig.card1 }}</router-link></span>
              <p>{{ siteConfig.deci1 }}</p>
            </div>
          </div>
          
          <div 
            class="card-b col-lg-6 col-12 col-sm-12 flex-h"
            :class="{ 'animated fadeInUp': siteConfig.animation }"
            @click="navigateTo('/leaving')"
          >
            <img src="/Style/img/home/home-msg.svg" alt="">
            <div class="text">
              <span><router-link to="/leaving">{{ siteConfig.card2 }}</router-link></span>
              <p>{{ siteConfig.deci2 }}</p>
            </div>
          </div>
          
          <div 
            class="card-b col-lg-6 col-12 col-sm-12 flex-h"
            :class="{ 'animated fadeInUp': siteConfig.animation }"
            @click="navigateTo('/about')"
          >
            <img src="/Style/img/home/home-about.svg" alt="">
            <div class="text">
              <span><router-link to="/about">{{ siteConfig.card3 }}</router-link></span>
              <p>{{ siteConfig.deci3 }}</p>
            </div>
          </div>
          
          <div 
            class="card-b col-lg-6 col-12 col-sm-12 flex-h"
            :class="{ 'animated fadeInUp': siteConfig.animation }"
            @click="navigateTo('/loveImg')"
          >
            <img src="/Style/img/home/home-photo.svg" alt="">
            <div class="text">
              <span><router-link to="/loveImg">Love Photo</router-link></span>
              <p>恋爱相册 记录最美瞬间</p>
            </div>
          </div>
          
          <div 
            class="card-b col-lg-6 col-12 col-sm-12 flex-h"
            :class="{ 'animated fadeInUp': siteConfig.animation }"
            @click="navigateTo('/list')"
          >
            <img src="/Style/img/home/home-list.svg" alt="">
            <div class="text">
              <span><router-link to="/list">Love List</router-link></span>
              <p>恋爱列表 你我之间的约定</p>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'

const router = useRouter()

// 网站配置数据
const siteConfig = ref({
  title: 'Like Girl 5.2.0',
  animation: true,
  startTime: '2024/01/01 00:00:00',
  card1: '恋爱小记',
  deci1: '记录我们的点点滴滴',
  card2: '留言板',
  deci2: '给我们留下美好的祝福',
  card3: '关于我们',
  deci3: '了解我们的爱情故事'
})

// 时间相关数据
const timeText = ref('这是我们一起走过的')
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const loading = ref(true)

let timeInterval = null

// 获取网站配置
const fetchSiteConfig = async () => {
  try {
    loading.value = true
    
    // 匿名登录
    await ensureLogin()
    
    
    // 调用云函数获取网站配置
    const result = await app.callFunction({
      name: 'settings',
      data: {
        action: 'getSettings',
        data: {
          type: 'text'
        }
      }
    })
    
    
    
    if (result.result && result.result.success) {
      const configData = result.result.data[0] // 取数组的第一个元素
      
      // 更新网站配置
      siteConfig.value = {
        title: configData.title || 'Like Girl 5.2.0',
        animation: configData.Animation === 1,
        startTime: configData.startTime || '2024/01/01 00:00:00',
        card1: configData.card1 || '恋爱小记',
        deci1: configData.deci1 || '记录我们的点点滴滴',
        card2: configData.card2 || '留言板',
        deci2: configData.deci2 || '给我们留下美好的祝福',
        card3: configData.card3 || '关于我们',
        deci3: configData.deci3 || '了解我们的爱情故事'
      }
      
      // 更新时间文本（如果后端有配置的话）
      timeText.value = configData.timeText || '这是我们一起走过的'
      
      
    } else {
      
    }
  } catch (error) {
    
  } finally {
    loading.value = false
  }
}

// 计算时间差
const calculateTimeDifference = () => {
  const birthDay = new Date(siteConfig.value.startTime)
  const today = new Date()
  const timeOld = today.getTime() - birthDay.getTime()
  
  const sectimeOld = timeOld / 1000
  const msPerDay = 24 * 60 * 60 * 1000
  const e_daysOld = timeOld / msPerDay
  
  days.value = Math.floor(e_daysOld)
  
  const e_hrsOld = (e_daysOld - days.value) * 24
  hours.value = Math.floor(e_hrsOld)
  
  const e_minsOld = (e_hrsOld - hours.value) * 60
  minutes.value = Math.floor(e_minsOld)
  
  const secs = Math.floor((e_minsOld - minutes.value) * 60)
  seconds.value = secs < 10 ? `0${secs}` : secs
}

// 开始时间计时
const startTimeCounter = () => {
  calculateTimeDifference()
  timeInterval = setInterval(calculateTimeDifference, 1000)
}

// 导航到指定路由
const navigateTo = (path) => {
  router.push(path)
}

// 卡片点击事件处理
const handleCardClick = (event) => {
  const card = event.currentTarget
  const link = card.querySelector('a')
  if (link) {
    link.click()
  }
}

onMounted(async () => {
  // 先获取网站配置
  await fetchSiteConfig()
  
  // 然后开始时间计时
  startTimeCounter()
  
  // 添加卡片点击事件
  const cards = document.querySelectorAll('.card, .card-b')
  cards.forEach(card => {
    card.addEventListener('click', handleCardClick)
  })
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  
  // 清理事件监听器
  const cards = document.querySelectorAll('.card, .card-b')
  cards.forEach(card => {
    card.removeEventListener('click', handleCardClick)
  })
})
</script>

<style scoped>
/* 时间显示样式 - 与原版一致 */
.time {
  text-align: center;
  font-size: 1.8rem;
  letter-spacing: 0.2rem;
  padding: 2rem 0;
}

.time span {
  font-size: 1.8rem;
  line-height: 5rem;
  display: block;
  background-image: linear-gradient(270deg, #ff4500, #ffa500, #ffd700, #90ee90, #00ffff, #1e90ff, #9370db, #ff69b4, #ff4500);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: jianbian 60s linear infinite;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
}

.time b {
  font-size: 2.7rem;
  font-family: 'Noto Serif SC', serif;
  font-weight: 700;
  color: #333;
  margin: 0 0.2rem;
}

@keyframes jianbian {
  to {
    background-position: -2000rem;
  }
}

/* 卡片样式 */
.card-wrap {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.card, .card-b {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-height: 120px;
  white-space: nowrap;
  overflow: hidden;
}

.card:hover, .card-b:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.card {
  flex: 1;
  min-width: 320px;
  max-width: 380px;
}

.card-b {
  flex: 1;
  min-width: 320px;
  max-width: 600px;
}

.card img, .card-b img {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.text {
  flex: 1;
  min-width: 0;
}

.text span {
  display: block;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text span a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.text span a:hover {
  color: #667eea;
}

.text p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card, .card-b {
    min-width: 100%;
    max-width: 100%;
    padding: 1.5rem;
    white-space: normal;
  }
  
  .text span, .text p {
    white-space: normal;
    overflow: visible;
    text-overflow: initial;
  }
  
  .time b {
    margin: 0.2rem;
    padding: 0.3rem 0.8rem;
    font-size: 1rem;
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
</style>