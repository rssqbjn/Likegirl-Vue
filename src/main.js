import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import AdminApp from './admin/AdminApp.vue'

// 导入路由配置
import frontendRouter from './router/index.js'
import adminRouter from './router/admin.js'

// 导入IP检测功能
import { initIPGuard, routeIPGuard, startIPMonitoring } from './utils/ipGuard.optimized.js'


// 导入样式
import './styles/admin.css'

// 创建store
const store = createStore({
  state: {
    user: null,
    isAuthenticated: false,
    siteInfo: {
      title: 'Like Girl',
      userQQ: '123456789',
      userName: '管理员'
    },
    stats: {
      leavingCount: 0,
      littleCount: 0,
      loveListCount: 0,
      loveImgCount: 0
    },
    loading: false,
    error: null
  },
  
  mutations: {
    setUser(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    
    clearUser(state) {
      state.user = null
      state.isAuthenticated = false
    },
    
    setSiteInfo(state, siteInfo) {
      state.siteInfo = { ...state.siteInfo, ...siteInfo }
    },
    
    setStats(state, stats) {
      state.stats = { ...state.stats, ...stats }
    },
    
    setLoading(state, loading) {
      state.loading = loading
    },
    
    setError(state, error) {
      state.error = error
    },
    
    clearError(state) {
      state.error = null
    }
  },
  
  actions: {
    async login({ commit }, { username, password }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        if (username === 'admin' && password === 'love') {
          const user = {
            id: 1,
            username: 'admin',
            name: '管理员'
          }
          
          const token = 'mock-token-' + Date.now()
          localStorage.setItem('adminToken', token)
          localStorage.setItem('adminUser', JSON.stringify(user))
          
          commit('setUser', user)
          return { success: true }
        } else {
          const errorMessage = '用户名或密码错误'
          commit('setError', errorMessage)
          return { success: false, message: errorMessage }
        }
      } catch (error) {
        const errorMessage = error.message || '登录失败'
        commit('setError', errorMessage)
        return { success: false, message: errorMessage }
      } finally {
        commit('setLoading', false)
      }
    },
    
    async checkAuth({ commit }) {
      try {
        const token = localStorage.getItem('adminToken')
        const userStr = localStorage.getItem('adminUser')
        
        if (!token || !userStr) {
          return false
        }
        
        const user = JSON.parse(userStr)
        commit('setUser', user)
        return true
      } catch (error) {
        return false
      }
    },
    
    async logout({ commit }) {
      try {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        commit('clearUser')
        commit('clearError')
        return { success: true }
      } catch (error) {
        return { success: false, message: '退出登录失败' }
      }
    },
    
    async fetchStats({ commit }) {
      try {
        commit('setLoading', true)
        const stats = {
          leavingCount: 0,
          littleCount: 0,
          loveListCount: 0,
          loveImgCount: 0
        }
        commit('setStats', stats)
      } catch (error) {
        commit('setError', '获取统计数据失败')
      } finally {
        commit('setLoading', false)
      }
    },
    
    async fetchSiteInfo({ commit }) {
      try {
        commit('setLoading', true)
        // 保留默认站点信息，等待后端API
        const siteInfo = {
          title: 'Like Girl',
          userQQ: '123456789',
          userName: '管理员'
        }
        commit('setSiteInfo', siteInfo)
      } catch (error) {
        commit('setError', '获取站点信息失败')
      } finally {
        commit('setLoading', false)
      }
    }
  },
  
  getters: {
    isLoggedIn: state => state.isAuthenticated,
    currentUser: state => state.user,
    siteTitle: state => state.siteInfo.title,
    userQQ: state => state.siteInfo.userQQ,
    userName: state => state.siteInfo.userName,
    statsData: state => state.stats,
    isLoading: state => state.loading,
    errorMessage: state => state.error
  }
})

// 从 vue-router 导入 createRouter 和 createWebHashHistory
import { createRouter, createWebHashHistory } from 'vue-router'

// 创建一个合并的路由，但需要移除前台路由中的通配符路由
const frontendRoutesFiltered = frontendRouter.options.routes.filter(
  route => route.path !== '/:pathMatch(.*)*'
)

// 创建一个新的路由实例 - 使用 Hash 模式解决 CloudBase 路由问题
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...frontendRoutesFiltered,
    ...adminRouter.options.routes,
    // 添加一个新的通配符路由，放在最后
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 优化路由守卫 - 减少IP检测频率
let lastIPCheck = 0
const IP_CHECK_INTERVAL = 30000 // 30秒检查一次

router.beforeEach(async (to, from, next) => {
  const now = Date.now()
  
  // 只在必要时进行IP检测
  if (now - lastIPCheck > IP_CHECK_INTERVAL) {
    try {
      await routeIPGuard(to, from, next)
      lastIPCheck = now
    } catch (error) {
      console.warn('IP检测失败，继续导航:', error)
      next()
    }
  } else {
    next()
  }
})

// IP检测逻辑
async function initApp() {
  try {
    // 首先进行IP检测
    const ipResult = await initIPGuard()
    
    // 检查IP检测结果
    if (ipResult.banned) {
      return
    }
    
    if (!ipResult.success) {
      return
    }
    
    // IP检测通过，继续初始化应用
    const app = createApp(App)
    app.use(router)
    app.use(store)
    app.mount('#app')
    
    // 启动IP监控
    startIPMonitoring()
    
  } catch (error) {
    console.error('应用初始化失败:', error)
    
    // 如果IP检测失败，为了安全起见，不启动应用
    document.body.innerHTML = '<div style="text-align:center;margin-top:50px;"><h2>系统初始化失败</h2><p>请刷新页面重试</p><p style="color:red;">错误: ' + error.message + '</p></div>'
  }
}

// 启动应用
initApp()
