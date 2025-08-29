<template>
  <div class="about-page">
    <Header />
    
    <div id="pjax-container">
      <div class="page-container">
        <h4 class="text-ce central">与 <i>{{ aboutData.title }}</i> 小站对话中...</h4>
        
        <div class="central central-600">
          <div class="botui-app-container" id="botui-app">
            <!-- 聊天消息容器 -->
            <div class="chat-container">
              <!-- 消息列表 -->
              <div 
                v-for="(message, index) in messages" 
                :key="index"
                class="message-item"
                :class="{ 'bot-message': message.type === 'bot', 'user-message': message.type === 'user' }"
              >
                <div class="message-bubble">
                  <div v-if="message.isImage" class="message-image">
                    <img :src="message.content" :alt="message.alt" />
                  </div>
                  <div v-else class="message-text" v-html="message.content"></div>
                </div>
              </div>
              
              <!-- 按钮组 -->
              <div v-if="showButtons && currentButtons.length > 0" class="button-group">
                <button 
                  v-for="button in currentButtons" 
                  :key="button.value"
                  @click="handleButtonClick(button.value)"
                  class="chat-button"
                  :disabled="isTyping"
                >
                  {{ button.text }}
                </button>
              </div>
              
              <!-- 打字指示器 -->
              <div v-if="isTyping" class="typing-indicator">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { app, ensureLogin } from '@/utils/cloudbase'

