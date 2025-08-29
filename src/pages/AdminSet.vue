<template>
  <div class="admin-set">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="fas fa-cog"></i>
        系统设置管理
      </h2>
      <p class="page-subtitle">配置网站基本信息、情侣信息和卡片展示内容</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="settings-container">
      <!-- 上方两个卡片 -->
      <div class="top-cards">
        <!-- 基本设置卡片 -->
        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon">
              <i class="fas fa-globe"></i>
            </div>
            <div class="card-title">
              <h3>基本设置</h3>
              <p>网站基础信息配置</p>
            </div>
          </div>
          
          <div class="card-content">
            <form @submit.prevent="submitBasicSettings" class="settings-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-heading"></i>
                    站点标题
                  </label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="请输入站点标题"
                    v-model="basicSettings.title" 
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-image"></i>
                    站点LOGO
                  </label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="请填写站点LOGO文字"
                    v-model="basicSettings.logo" 
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-quote-left"></i>
                  站点文案
                </label>
                <input 
                  type="text" 
                  class="form-input" 
                  placeholder="显示在顶部的文案"
                  v-model="basicSettings.writing" 
                  required
                />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-blur"></i>
                    头像背景高斯模糊
                  </label>
                  <select class="form-select" v-model="basicSettings.webBlur">
                    <option value="1">开启</option>
                    <option value="2">关闭</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-bolt"></i>
                    前端无刷新加载
                  </label>
                  <select class="form-select" v-model="basicSettings.webPjax">
                    <option value="1">开启</option>
                    <option value="2">关闭</option>
                  </select>
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  class="btn btn-primary" 
                  type="submit"
                  :disabled="loading.basic"
                >
                  <i class="fas fa-save"></i>
                  {{ loading.basic ? '保存中...' : '保存设置' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 情侣配置卡片 -->
        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon love-icon">
              <i class="fas fa-heart"></i>
            </div>
            <div class="card-title">
              <h3>情侣配置</h3>
              <p>设置情侣双方信息</p>
            </div>
          </div>
          
          <div class="card-content">
            <form @submit.prevent="submitLoveSettings" class="settings-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-mars"></i>
                    男主姓名
                  </label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="请输入男主姓名"
                    v-model="loveSettings.boy" 
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-venus"></i>
                    女主姓名
                  </label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="请输入女主姓名"
                    v-model="loveSettings.girl" 
                    required
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fab fa-qq"></i>
                    男主QQ
                  </label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="用于显示头像"
                    v-model="loveSettings.boyimg" 
                    required
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">
                    <i class="fab fa-qq"></i>
                    女主QQ
                  </label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="用于显示头像"
                    v-model="loveSettings.girlimg" 
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-calendar-heart"></i>
                  恋爱开始时间
                </label>
                <input 
                  type="datetime-local" 
                  class="form-input" 
                  v-model="loveSettings.startTime" 
                  required
                />
              </div>
              
              <div class="form-actions">
                <button 
                  class="btn btn-primary" 
                  type="submit"
                  :disabled="loading.love"
                >
                  <i class="fas fa-save"></i>
                  {{ loading.love ? '保存中...' : '保存设置' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 底部卡片配置 -->
      <div class="bottom-card">
        <div class="settings-card full-width">
          <div class="card-header">
            <div class="card-icon card-icon-special">
              <i class="fas fa-th-large"></i>
            </div>
            <div class="card-title">
              <h3>卡片配置 & 版权设置</h3>
              <p>配置首页展示卡片和网站版权信息</p>
            </div>
          </div>
          
          <div class="card-content">
            <form @submit.prevent="submitCardSettings" class="settings-form">
              <!-- 背景设置 -->
              <div class="form-section">
                <h4 class="section-title">
                  <i class="fas fa-image"></i>
                  背景设置
                </h4>
                <div class="form-group">
                  <label class="form-label">背景图片URL地址</label>
                  <input 
                    type="url" 
                    class="form-input" 
                    placeholder="请输入背景图片URL地址"
                    v-model="cardSettings.bgimg" 
                    required
                  />
                </div>
              </div>

              <!-- 卡片配置 -->
              <div class="form-section">
                <h4 class="section-title">
                  <i class="fas fa-th-large"></i>
                  卡片配置
                </h4>
                <div class="cards-config">
                  <div class="card-config-item">
                    <h5 class="card-config-title">卡片 1</h5>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">卡片名称</label>
                        <input 
                          type="text" 
                          class="form-input" 
                          placeholder="请输入卡片名称"
                          v-model="cardSettings.card1" 
                          required
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">卡片描述</label>
                        <input 
                          type="text" 
                          class="form-input" 
                          placeholder="请输入卡片描述"
                          v-model="cardSettings.deci1" 
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div class="card-config-item">
                    <h5 class="card-config-title">卡片 2</h5>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">卡片名称</label>
                        <input 
                          type="text" 
                          class="form-input" 
                          placeholder="请输入卡片名称"
                          v-model="cardSettings.card2" 
                          required
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">卡片描述</label>
                        <input 
                          type="text" 
                          class="form-input" 
                          placeholder="请输入卡片描述"
                          v-model="cardSettings.deci2" 
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div class="card-config-item">
                    <h5 class="card-config-title">卡片 3</h5>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">卡片名称</label>
                        <input 
                          type="text" 
                          class="form-input" 
                          placeholder="请输入卡片名称"
                          v-model="cardSettings.card3" 
                          required
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">卡片描述</label>
                        <input 
                          type="text" 
                          class="form-input" 
                          placeholder="请输入卡片描述"
                          v-model="cardSettings.deci3" 
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 版权信息 -->
              <div class="form-section">
                <h4 class="section-title">
                  <i class="fas fa-copyright"></i>
                  版权信息
                </h4>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">域名备案号</label>
                    <input 
                      type="text" 
                      class="form-input" 
                      placeholder="没有请留空"
                      v-model="cardSettings.icp"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">站点版权信息</label>
                    <input 
                      type="text" 
                      class="form-input" 
                      placeholder="请输入站点版权信息"
                      v-model="cardSettings.copyright" 
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button 
                  class="btn btn-primary" 
                  type="submit"
                  :disabled="loading.card"
                >
                  <i class="fas fa-save"></i>
                  {{ loading.card ? '保存中...' : '保存设置' }}
                </button>
              </div>
            </form>
          </div>
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
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { app, ensureLogin } from '@/utils/cloudbase'

export default {
  name: 'AdminSet',
  setup() {
    const store = useStore()
    


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

    // 基本设置数据 (对应PHP中的$text数组)
    const basicSettings = ref({
      title: '',
      logo: '',
      writing: '',
      webBlur: '1',
      webPjax: '1'
    })

    // 情侣配置数据 (对应PHP中的$text数组)
    const loveSettings = ref({
      boy: '',
      girl: '',
      boyimg: '',
      girlimg: '',
      startTime: ''
    })

    // 卡片配置数据 (对应PHP中的$text数组)
    const cardSettings = ref({
      bgimg: '',
      card1: '',
      deci1: '',
      card2: '',
      deci2: '',
      card3: '',
      deci3: '',
      icp: '',
      copyright: ''
    })

    // 自定义设置数据 (对应PHP中的$diy数组)
    const diySettings = ref({
      Blurkg: '1',
      Pjaxkg: '1'
    })

    // 加载状态
    const loading = ref({
      basic: false,
      love: false,
      card: false
    })

    // 提示信息
    const showSuccess = ref(false)
    const showError = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    // 显示成功提示
    const showSuccessMessage = (message) => {
      successMessage.value = message
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }

    // 显示错误提示
    const showErrorMessage = (message) => {
      errorMessage.value = message
      showError.value = true
      setTimeout(() => {
        showError.value = false
      }, 3000)
    }

    // 加载设置数据
    const loadSettings = async () => {
      try {
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          
          this.$router.push('/admin/login')
          return
        }

        // 调用云函数获取所有设置数据
        const result = await app.callFunction({
          name: 'settings',
          data: {
            action: 'getSettings',
            token: token
          }
        })

        

        if (result.result && result.result.success) {
          const data = result.result.data
          
          // 基本设置数据 (text集合)
          if (data.text) {
            basicSettings.value = {
              title: data.text.title || '',
              logo: data.text.logo || '',
              writing: data.text.writing || '',
              webBlur: basicSettings.value.webBlur,
              webPjax: basicSettings.value.webPjax
            }

            // 情侣配置数据 (也在text集合中)
            loveSettings.value = {
              boy: data.text.boy || '',
              girl: data.text.girl || '',
              boyimg: data.text.boyimg || '',
              girlimg: data.text.girlimg || '',
              startTime: data.text.startTime || ''
            }

            // 卡片配置数据 (也在text集合中)
            cardSettings.value = {
              bgimg: data.text.bgimg || '',
              card1: data.text.card1 || '',
              deci1: data.text.deci1 || '',
              card2: data.text.card2 || '',
              deci2: data.text.deci2 || '',
              card3: data.text.card3 || '',
              deci3: data.text.deci3 || '',
              icp: data.text.icp || '',
              copyright: data.text.Copyright || ''
            }
          }

          // 获取自定义设置 (diySet集合)
          const diyResult = await app.callFunction({
            name: 'settings',
            data: {
              action: 'getDiySettings',
              token: token
            }
          })

          if (diyResult.result && diyResult.result.success) {
            const diyData = diyResult.result.data
            diySettings.value = {
              Blurkg: diyData.Blurkg || '1',
              Pjaxkg: diyData.Pjaxkg || '1'
            }

            // 更新基本设置中的对应字段
            basicSettings.value.webBlur = diySettings.value.Blurkg
            basicSettings.value.webPjax = diySettings.value.Pjaxkg
          }

          
        } else {
          
          showErrorMessage('获取设置失败: ' + (result.result?.message || '未知错误'))
        }
      } catch (error) {
        
        showErrorMessage('加载设置失败，请刷新页面重试')
      }
    }

    // 提交基本设置 (对应PHP中的adminPost.php)
    const submitBasicSettings = async () => {
      loading.value.basic = true
      try {
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          
          this.$router.push('/admin/login')
          return
        }

        // 更新text集合中的基本设置
        const textResult = await app.callFunction({
          name: 'settings',
          data: {
            action: 'updateSettings',
            type: 'text',
            settings: {
              title: basicSettings.value.title,
              logo: basicSettings.value.logo,
              writing: basicSettings.value.writing
            },
            token: token
          }
        })

        // 更新diySet集合中的自定义设置
        const diyResult = await app.callFunction({
          name: 'settings',
          data: {
            action: 'updateDiySettings',
            settings: {
              Blurkg: basicSettings.value.webBlur,
              Pjaxkg: basicSettings.value.webPjax
            },
            token: token
          }
        })

        if (textResult.result?.success && diyResult.result?.success) {
          
          showSuccessMessage('基本设置保存成功！')
        } else {
          const errorMsg = textResult.result?.message || diyResult.result?.message || '保存失败'
          
          showErrorMessage('保存基本设置失败: ' + errorMsg)
        }
      } catch (error) {
        
        showErrorMessage('保存基本设置失败，请重试')
      } finally {
        loading.value.basic = false
      }
    }

    // 提交情侣配置 (对应PHP中的loveadminPost.php)
    const submitLoveSettings = async () => {
      loading.value.love = true
      try {
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          
          this.$router.push('/admin/login')
          return
        }

        // 调用云函数更新情侣配置
        const result = await app.callFunction({
          name: 'settings',
          data: {
            action: 'updateSettings',
            type: 'text',
            settings: {
              boy: loveSettings.value.boy,
              girl: loveSettings.value.girl,
              boyimg: loveSettings.value.boyimg,
              girlimg: loveSettings.value.girlimg,
              startTime: loveSettings.value.startTime
            },
            token: token
          }
        })

        if (result.result && result.result.success) {
          
          showSuccessMessage('情侣配置保存成功！')
        } else {
          
          showErrorMessage('保存情侣配置失败: ' + (result.result?.message || '未知错误'))
        }
      } catch (error) {
        
        showErrorMessage('保存情侣配置失败，请重试')
      } finally {
        loading.value.love = false
      }
    }

    // 提交卡片配置 (对应PHP中的CardadminPost.php)
    const submitCardSettings = async () => {
      loading.value.card = true
      try {
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          
          this.$router.push('/admin/login')
          return
        }

        // 调用云函数更新卡片配置
        const result = await app.callFunction({
          name: 'settings',
          data: {
            action: 'updateSettings',
            type: 'text',
            settings: {
              bgimg: cardSettings.value.bgimg,
              card1: cardSettings.value.card1,
              deci1: cardSettings.value.deci1,
              card2: cardSettings.value.card2,
              deci2: cardSettings.value.deci2,
              card3: cardSettings.value.card3,
              deci3: cardSettings.value.deci3,
              icp: cardSettings.value.icp,
              Copyright: cardSettings.value.copyright
            },
            token: token
          }
        })

        if (result.result && result.result.success) {
          
          showSuccessMessage('卡片配置保存成功！')
        } else {
          
          showErrorMessage('保存卡片配置失败: ' + (result.result?.message || '未知错误'))
        }
      } catch (error) {
        
        showErrorMessage('保存卡片配置失败，请重试')
      } finally {
        loading.value.card = false
      }
    }

    // 组件挂载时加载数据
    onMounted(async () => {
      try {
        // 先进行身份验证
        await authenticate()
        
        // 然后加载设置数据
        await loadSettings()
      } catch (error) {
        
        showErrorMessage('初始化失败，请刷新页面重试')
      }
    })

    return {
      basicSettings,
      loveSettings,
      cardSettings,
      loading,
      showSuccess,
      showError,
      successMessage,
      errorMessage,
      isAuthenticated,
      submitBasicSettings,
      submitLoveSettings,
      submitCardSettings
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.admin-set {
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

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  font-weight: 300;
  color: #5a6c7d;
}

/* 设置容器 */
.settings-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 上方两个卡片布局 */
.top-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

/* 底部卡片布局 */
.bottom-card {
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
}

.settings-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.full-width {
  width: 100%;
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  padding: 25px 30px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.love-icon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.card-icon-special {
  background: linear-gradient(135deg, #4834d4, #686de0);
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
  gap: 20px;
}

.form-section {
  margin-bottom: 30px;
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
.form-select {
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
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #95a5a6;
}

/* 卡片配置特殊样式 */
.cards-config {
  display: grid;
  gap: 25px;
}

.card-config-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.card-config-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-config-title::before {
  content: '📋';
  font-size: 1.2rem;
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

/* 消息提示 */
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .settings-container {
    max-width: 100%;
    padding: 0 10px;
  }
  
  .top-cards {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .admin-set {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .top-cards {
    grid-template-columns: 1fr;
    gap: 20px;
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
  
  .toast {
    top: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
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
  .form-select {
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
  
  .card-config-item {
    background: #2c2c2c;
  }
  
  .card-config-title {
    color: #e0e0e0;
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
