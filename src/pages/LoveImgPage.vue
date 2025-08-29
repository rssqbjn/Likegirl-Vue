<template>
  <div class="love-img-page">
    <Header />
    
    <div id="pjax-container">
      <h4 class="text-ce central">记录下你的最美瞬间</h4>
      
      <div class="row central">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner">加载中...</div>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="!loading && images.length === 0" class="empty-state">
          <div class="empty-content">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <h3>暂无照片</h3>
            <p>还没有上传任何恋爱照片，快去添加美好回忆吧～</p>
          </div>
        </div>
        
        <!-- 图片列表 -->
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="img_card col-lg-4 col-md-6 col-sm-12 col-sm-x-12"
          :class="{ 'animated zoomIn delay-03s': siteConfig.animation }"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="love_img">
            <img 
              :src="image.imgUrl" 
              :alt="image.imgText"
              :data-description="image.imgDatd"
              @click="openLightbox(image, index)"
              @load="onImageLoad"
              @error="onImageError"
            >
            
            <div class="words">
              <i>Date：{{ image.imgDatd }}</i>
              <span>{{ image.imgText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片灯箱 -->
    <div v-if="lightboxVisible" class="lightbox-overlay" @click="closeLightbox">
      <div class="lightbox-container" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">×</button>
        
        <div class="lightbox-content">
          <img :src="currentImage.imgUrl" :alt="currentImage.imgText">
          
          <div class="lightbox-info">
            <h3>{{ currentImage.imgText }}</h3>
            <p class="lightbox-date">{{ currentImage.imgDatd }}</p>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <button 
          v-if="currentIndex > 0" 
          class="lightbox-nav lightbox-prev" 
          @click="prevImage"
        >
          ‹
        </button>
        <button 
          v-if="currentIndex < images.length - 1" 
          class="lightbox-nav lightbox-next" 
          @click="nextImage"
        >
          ›
        </button>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { app, ensureLogin } from '@/utils/cloudbase'

// 响应式数据
const images = ref([])
const loading = ref(true)
const lightboxVisible = ref(false)
const currentImage = ref({})
const currentIndex = ref(0)
const isAuthenticated = ref(false)

// 站点配置
const siteConfig = ref({
  animation: true
})

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

// 获取恋爱相册数据
const fetchLoveImages = async () => {
  try {
    loading.value = true
    
    // 确保身份验证
    const authSuccess = await authenticate()
    if (!authSuccess) {
      throw new Error('身份验证失败')
    }
    
    
    
    // 调用云函数获取相册数据
    const result = await app.callFunction({
      name: 'loveImg',
      data: {
        action: 'getPhotos',
        page: 1,
        limit: 20
      }
    })
    
    
    
    if (result.result && result.result.success) {
      const data = result.result.data
      
      
      // 处理数据格式
      const processedImages = data.list.map(item => ({
        id: item._id || item.id,
        imgUrl: item.fullImageUrl || item.imgUrl,
        imgText: item.imgText || '无标题',
        imgDatd: item.formattedDate || item.imgDatd || '未知日期'
      }))
      
      images.value = processedImages
      
    } else {
      
      images.value = []
    }
    
  } catch (error) {
    
    images.value = []
  } finally {
    loading.value = false
  }
}

// 打开灯箱
const openLightbox = (image, index) => {
  currentImage.value = image
  currentIndex.value = index
  lightboxVisible.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭灯箱
const closeLightbox = () => {
  lightboxVisible.value = false
  document.body.style.overflow = 'auto'
}

// 上一张图片
const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    currentImage.value = images.value[currentIndex.value]
  }
}

// 下一张图片
const nextImage = () => {
  if (currentIndex.value < images.value.length - 1) {
    currentIndex.value++
    currentImage.value = images.value[currentIndex.value]
  }
}

// 图片加载成功
const onImageLoad = (event) => {
  event.target.classList.add('loaded')
}

// 图片加载失败
const onImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x300?text=图片加载失败'
  event.target.classList.add('error')
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (!lightboxVisible.value) return
  
  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// 生命周期
onMounted(() => {
  fetchLoveImages()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
/* 页面容器 */
.love-img-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
}

/* 标题样式 */
.text-ce {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 3rem 0 2rem;
  padding-top: 80px;
  font-family: 'Noto Serif SC', serif;
}

/* 容器样式 */
.central {
  max-width: 1200px ;
  margin: 2rem auto ;
  padding: 0 2rem ;
  width: 100% ;
}

/* 行布局 */
.row {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 1.5rem;
  width: 100% !important;
  max-width: 1200px !important;
}

/* 图片卡片 - 美化版本 */
.img_card {
  flex: 0 0 calc(33.333% - 1rem);
  max-width: calc(33.333% - 1rem);
  margin: 0 !important;
  padding: 0;
  background: rgba(255, 255, 255, 0.95);
  box-sizing: border-box;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  overflow: hidden;
}

.img_card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.img_card:active {
  transform: translateY(-4px);
}

/* 恋爱图片容器 */
.love_img {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: none;
}

.love_img img {
  width: 20rem;
  height: 20rem;
  border-radius: 0.8rem;
  object-fit: cover;
  box-shadow: 0 0px 25px #857d7d78;
  margin-top: 0.8rem;
  margin-bottom: 0.8rem;
  transition: all 0.23s linear;
  opacity: 0;
}

.love_img img.loaded {
  opacity: 1;
}

.love_img img.error {
  opacity: 0.5;
  filter: grayscale(100%);
}

.img_card:hover img {
  transform: translateY(-5px);
  box-shadow: 0 2px 10px #3b3b3bad;
}

/* 文字描述 - 保持原有样式但稍作美化 */
.words {
  padding: 0 1rem 1rem 1rem;
  width: 100%;
}

.words i {
  display: block;
  text-align: right;
  font-style: normal;
  font-family: 'Noto Serif SC', serif;
  font-weight: 400;
  color: #999;
  padding-bottom: 0.8rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px dashed #d7d7d7;
}

.words span {
  font-family: 'Noto Serif SC', serif;
  font-weight: 400;
  font-size: 1.05rem;
  color: #454040;
  letter-spacing: 1px;
  margin-top: 1rem;
  line-height: 1.5em;
  transition: color 0.23s linear;
}

.img_card:hover .words span {
  color: #e2e2e2;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
  width: 100%;
}

.loading-spinner {
  font-size: 1.2rem;
  color: #ff6b6b;
  position: relative;
}

.loading-spinner::after {
  content: '';
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid #ff6b6b;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  width: 100%;
}

.empty-content {
  text-align: center;
  max-width: 300px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #ddd;
  margin-bottom: 1.5rem;
}

.empty-content h3 {
  font-size: 1.4rem;
  color: #666;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.empty-content p {
  color: #999;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

/* 灯箱样式 - 优化版本 */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  padding: 2rem;
  box-sizing: border-box;
}

.lightbox-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  animation: zoomIn 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.8rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.lightbox-content {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.lightbox-content img {
  width: 100%;
  max-width: 100%;
  max-height: calc(90vh - 120px);
  height: auto;
  object-fit: contain;
  display: block;
}

.lightbox-info {
  padding: 1.5rem;
  background: white;
}

.lightbox-info h3 {
  font-size: 1.3rem;
  color: #333;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.lightbox-date {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

/* 导航按钮 */
.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.lightbox-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.lightbox-prev {
  left: 1rem;
}

.lightbox-next {
  right: 1rem;
}

/* 动画 */
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.zoomIn {
  animation-name: zoomIn;
}

.delay-03s {
  animation-delay: 0.3s;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  50% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 响应式设计 - 优化版本 */
@media (max-width: 1024px) and (min-width: 769px) {
  .img_card {
    flex: 0 0 calc(50% - 0.75rem);
    max-width: calc(50% - 0.75rem);
  }
  
  .love_img img {
    height: 240px;
  }
}

@media (max-width: 768px) {
  .central {
    padding: 0 1rem !important;
  }
  
  .text-ce {
    font-size: 1.8rem;
    margin: 2rem 0 1.5rem;
    padding-top: 60px;
  }
  
  .row {
    gap: 1rem;
  }
  
  .img_card {
    flex: 0 0 calc(50% - 0.5rem);
    max-width: calc(50% - 0.5rem);
  }
  
  .love_img img {
    height: 200px;
  }
  
  .lightbox-overlay {
    padding: 1rem;
  }
  
  .lightbox-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .lightbox-content img {
    max-height: calc(95vh - 100px);
  }
  
  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .lightbox-prev {
    left: 0.5rem;
  }
  
  .lightbox-next {
    right: 0.5rem;
  }
}

@media (max-width: 480px) {
  .text-ce {
    font-size: 1.6rem;
  }
  
  .row {
    gap: 0.8rem;
  }
  
  .img_card {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .love_img img {
    height: 250px;
  }
  
  .words {
    padding: 1rem;
  }
  
  .words span {
    font-size: 0.95rem;
  }
  
  .lightbox-overlay {
    padding: 0.5rem;
  }
  
  .lightbox-content img {
    max-height: calc(100vh - 80px);
  }
  
  .lightbox-info {
    padding: 1rem;
  }
  
  .lightbox-info h3 {
    font-size: 1.1rem;
  }
}

/* Bootstrap网格类兼容 */
.col-lg-4, 
.col-md-6, 
.col-sm-12, 
.col-sm-x-12 {
  /* 由flex布局控制，这里保留类名兼容性 */
}
</style>