// 响应式数据
const messages = ref([])
const showButtons = ref(false)
const currentButtons = ref([])
const isTyping = ref(false)
const isAuthenticated = ref(false)
const aboutData = ref({
  title: 'Like Girl',
  aboutimg: 'https://img1.baidu.com/it/u=3689362535,1054252431&fm=253&app=138&f=JPEG?w=1422&h=800',
  info1: '你好！欢迎来到我们的小站 ✨',
  info2: '这里记录着我们的美好时光和甜蜜回忆',
  info3: '想要了解更多关于我们的故事吗？',
  btn1: '当然想了解！',
  btn2: '算了，告辞',
  infox1: '太好了！让我来为你介绍一下吧～',
  infox2: '这个网站是我们用来记录恋爱点滴的地方',
  infox3: '在这里你可以看到我们的照片、文章和各种美好回忆',
  infox4: '每一个页面都承载着我们的故事',
  infox5: '从相识到相恋，从平凡到浪漫',
  infox6: '希望我们的故事能给你带来一些温暖',
  btnx2: '继续了解',
  infof1: '关于网站的功能介绍：',
  infof2: '📝 恋爱小记 - 记录我们的点点滴滴',
  infof3: '📷 相册展示 - 珍藏美好瞬间',
  infof4: '💌 留言板 - 收集朋友们的祝福',
  btnf3: '还有什么吗？',
  infod1: '当然还有！',
  infod2: '这个网站使用了现代化的技术栈',
  infod3: 'Vue.js + CloudBase 打造的全栈应用',
  infod4: '响应式设计，支持各种设备访问',
  infod5: '希望你喜欢我们的小站！'
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

// 获取关于页面数据
const fetchAboutData = async () => {
  try {
    // 确保身份验证
    const authSuccess = await authenticate()
    if (!authSuccess) {
      return
    }
    
    
    // 调用云函数获取about数据
    const result = await app.callFunction({
      name: 'settings',
      data: { 
        action: 'getSettings',
        data: { type: 'about' }
      }
    })
    
    
    if (result.result && result.result.success) {
      const aboutInfo = result.result.data[0] || {}
      
      // 更新aboutData，保留默认值作为回退
      aboutData.value = {
        title: aboutInfo.title || aboutData.value.title,
        aboutimg: aboutInfo.aboutimg || aboutData.value.aboutimg,
        info1: aboutInfo.info1 || aboutData.value.info1,
        info2: aboutInfo.info2 || aboutData.value.info2,
        info3: aboutInfo.info3 || aboutData.value.info3,
        btn1: aboutInfo.btn1 || aboutData.value.btn1,
        btn2: aboutInfo.btn2 || aboutData.value.btn2,
        infox1: aboutInfo.infox1 || aboutData.value.infox1,
        infox2: aboutInfo.infox2 || aboutData.value.infox2,
        infox3: aboutInfo.infox3 || aboutData.value.infox3,
        infox4: aboutInfo.infox4 || aboutData.value.infox4,
        infox5: aboutInfo.infox5 || aboutData.value.infox5,
        infox6: aboutInfo.infox6 || aboutData.value.infox6,
        btnx2: aboutInfo.btnx2 || aboutData.value.btnx2,
        infof1: aboutInfo.infof1 || aboutData.value.infof1,
        infof2: aboutInfo.infof2 || aboutData.value.infof2,
        infof3: aboutInfo.infof3 || aboutData.value.infof3,
        infof4: aboutInfo.infof4 || aboutData.value.infof4,
        btnf3: aboutInfo.btnf3 || aboutData.value.btnf3,
        infod1: aboutInfo.infod1 || aboutData.value.infod1,
        infod2: aboutInfo.infod2 || aboutData.value.infod2,
        infod3: aboutInfo.infod3 || aboutData.value.infod3,
        infod4: aboutInfo.infod4 || aboutData.value.infod4,
        infod5: aboutInfo.infod5 || aboutData.value.infod5
      }
      
    } else {
    }
    
  } catch (error) {
  }
}

// 添加消息
const addMessage = async (content, type = 'bot', delay = 0, isImage = false, alt = '') => {
  if (delay > 0) {
    isTyping.value = true
    await new Promise(resolve => setTimeout(resolve, delay))
    isTyping.value = false
  }
  
  messages.value.push({
    content,
    type,
    isImage,
    alt,
    timestamp: Date.now()
  })
  
  // 滚动到底部
  await nextTick()
  scrollToBottom()
}

// 显示按钮
const showButtonGroup = (buttons, delay = 0) => {
  setTimeout(() => {
    currentButtons.value = buttons
    showButtons.value = true
  }, delay)
}

// 隐藏按钮
const hideButtons = () => {
  showButtons.value = false
  currentButtons.value = []
}

// 处理按钮点击
const handleButtonClick = async (value) => {
  hideButtons()
  
  if (value === 'and') {
    await continueConversation()
  } else if (value === 'gg') {
    await addMessage('告辞')
  } else if (value === 'next') {
    await continueToFeatures()
  } else if (value === 'more') {
    await continueToTech()
  }
}

// 继续对话
const continueConversation = async () => {
  await addMessage(aboutData.value.infox1, 'bot', 1500)
  await addMessage(aboutData.value.infox2, 'bot', 1500)
  await addMessage(aboutData.value.infox3, 'bot', 1500)
  await addMessage(aboutData.value.infox4, 'bot', 1500)
  await addMessage(aboutData.value.infox5, 'bot', 1500)
  await addMessage(aboutData.value.infox6, 'bot', 1500)
  
  showButtonGroup([
    { text: aboutData.value.btnx2, value: 'next' }
  ], 1500)
}

// 继续到功能介绍
const continueToFeatures = async () => {
  await addMessage(aboutData.value.infof1, 'bot', 1500)
  await addMessage(aboutData.value.infof2, 'bot', 1500)
  await addMessage(aboutData.value.infof3, 'bot', 1500)
  await addMessage(aboutData.value.infof4, 'bot', 1500)
  
  showButtonGroup([
    { text: aboutData.value.btnf3, value: 'more' }
  ], 1500)
}

// 继续到技术介绍
const continueToTech = async () => {
  await addMessage(aboutData.value.infod1, 'bot', 1500)
  await addMessage(aboutData.value.infod2, 'bot', 1500)
  await addMessage(aboutData.value.infod3, 'bot', 1500)
  await addMessage(aboutData.value.infod4, 'bot', 1500)
  await addMessage(aboutData.value.infod5, 'bot', 1500)
  await addMessage('本次会话结束...', 'bot', 1500)
}

// 滚动到底部
const scrollToBottom = () => {
  const container = document.querySelector('.chat-container')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// 开始对话
const startConversation = async () => {
  await addMessage(aboutData.value.info1, 'bot', 200)
  await addMessage(aboutData.value.info2, 'bot', 1000)
  await addMessage(aboutData.value.info3, 'bot', 1000)
  
  showButtonGroup([
    { text: aboutData.value.btn1, value: 'and' },
    { text: aboutData.value.btn2, value: 'gg' }
  ], 1500)
}

// 生命周期
onMounted(async () => {
  await fetchAboutData()
  await startConversation()
})
</script>

<style scoped>
/* 页面容器 */
.about-page {
  min-height: 100vh;
  background-image: linear-gradient(to right, rgba(37, 82, 110, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(37, 82, 110, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: #f8f9fa;
}

.page-container {
  min-height: calc(100vh - 200px);
  position: relative;
}

.page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

/* 标题样式 */
.text-ce {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  margin: 2rem 0;
  padding-top: 80px;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.text-ce i {
  color: #ffd700;
  font-style: normal;
  font-weight: 700;
}

/* 容器样式 */
.central {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 2rem;
  position: relative;
  z-index: 2;
}

.central-600 {
  padding: 0;
}

/* 聊天容器 */
.botui-app-container {
  position: relative;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.botui-app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: v-bind("'url(' + aboutData.aboutimg + ')'");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  z-index: -2;
}

.botui-app-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  z-index: -1;
}

.chat-container {
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem 0;
}

/* 消息样式 */
.message-item {
  margin-bottom: 1.5rem;
  display: flex;
  animation: fadeInUp 0.5s ease;
}

.bot-message {
  justify-content: flex-start;
}

.user-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 80%;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.bot-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-left-radius: 6px;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.bot-message .message-bubble::before {
  content: '';
  position: absolute;
  left: -8px;
  bottom: 8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 8px 8px 0;
  border-color: transparent #667eea transparent transparent;
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
  border-bottom-right-radius: 6px;
  box-shadow: 0 6px 20px rgba(252, 182, 159, 0.3);
}

.user-message .message-bubble::before {
  content: '';
  position: absolute;
  right: -8px;
  bottom: 8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 8px 8px;
  border-color: transparent transparent #ffecd2 transparent;
}

.message-text {
  line-height: 1.6;
  font-size: 1rem;
  font-weight: 500;
}

.message-image img {
  max-width: 200px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.chat-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  position: relative;
  overflow: hidden;
}

.chat-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.chat-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.5);
}

.chat-button:hover:not(:disabled)::before {
  left: 100%;
}

.chat-button:active {
  transform: translateY(-1px);
}

.chat-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.typing-dots {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  border-bottom-left-radius: 5px;
  display: flex;
  gap: 0.3rem;
  align-items: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .central {
    padding: 0 1rem;
  }
  
  .text-ce {
    font-size: 1.5rem;
    margin: 1.5rem 0;
    padding-top: 40px;
  }
  
  .botui-app-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .chat-container {
    max-height: 500px;
  }
  
  .message-bubble {
    max-width: 90%;
    padding: 0.8rem 1.2rem;
  }
  
  .button-group {
    flex-direction: column;
    align-items: center;
  }
  
  .chat-button {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .text-ce {
    font-size: 1.3rem;
  }
  
  .botui-app-container {
    margin: 0.5rem;
    padding: 1rem;
  }
  
  .message-text {
    font-size: 0.9rem;
  }
  
  .chat-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>