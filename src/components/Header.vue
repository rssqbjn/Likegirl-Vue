<template>
  <!-- 头部导航条 -->
  <div class="header-wrap">
    <div class="header">
      <div class="logo">
        <h1><router-link class="alogo" to="/">{{ siteConfig.logo }}</router-link></h1>
      </div>
      <div class="word">
        <span class="wenan">{{ siteConfig.writing }}</span>
      </div>
    </div>
  </div>

  <!-- 头像内容 -->
  <div class="bg-wrap">
    <div class="bg-img" :style="{ background: `url(${siteConfig.bgimg}) no-repeat center`, backgroundSize: 'cover' }">
      <div class="central central-800">
        <div class="middle" :class="{ 'animated fadeInDown': siteConfig.animation, 'Blurkg': siteConfig.blurkg }">
          <div class="img-male">
            <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${siteConfig.boyimg}&s=640`" draggable="false">
            <span>{{ siteConfig.boy }}</span>
          </div>
          <div class="love-icon">
            <img src="/Style/img/like.svg" draggable="false">
          </div>
          <div class="img-female">
            <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${siteConfig.girlimg}&s=640`" draggable="false">
            <span>{{ siteConfig.girl }}</span>
          </div>
        </div>
      </div>
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
        <g class="parallax">
          <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
          <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
          <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { app, ensureLogin } from '@/utils/cloudbase'

// 网站配置数据
const siteConfig = ref({
  logo: 'Like Girl',
  writing: '愿得一人心 白首不相离',
  bgimg: '/Style/img/Cover.webp',
  boyimg: '3439780232',
  boy: '男孩名字',
  girlimg: '3439780232',
  girl: '女孩名字',
  animation: true,
  blurkg: false
})

const isAuthenticated = ref(false)

// 身份验证
const authenticate = async () => {
  try {
    if (isAuthenticated.value) return true
    
    await ensureLogin()
    isAuthenticated.value = true
    return true
  } catch (error) {
    
    return false
  }
}

// 获取网站配置数据
const fetchSiteConfig = async () => {
  try {
    // 确保身份验证
    const authSuccess = await authenticate()
    if (!authSuccess) {
      
      return
    }
    
    
    
    // 并行获取text和diySet配置数据
    const [textResult, diyResult] = await Promise.all([
      app.callFunction({
        name: 'settings',
        data: { 
          action: 'getSettings',
          data: { type: 'text' }
        }
      }),
      app.callFunction({
        name: 'settings',
        data: { 
          action: 'getSettings',
          data: { type: 'diySet' }
        }
      })
    ])
    
    
    
    
    if (textResult.result && textResult.result.success) {
      const textConfig = textResult.result.data[0] || {}
      
      
      // 获取diySet配置
      let diyConfig = {}
      if (diyResult.result && diyResult.result.success) {
        diyConfig = diyResult.result.data[0] || {}
        
      }
      
      // 更新siteConfig，保留默认值作为回退
      siteConfig.value = {
        logo: textConfig.title || siteConfig.value.logo,
        writing: textConfig.writing || siteConfig.value.writing,
        bgimg: textConfig.bgimg || siteConfig.value.bgimg,
        boyimg: textConfig.boyimg || siteConfig.value.boyimg,
        boy: textConfig.boy || siteConfig.value.boy,
        girlimg: textConfig.girlimg || siteConfig.value.girlimg,
        girl: textConfig.girl || siteConfig.value.girl,
        animation: textConfig.Animation == 1, // 注意这里是Animation，不是animation
        blurkg: diyConfig.Blurkg == "2" // 从diySet获取Blurkg配置，"2"表示启用模糊移除效果
      }
      
      
    } else {
      
      
    }
    
  } catch (error) {
    
    
  }
}

// 滚动事件处理
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const wenanEl = document.querySelector('.wenan')
  const alogoEl = document.querySelector('.alogo')
  
  if (scrollTop > 500) {
    wenanEl?.style.setProperty('color', '#333333')
    alogoEl?.style.setProperty('color', '#333333')
  } else {
    wenanEl?.style.setProperty('color', 'rgb(97 97 97)')
    alogoEl?.style.setProperty('color', 'rgb(97 97 97)')
  }
}

onMounted(async () => {
  await fetchSiteConfig()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 头部导航样式 */
.header-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.wenan {
  color: rgb(97 97 97);
  transition: all 0.2s linear;
  font-size: 1rem;
  font-weight: 500;
}

.alogo {
  color: rgb(97 97 97);
  transition: all 0.2s linear;
  text-decoration: none;
}

.alogo:hover {
  color: #667eea;
}

/* 背景和头像区域 */
.bg-wrap {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.bg-img {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.central {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.central-800 {
  max-width: 800px;
}

/* 头像区域居中布局 */
.middle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 头像容器 */
.img-male, .img-female {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.img-male img, .img-female img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  object-fit: cover;
}

.img-male img:hover, .img-female img:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
}

.img-male span, .img-female span {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
}

/* 爱心图标 */
.love-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.love-icon img {
  width: 60px;
  height: 60px;
  animation: heartbeat 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/* 心跳动画 */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 波浪效果 */
.waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px;
  min-height: 100px;
  max-height: 150px;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px,0,0);
  }
  100% { 
    transform: translate3d(85px,0,0);
  }
}

/* 动画效果 */
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.fadeInDown {
  animation-name: fadeInDown;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate3d(0, -100px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* 模糊背景效果 */
.Blurkg {
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  background: transparent !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }
  
  .middle {
    flex-direction: row;
    gap: 1rem;
    padding: 1.5rem;
    flex-wrap: nowrap;
  }
  
  .img-male, .img-female {
    flex-shrink: 0;
    min-width: 0;
  }
  
  .img-male img, .img-female img {
    width: 80px;
    height: 80px;
  }
  
  .love-icon {
    flex-shrink: 0;
  }
  
  .love-icon img {
    width: 40px;
    height: 40px;
  }
  
  .img-male span, .img-female span {
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
  }
  
  .central {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .middle {
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .img-male img, .img-female img {
    width: 60px;
    height: 60px;
  }
  
  .love-icon img {
    width: 30px;
    height: 30px;
  }
  
  .img-male span, .img-female span {
    font-size: 0.8rem;
    max-width: 60px;
  }
}
</style>
