<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">Like Girl 管理后台</h2>
          <p class="login-subtitle">愿得一人心 白首不相离</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              class="form-control"
              placeholder="请输入用户名"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              class="form-control"
              placeholder="请输入密码"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group remember-group">
            <label class="checkbox-label">
              <input
                v-model="loginForm.remember"
                type="checkbox"
                :disabled="loading"
              />
              <span class="checkmark"></span>
              记住我
            </label>
          </div>
          
          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
        
        <div class="login-footer">
          <p>&copy; 2022-{{ currentYear }} Aicy All Rights Reserved.</p>
        </div>
      </div>
    </div>
    
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    
    const loginForm = ref({
      username: '',
      password: '',
      remember: false
    })
    
    const loading = ref(false)
    const error = ref('')
    const currentYear = computed(() => new Date().getFullYear())
    
    // 身份验证方法
    const authenticate = async () => {
      try {
        // 尝试匿名登录
        await ensureLogin()
        return true
      } catch (error) {
        return false
      }
    }

    // 登录处理
    const handleLogin = async () => {
      if (!loginForm.value.username || !loginForm.value.password) {
        error.value = '请输入用户名和密码'
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        // 先进行身份验证
        const authResult = await authenticate()
        if (!authResult) {
          error.value = '身份验证失败，请稍后重试'
          return
        }

        // 调用安全的auth云函数进行登录验证
        const result = await app.callFunction({
          name: 'auth',
          data: {
            action: 'adminLogin',
            data: {
              username: loginForm.value.username,
              password: loginForm.value.password
            }
          }
        })
        
        if (result.result && result.result.success) {
          // 登录成功，使用服务端返回的安全token
          const { token, userInfo } = result.result
          
          const loginInfo = {
            username: userInfo.username,
            name: userInfo.name,
            qq: userInfo.qq,
            loginTime: userInfo.loginTime,
            token: token
          }
          
          // 保存登录信息到本地存储
          localStorage.setItem('adminToken', token)
          localStorage.setItem('adminUser', JSON.stringify(loginInfo))
          
          if (loginForm.value.remember) {
            localStorage.setItem('rememberedUsername', loginForm.value.username)
          } else {
            localStorage.removeItem('rememberedUsername')
          }
          
          router.push('/admin')
        } else {
          // 显示服务端返回的错误信息
          error.value = result.result?.message || '登录失败，请重试'
          
          // 如果是IP被封禁或频率限制，给出特殊提示
          if (result.result?.code === 403) {
            error.value = '您的IP已被封禁，无法登录'
          } else if (result.result?.code === 429) {
            error.value = '登录尝试过于频繁，请稍后再试'
          }
        }
      } catch (err) {
        error.value = '登录失败，请检查网络连接'
      } finally {
        loading.value = false
      }
    }

    // 检查是否已经登录
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken')
      const userInfo = localStorage.getItem('adminUser')
      
      if (token && userInfo) {
        try {
          const user = JSON.parse(userInfo)
          const tokenData = JSON.parse(atob(token))
          
          // 检查token是否过期（24小时）
          const now = Date.now()
          const tokenTime = tokenData.timestamp
          const expireTime = 24 * 60 * 60 * 1000 // 24小时
          
          if (now - tokenTime < expireTime) {
            return true
          } else {
            // token过期，清除本地存储
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
          }
        } catch (error) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
        }
      }
      
      return false
    }

    // 组件挂载时检查登录状态
    onMounted(() => {
      // 检查是否已经登录
      if (checkAuth()) {
        router.push('/admin')
        return
      }
      
      // 如果记住了用户名，自动填充
      const rememberedUsername = localStorage.getItem('rememberedUsername')
      if (rememberedUsername) {
        loginForm.value.username = rememberedUsername
        loginForm.value.remember = true
      }
    })
    
    return {
      loginForm,
      loading,
      error,
      currentYear,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:disabled {
  background-color: #f8f9fa;
  opacity: 0.6;
}

.remember-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #e1e5e9;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 0.9rem;
  text-align: center;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.login-footer p {
  margin: 0;
  color: #999;
  font-size: 0.8rem;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 15px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>