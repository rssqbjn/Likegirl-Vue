<template>
  <div class="admin-leaving-settings-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="fas fa-comments"></i>
        前端留言页配置
      </h2>
      <p class="page-subtitle">管理留言显示设置、违禁词过滤和安全防护</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="settings-container">
      <div class="settings-card">

        <div class="card-content">
          <form class="settings-form" @submit.prevent="handleSubmit" novalidate>
            
            <!-- 显示设置区域 -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-eye"></i>
                显示设置
              </h4>
              
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-list-ol"></i>
                  显示最新N条留言
                </label>
                <div class="input-with-tip">
                  <input 
                    type="text" 
                    class="form-input" 
                    id="messageCount" 
                    placeholder="请输入需要截取的数量，如：20"
                    v-model="config.jiequ" 
                    required>
                  <div class="input-tip warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    请填纯数字，截取数量太多会影响加载速度
                  </div>
                </div>
              </div>
            </div>

            <!-- 内容过滤区域 -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-filter"></i>
                内容过滤设置
              </h4>
              
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-ban"></i>
                  拦截违禁词
                </label>
                <div class="input-with-tip">
                  <textarea 
                    v-model="config.lanjiezf" 
                    class="form-textarea" 
                    maxlength="225" 
                    rows="5"
                    placeholder="请输入违禁词，系统将自动过滤包含这些词语的留言"></textarea>
                  <div class="input-tip info">
                    <i class="fas fa-info-circle"></i>
                    可以填入需要拦截的词语，无需分隔符
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-shield-alt"></i>
                  拦截非法字符
                </label>
                <div class="input-with-tip">
                  <textarea 
                    class="form-textarea disabled" 
                    maxlength="225" 
                    rows="5" 
                    disabled
                    v-model="config.lanjie"
                    placeholder="请输入非法字符（请务必设置，否则无法过滤特殊字符，会存在XSS漏洞注入）"></textarea>
                  <div class="input-tip danger">
                    <i class="fas fa-lock"></i>
                    暂不支持修改，特殊字符拦截可以防止XSS注入，如要修改请到数据库更改
                  </div>
                </div>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button 
                class="btn btn-primary" 
                type="submit" 
                :disabled="submitting">
                <i class="fas fa-save"></i>
                {{ submitting ? '提交中...' : '提交修改' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="showSuccess" class="toast toast-success">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
      <button class="toast-close" @click="showSuccess = false">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div v-if="showError" class="toast toast-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
      <button class="toast-close" @click="showError = false">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { app, ensureLogin } from '@/utils/cloudbase'

export default {
  name: 'AdminLeavingSettingsPage',
  data() {
    return {
      config: {
        jiequ: '20',
        lanjiezf: '',
        lanjie: this.getDefaultBlockedChars()
      },
      submitting: false,
      fetching: false,
      authenticated: false,
      showSuccess: false,
      showError: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  methods: {
    getDefaultBlockedChars() {
      const blockedTags = [
        'script', 'iframe', 'frame', 'link', 'meta', 'style',
        'object', 'embed', 'applet', 'param', 'base', 'basefont'
      ]
      
      const blockedPatterns = [
        'javascript:', 'vbscript:', 'expression(', 
        'onload=', 'onmouseover=', 'onerror=', 'onclick='
      ]
      
      let result = []
      
      // 添加完整标签
      blockedTags.forEach(tag => {
        result.push(`<${tag}>`, `</${tag}>`)
      })
      
      // 添加不完整标签
      blockedTags.forEach(tag => {
        result.push(`<${tag}`)
      })
      
      // 添加其他模式
      result = result.concat(blockedPatterns)
      
      return result.join(',')
    },

    async doAuth() {
      try {
        await ensureLogin()
        this.authenticated = true
      } catch (error) {
        throw error
      }
    },

    async loadSettings() {
      this.fetching = true
      try {
        if (!this.authenticated) {
          await this.doAuth()
        }

        // 获取存储的token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          this.$router.push('/admin/login')
          return
        }
        
        const result = await app.callFunction({
          name: 'leaving',
          data: {
            action: 'getSettings',
            token: token
          }
        })

        if (result.result && result.result.success) {
          const data = result.result.data
          
          this.config = {
            jiequ: data.jiequ || '20',
            lanjiezf: data.lanjiezf || '',
            lanjie: data.lanjie || this.getDefaultBlockedChars()
          }

        }
      } catch (error) {
        this.showErrorMessage('获取设置数据失败，请刷新页面重试')
      } finally {
        this.fetching = false
      }
    },

    // 显示成功提示
    showSuccessMessage(message) {
      this.successMessage = message
      this.showSuccess = true
      setTimeout(() => {
        this.showSuccess = false
      }, 3000)
    },

    // 显示错误提示
    showErrorMessage(message) {
      this.errorMessage = message
      this.showError = true
      setTimeout(() => {
        this.showError = false
      }, 3000)
    },

    async handleSubmit() {
      if (this.submitting) return
      
      this.submitting = true
      
      try {
        if (!this.config.jiequ || isNaN(this.config.jiequ)) {
          this.showErrorMessage('请输入有效的截取数量（纯数字）')
          this.submitting = false
          return
        }

        if (!this.authenticated) {
          await this.doAuth()
        }

        // 获取存储的token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          this.showErrorMessage('认证已过期，请重新登录')
          this.$router.push('/admin/login')
          return
        }


        const result = await app.callFunction({
          name: 'leaving',
          data: {
            action: 'updateSettings',
            data: {
              jiequ: this.config.jiequ,
              lanjiezf: this.config.lanjiezf,
              lanjie: this.config.lanjie
            },
            token: token
          }
        })


        if (result.result && result.result.success) {
          this.showSuccessMessage('设置已更新')
        } else {
          this.showErrorMessage('更新失败: ' + (result.result?.message || '未知错误'))
        }
      } catch (error) {
        this.showErrorMessage('更新失败，请重试')
      } finally {
        this.submitting = false
      }
    }
  },

  async mounted() {
    try {
      await this.doAuth()
      await this.loadSettings()
    } catch (error) {
      this.showErrorMessage('初始化失败，请刷新页面重试')
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.admin-leaving-settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 10px;
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

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
  opacity: 0.8;
}

/* 设置容器 */
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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
  width: 100%;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
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
  margin-bottom: 20px;
  flex: 1;
  overflow-y: auto;
}

/* 表单样式 */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
  height: 100%;
}

.form-section {
  margin-bottom: 0px;
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.form-label i {
  color: #667eea;
  width: 16px;
}

.input-with-tip {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.form-textarea.disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 输入提示样式 */
.input-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.input-tip.info {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.input-tip.warning {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

.input-tip.danger {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
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
  .admin-leaving-settings-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .settings-card {
    height: calc(100vh - 120px);
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
  
  .form-textarea.disabled {
    background-color: #1a1a1a;
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

/* 消息提示样式 */
.toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 1000;
  padding: 16px 20px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: linear-gradient(135deg, #00b894, #00cec9);
}

.toast-error {
  background: linear-gradient(135deg, #e17055, #d63031);
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin-left: auto;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 - Toast */
@media (max-width: 768px) {
  .toast {
    top: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
  }
}
</style>
