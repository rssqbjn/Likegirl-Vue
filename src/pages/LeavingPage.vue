<template>
  <div class="leaving-page">
    <Header />
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="container">
        <!-- 标题 -->
        <div class="page-title">
          <h1>留下你们的祝福</h1>
        </div>
        
        <!-- 统计信息 -->
        <div class="stats">
          已收到 <span class="count">{{ messages.length }}</span> 条祝福留言 
          <span class="note">(显示最新 {{ displayLimit }}条)</span>
        </div>

        <!-- 留言列表 -->
        <div class="messages-section">
          <div v-if="loading" class="loading">
            <div class="loading-spinner">正在加载留言...</div>
          </div>
          
          <div v-else-if="messages.length === 0" class="empty-state">
            <h3>还没有留言</h3>
            <p>快来留下第一条祝福吧！</p>
          </div>
          
          <div v-else class="messages-list">
            <div 
              v-for="(message, index) in messages" 
              :key="message.id"
              class="message-item"
              :class="{ 'animated fadeInUp': siteConfig.animation }"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <!-- 用户信息和时间信息 -->
              <div class="message-header">
                <div class="user-info">
                  <img :src="message.avatar" :alt="message.name" class="avatar">
                  <span class="username">{{ message.name }}</span>
                </div>
                <div class="message-time">
                  <span class="time">{{ formatTime(message.time) }}</span>
                  <span class="dot">•</span>
                  <span class="location">{{ message.location }}</span>
                </div>
              </div>
              
              <!-- 留言内容 -->
              <div class="message-body">
                <div class="message-text">
                  {{ message.content }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 留言表单 -->
        <div class="message-form-section">
          <div class="form-container">
            <!-- 用户信息输入 -->
            <div class="user-input">
              <img :src="form.avatar" alt="头像" class="form-avatar">
              <div class="input-group">
                <input 
                  v-model="form.qq" 
                  type="text" 
                  placeholder="请输入QQ号" 
                  class="qq-input"
                  @blur="getQQInfo"
                >
                <input 
                  v-model="form.name" 
                  type="text" 
                  placeholder="昵称" 
                  class="name-input"
                  readonly
                >
              </div>
            </div>
            
            <!-- 留言内容 -->
            <textarea 
              v-model="form.content" 
              placeholder="写下你的祝福..." 
              class="message-textarea"
              maxlength="200"
            ></textarea>
            
            <!-- 提交按钮 -->
            <div class="submit-section">
              <button 
                @click="submitMessage" 
                :disabled="submitting || !canSubmit"
                class="submit-btn"
              >
                <span v-if="submitting">提交中...</span>
                <span v-else>发送祝福</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动留言按钮 -->
    <div class="floating-btn" @click="scrollToForm">
      <svg class="message-icon" viewBox="0 0 1024 1024">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
        <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.4-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.8 41.3-19.8 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5 0-39.3-17.2-76-48.4-103.3z"/>
        <path d="M512 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"/>
      </svg>
    </div>

    <Footer />
    
    <!-- 自定义弹窗 -->
    <CustomModal
      :visible="modalState.visible"
      :title="modalState.title"
      :message="modalState.message"
      :type="modalState.type"
      @close="closeModal"
      @confirm="confirmModal"
      @cancel="cancelModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import CustomModal from '../components/CustomModal.vue'
import { app, ensureLogin } from '@/utils/cloudbase'
import { getUserEnvironmentInfo } from '@/utils/ipUtils'
import { useModal } from '@/utils/useModal'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const messages = ref([])
const isAuthenticated = ref(false)
const displayLimit = ref(10) // 显示条数，从后台获取

// 弹窗相关
const { modalState, showSuccess, showError, showWarning, showConfirm, closeModal, confirmModal, cancelModal } = useModal()


// 表单数据
const form = reactive({
  qq: '',
  name: '',
  avatar: 'https://q1.qlogo.cn/g?b=qq&nk=10000&s=100',
  content: ''
})

// 站点配置
const siteConfig = reactive({
  animation: true
})

// 计算属性
const canSubmit = computed(() => {
  return form.qq && form.name && form.content.trim() && 
         form.content.trim().length >= 5 && form.content.trim().length <= 200
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

// 方法
const formatTime = (timestamp) => {
  // 如果是字符串格式的时间戳，转换为数字
  const time = typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp
  const now = Date.now()
  const diff = now - time
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getQQInfo = async () => {
  if (!form.qq || !/^\d{5,11}$/.test(form.qq)) {
    form.name = ''
    form.avatar = 'https://q1.qlogo.cn/g?b=qq&nk=10000&s=100'
    return
  }
  
  try {
    // 获取QQ头像和昵称
    form.avatar = `https://q1.qlogo.cn/g?b=qq&nk=${form.qq}&s=100`
    form.name = `用户${form.qq.slice(-4)}`
  } catch (error) {
    
  }
}

const submitMessage = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  
  try {
    // 确保已经身份验证
    if (!isAuthenticated.value) {
      await authenticate()
    }
    
    // 获取用户环境信息（包括IP地址）
    const envInfo = await getUserEnvironmentInfo()
    
    // 调用云函数leaving添加留言，传递IP信息
    const result = await app.callFunction({
      name: 'leaving',
      data: {
        action: 'addMessage',
        data: {
          name: form.name,
          QQ: form.qq,
          text: form.content,
          // 从前端传递IP和位置信息
          clientIP: envInfo.ip,
          clientLocation: envInfo.location,
          browserInfo: `${envInfo.browser} ${envInfo.version}`,
          deviceInfo: envInfo.deviceType,
          userAgent: envInfo.userAgent
        }
      }
    })
    
    
    
    if (result.result && result.result.success) {
      const newMessage = result.result.data
      
      // 转换数据格式以适配前端显示
      const formattedMessage = {
        id: newMessage._id || newMessage.id,
        name: newMessage.name,
        avatar: newMessage.qqAvatar || `https://q1.qlogo.cn/g?b=qq&nk=${newMessage.QQ}&s=100`,
        content: newMessage.text,
        time: newMessage.time,
        location: newMessage.city || '未知'
      }
      
      // 添加新留言到列表顶部
      messages.value.unshift(formattedMessage)
      
      // 重置表单内容
      form.content = ''
      
      // 显示成功提示
      showToast('留言提交成功！', 'success')
      
      
    } else {
      
      showToast(result.result?.message || '提交失败，请重试', 'error')
    }
    
  } catch (error) {
    
    showToast('网络请求失败，请检查网络连接', 'error')
  } finally {
    submitting.value = false
  }
}

const scrollToForm = () => {
  const formSection = document.querySelector('.message-form-section')
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const showToast = (message, type = 'info') => {
  if (type === 'success') {
    showSuccess('操作成功', message)
  } else if (type === 'error') {
    showError('操作失败', message)
  } else {
    showWarning('提示', message)
  }
}

// 获取留言设置
const fetchLeavingSettings = async () => {
  try {
    const result = await app.callFunction({
      name: 'leaving',
      data: {
        action: 'getSettings'
      }
    })
    
    if (result.result && result.result.success) {
      const settings = result.result.data
      // 从设置中获取显示条数，默认为10
      displayLimit.value = parseInt(settings.jiequ) || 10
      
    } else {
      
      displayLimit.value = 10
    }
  } catch (error) {
    
    displayLimit.value = 10
  }
}

const fetchMessages = async () => {
  loading.value = true
  
  try {
    // 确保已经身份验证
    if (!isAuthenticated.value) {
      await authenticate()
    }
    
    
    
    // 调用云函数leaving获取留言列表，使用从后台获取的显示条数
    const result = await app.callFunction({
      name: 'leaving',
      data: {
        action: 'getMessages',
        page: 1,
        limit: displayLimit.value
      }
    })
    
    
    
    if (result.result && result.result.success) {
      const data = result.result.data
      
      // 转换数据格式以适配前端显示
      messages.value = data.list.map(msg => ({
        id: msg._id || msg.id,
        name: msg.name,
        avatar: msg.qqAvatar || `https://q1.qlogo.cn/g?b=qq&nk=${msg.QQ}&s=100`,
        content: msg.text,
        time: msg.time,
        location: msg.city || '未知'
      }))
      
      
    } else {
      
      messages.value = []
    }
    
  } catch (error) {
    
    messages.value = []
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(async () => {
  try {
    // 先进行身份验证
    await authenticate()
    // 获取留言设置（包含显示条数）
    await fetchLeavingSettings()
    // 再获取留言列表
    await fetchMessages()
  } catch (error) {
    
    loading.value = false
  }
})
</script>

<style scoped>
/* 页面容器 */
.leaving-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
}

/* 主要内容区域 */
.main-content {
  padding: 2rem 0;
  min-height: calc(100vh - 200px);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 页面标题 */
.page-title {
  text-align: center;
  margin: 0rem 0 2rem;
  padding-top: 0px;
}

.page-title h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: black;
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* 统计信息 */
.stats {
  text-align: center;
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 3rem;
}

.stats .count {
  color: #667eea;
  font-weight: bold;
  font-size: 1.2rem;
}

.stats .note {
  color: #777;
  font-size: 0.9rem;
}

/* 留言区域 */
.messages-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  font-size: 1.1rem;
  color: #667eea;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
}

.empty-state h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #555;
}

.empty-state p {
  color: #999;
  font-size: 0.95rem;
}

/* 留言列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-item {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.message-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.15);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #e0e6ff;
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.message-time {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: #666;
  height: fit-content;
}

.time {
  color: #666;
  padding: 0.25rem;
  border-radius: 10%;
}

.dot {
  width: 3px;
  height: 3px;
  background: #ccc;
  border-radius: 50%;
  display: inline-block;
}

.location {
  color: #888;
}


.message-text {
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e8ecf7;
}

/* 留言表单区域 */
.message-form-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

/* 用户信息输入 */
.user-input {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9ff;
  border-radius: 12px;
  border: 1px solid #e0e6ff;
}

.form-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #e0e6ff;
  flex-shrink: 0;
}

.input-group {
  display: flex;
  gap: 1rem;
  flex: 1;
  align-items: center;
}

.qq-input,
.name-input {
  flex: 1;
  padding: 0.75rem 0 0.75rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  height: 40px;
  box-sizing: border-box;
}

.qq-input:focus,
.name-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.name-input {
  background: #f5f5f5;
  color: #666;
}

/* 留言文本框 */
.message-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  margin-bottom: 1.5rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}

.message-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 提交区域 */
.submit-section {
  text-align: center;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* 浮动按钮 */
.floating-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1000;
}

.floating-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
}

.message-icon {
  width: 28px;
  height: 28px;
  fill: white;
}

/* 动画 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    margin: 2rem 0 1.5rem;
    padding-top: 60px;
  }
  
  .page-title h1 {
    font-size: 2rem;
  }
  
  .messages-section,
  .message-form-section {
    padding: 1.5rem;
    margin: 0 0.5rem 2rem;
  }
  
  .user-input {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .form-avatar {
    align-self: center;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .floating-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
  
  .message-icon {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .page-title h1 {
    font-size: 1.8rem;
  }
  
  .messages-section,
  .message-form-section {
    padding: 1.2rem;
  }
  
  .message-item {
    padding: 1.2rem;
  }
  
  .user-input {
    padding: 1.2rem;
  }
}
</style>