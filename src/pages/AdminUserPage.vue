<template>
  <div class="admin-user-page">

    <!-- 主要内容区域 -->
    <div class="settings-container">
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="fas fa-cogs"></i>
          </div>
          <div class="card-title">
            <h3>系统配置管理</h3>
            <p>配置管理员信息、系统设置和自定义样式</p>
          </div>
        </div>
        
        <div class="card-content">

          <form class="settings-form" @submit.prevent="handleSubmit" novalidate>
            <!-- 基本设置区域 -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-user-circle"></i>
                基本信息设置
              </h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-toggle-on"></i>
                    前端加载动画
                  </label>
                  <select class="form-input" v-model="formData.animation">
                    <option value="1">开启</option>
                    <option value="2">关闭</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user"></i>
                    管理员姓名
                  </label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="请输入管理员姓名"
                    v-model="formData.userName" 
                    required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fab fa-qq"></i>
                  管理员QQ
                </label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="请输入管理员QQ号码"
                  v-model="formData.userQQ" 
                  required>
              </div>
            </div>

            <!-- 账号安全区域 -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-shield-alt"></i>
                账号安全设置
              </h4>
              
              <div class="form-group">
                <div class="form-label-with-status">
                  <label class="form-label">
                    <i class="fas fa-user-tag"></i>
                    管理员登录账号
                  </label>
                  <span 
                    class="status-badge danger" 
                    v-if="isDefaultAccount">
                    <i class="fas fa-exclamation-triangle"></i>
                    您的账号为默认账号，请尽快修改
                  </span>
                  <span 
                    class="status-badge success" 
                    v-else>
                    <i class="fas fa-check-circle"></i>
                    账号由大小写字母与数字组成
                  </span>
                </div>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="请输入需修改的管理员账号"
                  v-model="formData.adminName" 
                  required>
              </div>

              <div class="form-group">
                <div class="form-label-with-status">
                  <label class="form-label">
                    <i class="fas fa-lock"></i>
                    管理员登录密码
                  </label>
                  <span 
                    class="status-badge danger" 
                    v-if="isDefaultPasswordComputed">
                    <i class="fas fa-exclamation-triangle"></i>
                    您的密码为默认密码，请尽快修改
                  </span>
                  <span 
                    class="status-badge success" 
                    v-else>
                    <i class="fas fa-check-circle"></i>
                    密码由大小写字母与数字组成
                  </span>
                </div>
                <input 
                  class="form-input" 
                  type="password" 
                  v-model="formData.password"
                  placeholder="不修改请留空">
              </div>
            </div>

            <!-- 自定义样式区域 -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-paint-brush"></i>
                自定义样式设置
              </h4>
              
              <div class="form-group">
                <label class="form-label">
                  <i class="fab fa-css3-alt"></i>
                  自定义前端全局CSS样式
                  <span class="info-badge">请按CSS格式填写代码</span>
                </label>
                <textarea 
                  class="form-textarea" 
                  rows="6"
                  v-model="formData.cssCon"
                  placeholder="/* 这里可以写入自定义CSS样式内容 无需带 style 标签 */"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-code"></i>
                  自定义头部标签
                  <span class="info-badge">可填写HTML标签、CSS外链</span>
                </label>
                <textarea 
                  class="form-textarea" 
                  rows="5"
                  v-model="formData.headCon"
                  placeholder="<!-- 这里可以嵌入自定义字体CDN加速地址 -->"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fab fa-js-square"></i>
                  自定义底部标签
                  <span class="info-badge">可填写HTML标签、JS外链</span>
                </label>
                <textarea 
                  class="form-textarea" 
                  rows="5"
                  v-model="formData.footerCon"
                  placeholder="<!-- 这里可以嵌入自定义JavaScript代码 -->"></textarea>
              </div>
            </div>

            <!-- 安全验证区域 -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-key"></i>
                安全验证
              </h4>
              
              <div class="form-group">
                <div class="form-label-with-status">
                  <label class="form-label">
                    <i class="fas fa-shield-check"></i>
                    安全码
                  </label>
                  <span class="status-badge warning">
                    <i class="fas fa-exclamation-circle"></i>
                    修改敏感信息必须填写
                  </span>
                </div>
                <input 
                  type="password" 
                  class="form-input"
                  v-model="formData.securityCode"
                  placeholder="请输入数据库配置文件安全码">
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button 
                class="btn btn-primary" 
                type="submit" 
                :disabled="isSubmitting">
                <i class="fas fa-save"></i>
                {{ isSubmitting ? '提交中...' : '提交修改' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
    
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'
import { md5, isDefaultPassword, isDefaultUsername } from '../utils/crypto.js'
import CustomModal from '@/components/CustomModal.vue'
import { useModal } from '@/utils/useModal'

const router = useRouter()
const isAuthenticated = ref(false)
const isSubmitting = ref(false)

// 弹窗相关
const { modalState, showSuccess, showError, showWarning, showConfirm, closeModal, confirmModal, cancelModal } = useModal()

// 表单数据
const formData = reactive({
  animation: '1',
  userName: '',
  userQQ: '',
  adminName: '',
  password: '',
  cssCon: '',
  headCon: '',
  footerCon: '',
  securityCode: ''
})

// 原始数据，用于判断是否为默认值
const originalData = reactive({
  adminName: '',
  passwordHash: ''
})

// 计算属性：判断是否为默认账号和密码
const isDefaultAccount = computed(() => {
  return isDefaultUsername(originalData.adminName)
})

const isDefaultPasswordComputed = computed(() => {
  return isDefaultPassword(originalData.passwordHash)
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

// 获取配置数据
const fetchConfigData = async () => {
  try {
    const authSuccess = await authenticate()
    if (!authSuccess) {
      
      return
    }

    // 获取存储的token
    const token = localStorage.getItem('adminToken')
    if (!token) {
      
      router.push('/admin/login')
      return
    }

    

    // 分别获取text、diySet和login配置数据
    try {
      const textResult = await app.callFunction({
        name: 'settings',
        data: { 
          action: 'getSettings',
          data: { type: 'text' },
          token: token
        }
      })
      
      
      
      if (textResult.result && textResult.result.success && textResult.result.data) {
        const textConfig = textResult.result.data[0] || {}
        formData.animation = textConfig.Animation || '1'
        formData.userName = textConfig.userName || ''
        formData.userQQ = textConfig.userQQ || ''
      }
    } catch (error) {
      
    }

    try {
      const diyResult = await app.callFunction({
        name: 'settings',
        data: { 
          action: 'getSettings',
          data: { type: 'diySet' },
          token: token
        }
      })
      
      
      
      if (diyResult.result && diyResult.result.success && diyResult.result.data) {
        const diyConfig = diyResult.result.data[0] || {}
        formData.cssCon = diyConfig.cssCon || ''
        formData.headCon = diyConfig.headCon || ''
        formData.footerCon = diyConfig.footerCon || ''
      }
    } catch (error) {
      
    }

    try {
      const loginResult = await app.callFunction({
        name: 'settings',
        data: { 
          action: 'getSettings',
          data: { type: 'login' },
          token: token
        }
      })
      
      
      
      if (loginResult.result && loginResult.result.success && loginResult.result.data) {
        const loginConfig = loginResult.result.data[0] || {}
        formData.adminName = loginConfig.user || ''
        originalData.adminName = loginConfig.user || ''
        originalData.passwordHash = loginConfig.pw || ''
      }
    } catch (error) {
      
    }

    

  } catch (error) {
    
    showError('获取失败', '获取配置数据失败，请刷新页面重试')
  }
}

// 表单验证
const validateForm = () => {
  // 验证管理员账号
  if (!formData.adminName.trim()) {
    showError('验证失败', '请填写用户名')
    return false
  }

  // 验证账号格式
  const userRegex = /^[a-zA-Z0-9]+$/
  const specialCharRegex = /[`~!#$^&*()=|{}':;',\\[\].<>/?~！#￥……&*（）——|{}【】'；：""'。，、？]/

  if (specialCharRegex.test(formData.adminName)) {
    showError('验证失败', '用户名含有特殊字符，本次修改已拦截')
    return false
  }

  if (!userRegex.test(formData.adminName)) {
    showError('验证失败', '用户名只支持数字与英文大小写字母')
    return false
  }

  // 验证密码（如果填写了密码）
  if (formData.password.trim()) {
    if (formData.password.length <= 6) {
      showError('验证失败', '密码长度需大于六位数')
      return false
    }

    if (specialCharRegex.test(formData.password)) {
      showError('验证失败', '密码含有特殊字符，为了过滤SQL注入已拦截。请输入大小写字母与数字组成的密码')
      return false
    }
  }

  // 验证安全码
  if (!formData.securityCode.trim()) {
    showError('验证失败', '修改敏感信息必须填写安全码')
    return false
  }

  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const authSuccess = await authenticate()
    if (!authSuccess) {
      showError('认证失败', '身份验证失败，请重新登录')
      return
    }

    // 获取存储的token
    const token = localStorage.getItem('adminToken')
    if (!token) {
      showError('认证失败', '认证已过期，请重新登录')
      router.push('/admin/login')
      return
    }

    

    // 调用用户设置更新云函数
    const result = await app.callFunction({
      name: 'settings',
      data: {
        action: 'updateUserSettings',
        data: {
          // text表数据
          userName: formData.userName,
          userQQ: formData.userQQ,
          animation: formData.animation,
          // diySet表数据
          cssCon: formData.cssCon,
          headCon: formData.headCon,
          footerCon: formData.footerCon,
          // login表数据
          adminName: formData.adminName,
          password: formData.password, // 如果为空则不更新密码
          // 安全码
          securityCode: formData.securityCode
        },
        token: token
      }
    })

    

    if (result.result && result.result.success) {
      // 根据PHP逻辑处理不同的返回状态
      const statusCode = result.result.statusCode
      
      if (statusCode === '7') {
        showError('安全码错误', '安全码错误，修改失败')
        return
      }
      
      let successMessages = []
      let errorMessages = []
      
      // 检查登录信息更新状态
      if (statusCode.includes('1')) {
        successMessages.push('登录信息更新成功')
      } else if (statusCode.includes('0')) {
        errorMessages.push('登录信息更新失败')
      }
      
      // 检查基本信息更新状态
      if (statusCode.includes('3')) {
        successMessages.push('基本信息更新成功')
      } else if (statusCode.includes('4')) {
        errorMessages.push('基本信息更新失败')
      }
      
      // 检查自定义设置更新状态
      if (statusCode.includes('5')) {
        successMessages.push('自定义设置更新成功')
      } else if (statusCode.includes('6')) {
        errorMessages.push('自定义设置更新失败')
      }
      
      // 显示结果消息
      if (errorMessages.length > 0) {
        showError('部分更新失败', errorMessages.join('\n'))
      } else {
        showSuccess('配置更新成功', successMessages.join('\n'))
      }
      
      // 如果修改了密码，需要重新登录
      if (formData.password.trim()) {
        showWarning('密码已修改', '密码已修改，请重新登录')
        // 清除本地存储的登录状态
        localStorage.removeItem('adminToken')
        sessionStorage.clear()
        router.push('/admin/login')
      } else {
        // 重新加载配置数据
        await fetchConfigData()
        // 清空密码和安全码字段
        formData.password = ''
        formData.securityCode = ''
      }
    } else {
      const errorMsg = result.result?.message || '配置更新失败'
      showError('更新失败', errorMsg)
    }

  } catch (error) {
    
    showError('提交失败', '提交失败，请检查网络连接后重试')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await fetchConfigData()
})
</script>

<style scoped>
/* 全局样式 */
.admin-user-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: #2c3e50;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title i {
  margin-right: 15px;
  color: #667eea;
}

/* 设置容器 */
.settings-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 设置卡片样式 */
.settings-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  padding: 25px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.card-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  position: relative;
  z-index: 1;
}

.card-title {
  position: relative;
  z-index: 1;
}

.card-title h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.card-title p {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

/* 卡片内容 */
.card-content {
  padding: 30px;
}

/* 表单样式 */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label i {
  color: #667eea;
  width: 16px;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #2c3e50;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #95a5a6;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

/* 状态徽章 */
.status-badge-container {
  margin-bottom: 8px;
}

.form-label-with-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.danger {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.status-badge.success {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.status-badge.warning {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

.info-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 8px;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .settings-container {
    max-width: 100%;
    padding: 0 10px;
  }
}

@media (max-width: 768px) {
  .admin-user-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .card-header {
    padding: 20px;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .card-icon {
    margin-right: 0;
  }
  
  .form-actions {
    justify-content: center;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .settings-card {
    background: rgba(30, 30, 30, 0.95);
    color: #e0e0e0;
  }
  
  .form-input,
  .form-textarea {
    background: #2c2c2c;
    border-color: #404040;
    color: #e0e0e0;
  }
  
  .form-label {
    color: #e0e0e0;
  }
  
  .section-title {
    color: #e0e0e0;
    border-bottom-color: #404040;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.8);
}
</style>