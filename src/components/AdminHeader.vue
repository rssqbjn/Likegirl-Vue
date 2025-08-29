<template>
  <!-- 优雅的加载动画 -->
  <div class="loading-overlay" v-if="showLoading">
    <div class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">加载中...</p>
    </div>
  </div>

  <!-- 现代化顶部导航栏 -->
  <header class="admin-header" v-if="!isHeaderDuplicated">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="header-logo">
        <router-link to="/admin" class="logo-link">
          <div class="logo-icon">
            <i class="fas fa-heart"></i>
          </div>
          <span class="logo-text">{{ siteTitle }}</span>
        </router-link>
      </div>

      <!-- 右侧工具栏 -->
      <div class="header-actions">
        <!-- 设置按钮 -->
        <router-link to="/admin/user" class="action-item settings-btn">
          <i class="fas fa-cog"></i>
        </router-link>

        <!-- 用户下拉菜单 -->
        <div class="user-dropdown" :class="{ 'active': showUserDropdown }">
          <div class="user-trigger" @click="toggleUserDropdown">
            <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${userQQ}&s=640`" 
                 alt="用户头像" 
                 class="user-avatar">
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">管理员</span>
            </div>
            <i class="fas fa-chevron-down dropdown-arrow"></i>
          </div>
          
          <div class="dropdown-menu" :class="{ 'show': showUserDropdown }">
            <router-link to="/admin/user" class="dropdown-item">
              <i class="fas fa-user-cog"></i>
              <span>个人设置</span>
            </router-link>
            <router-link to="/admin/set" class="dropdown-item">
              <i class="fas fa-sliders-h"></i>
              <span>系统设置</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <a href="#" @click="logout" class="dropdown-item logout-item">
              <i class="fas fa-sign-out-alt"></i>
              <span>退出登录</span>
            </a>
          </div>
        </div>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleSidebar">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
  </header>

  <!-- 现代化侧边栏 -->
  <aside class="admin-sidebar" :class="{ 'mobile-open': showSidebar }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="sidebar-user">
        <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${userQQ}&s=640`" 
             alt="用户头像" 
             class="sidebar-avatar">
        <div class="sidebar-user-info">
          <h4 class="sidebar-username">{{ userName }}</h4>
          <p class="sidebar-role">系统管理员</p>
        </div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link to="/admin" class="nav-link" exact-active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-tachometer-alt"></i>
            </div>
            <span class="nav-text">仪表盘</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/set" class="nav-link" exact-active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-cogs"></i>
            </div>
            <span class="nav-text">基本设置</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/leaving" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-comments"></i>
            </div>
            <span class="nav-text">留言管理</span>
            <span class="nav-badge" v-if="stats.leavingCount > 0">{{ stats.leavingCount }}</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/little" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-feather-alt"></i>
            </div>
            <span class="nav-text">点点滴滴</span>
            <span class="nav-badge" v-if="stats.littleCount > 0">{{ stats.littleCount }}</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/love-img" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-images"></i>
            </div>
            <span class="nav-text">恋爱相册</span>
            <span class="nav-badge" v-if="stats.loveImgCount > 0">{{ stats.loveImgCount }}</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/love-list" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-heart"></i>
            </div>
            <span class="nav-text">恋爱清单</span>
            <span class="nav-badge" v-if="stats.loveListCount > 0">{{ stats.loveListCount }}</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/about" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <span class="nav-text">关于页面</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/ip-list" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <span class="nav-text">IP管理</span>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/admin/illegal" class="nav-link" active-class="active" @click="closeSidebarOnMobile">
            <div class="nav-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <span class="nav-text">非法访问</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer">
      <div class="footer-stats">
        <div class="stat-item">
          <span class="stat-label">系统状态</span>
          <span class="stat-value status-good">正常</span>
        </div>
      </div>
    </div>
  </aside>

  <!-- 移动端遮罩层 -->
  <div class="sidebar-overlay" 
       :class="{ 'show': showSidebar }" 
       @click="toggleSidebar"></div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllStats } from '../utils/statsService'
import { app, ensureLogin } from '@/utils/cloudbase'

export default {
  name: 'AdminHeader',
  setup() {
    const router = useRouter()
    
    const showUserDropdown = ref(false)
    const showSidebar = ref(false)
    const showLoading = ref(true)
    const isHeaderDuplicated = ref(false)

    // 用户信息从CloudBase获取
    const userInfo = ref({
      title: 'Like Girl',
      userName: '管理员',
      userQQ: '123456789'
    })
    
    // 统计数据从CloudBase获取
    const stats = ref({
      leavingCount: 0,
      littleCount: 0,
      loveListCount: 0,
      loveImgCount: 0
    })

    // 计算属性
    const siteTitle = computed(() => userInfo.value.title)
    const userName = computed(() => userInfo.value.userName)
    const userQQ = computed(() => userInfo.value.userQQ)
    const totalNotifications = computed(() => 
      stats.value.leavingCount + stats.value.littleCount + 
      stats.value.loveListCount + stats.value.loveImgCount
    )

    const toggleUserDropdown = () => {
      showUserDropdown.value = !showUserDropdown.value
    }

    const toggleSidebar = () => {
      showSidebar.value = !showSidebar.value
    }
    
    const closeSidebarOnMobile = () => {
      // 只在移动端视图下关闭侧边栏
      if (window.innerWidth <= 768) {
        showSidebar.value = false
      }
    }

    // 从CloudBase获取用户配置信息
    const fetchUserInfoFromCloudBase = async () => {
      try {
        
        
        // 先进行身份验证
        await ensureLogin()
        
        // 调用settings云函数获取用户配置
        const result = await app.callFunction({
          name: 'settings',
          data: {
            action: 'getSettings'
          }
        })
        
        if (result.result && result.result.success) {
          const data = result.result.data
          
          // 更新用户信息
          if (data.text) {
            userInfo.value = {
              title: data.text.title || 'Like Girl',
              userName: data.text.userName || '管理员',
              userQQ: data.text.userQQ || '123456789'
            }
          }
          
          
        } else {
          throw new Error(result.result?.message || '获取用户配置失败')
        }
      } catch (error) {
        
        // 使用默认值
        userInfo.value = {
          title: 'Like Girl',
          userName: '管理员',
          userQQ: '123456789'
        }
      }
    }

    // 从CloudBase获取统计数据
    const fetchStatsFromCloudBase = async () => {
      try {
        
        
        const result = await getAllStats()
        
        if (result.success) {
          // 更新统计数据
          stats.value = {
            leavingCount: result.data.leaving?.count || 0,
            littleCount: result.data.article?.count || 0,
            loveListCount: result.data.loveList?.total || 0,
            loveImgCount: result.data.loveImg?.count || 0
          }
          
          
        } else {
          throw new Error(result.message || '获取统计数据失败')
        }
      } catch (error) {
        
        // 使用默认值
        stats.value = {
          leavingCount: 0,
          littleCount: 0,
          loveListCount: 0,
          loveImgCount: 0
        }
      }
    }

    const logout = async () => {
      try {
        // 清除本地存储的登录状态
        localStorage.removeItem('adminToken')
        sessionStorage.clear()
        
        // 清除CloudBase登录状态
        try {
          await app.auth().signOut()
        } catch (authError) {
          
        }
        
        // 跳转到登录页面
        router.push('/admin/login')
      } catch (error) {
        
        // 即使出错也要跳转到登录页面
        router.push('/admin/login')
      }
    }

    // 点击外部关闭下拉菜单
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown')) {
        showUserDropdown.value = false
      }
    }

    onMounted(async () => {
      // 检查页面中是否已经存在顶部栏，避免重复渲染
      const existingHeaders = document.querySelectorAll('.admin-header')
      if (existingHeaders.length > 1) {
        isHeaderDuplicated.value = true
        showLoading.value = false
        return
      }
      
      document.addEventListener('click', handleClickOutside)
      
      // 从CloudBase获取用户信息和统计数据
      await Promise.all([
        fetchUserInfoFromCloudBase(),
        fetchStatsFromCloudBase()
      ])
      
      // 延迟隐藏加载动画，让用户看到加载效果
      setTimeout(() => {
        showLoading.value = false
      }, 800)
    })

    return {
      showUserDropdown,
      showSidebar,
      showLoading,
      isHeaderDuplicated,
      siteTitle,
      userName,
      userQQ,
      stats,
      totalNotifications,
      toggleUserDropdown,
      toggleSidebar,
      closeSidebarOnMobile,
      logout
    }
  }
}
</script>

<style scoped>
/* 引入Font Awesome图标 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

/* 全局变量 */
:root {
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --danger-color: #f56565;
  --warning-color: #ed8936;
  --info-color: #4299e1;
  --light-color: #f7fafc;
  --dark-color: #2d3748;
  --gray-100: #f7fafc;
  --gray-200: #edf2f7;
  --gray-300: #e2e8f0;
  --gray-400: #cbd5e0;
  --gray-500: #a0aec0;
  --gray-600: #718096;
  --gray-700: #4a5568;
  --gray-800: #2d3748;
  --gray-900: #1a202c;
  --white: #ffffff;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 重置样式 */
* {
  box-sizing: border-box;
}

/* 优雅的加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  text-align: center;
  color: var(--white);
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid var(--white);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 0.5;
  }
}

/* 现代化顶部导航栏 */
.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  z-index: 1000;
  transition: var(--transition);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 100%;
}

/* Logo区域 */
.header-logo {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--dark-color);
  font-weight: 600;
  font-size: 18px;
  transition: var(--transition);
}

.logo-link:hover {
  color: var(--gray-600);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: var(--white);
  font-size: 18px;
}

.logo-text {
  color: var(--gray-800);
  font-weight: 700;
}

/* 搜索栏 */
.header-search {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 16px 0 44px;
  border: 1px solid var(--gray-300);
  border-radius: 20px;
  background: var(--gray-100);
  font-size: 14px;
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-500);
  font-size: 14px;
}

/* 右侧工具栏 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-item {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--gray-600);
  text-decoration: none;
  transition: var(--transition);
  cursor: pointer;
}

.action-item:hover {
  background: var(--gray-100);
  color: var(--primary-color);
}

.notification-bell {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--danger-color);
  color: var(--white);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.user-trigger:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(0, 0, 0, 0.15);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--gray-200);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--dark-color);
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: var(--gray-500);
  line-height: 1.2;
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--gray-500);
  transition: var(--transition);
}

.user-dropdown.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  margin-top: 8px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: var(--transition);
  z-index: 1001;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--gray-700);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--gray-100);
  color: var(--primary-color);
}

.dropdown-item i {
  width: 16px;
  font-size: 14px;
}

.dropdown-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 8px 0;
}

.logout-item:hover {
  background: rgba(245, 101, 101, 0.1);
  color: var(--danger-color);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  position: relative;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border: none;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.mobile-menu-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.mobile-menu-btn::before {
  content: '\f0c9'; /* FontAwesome 汉堡菜单图标 */
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  font-size: 18px;
  color: var(--white);
  transition: var(--transition);
}

.hamburger-line {
  display: none; /* 隐藏原来的三条线 */
}

/* 现代化侧边栏 */
.admin-sidebar {
  position: fixed;
  top: 70px;
  left: 0;
  width: 270px;
  height: calc(100vh - 70px);
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  overflow-y: auto;
  z-index: 999;
  transition: var(--transition);
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(0, 0, 0, 0.1);
}

.sidebar-user-info {
  flex: 1;
}

.sidebar-username {
  font-size: 16px;
  font-weight: 600;
  color: var(--white);
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.sidebar-role {
  font-size: 12px;
  color: rgb(44, 62, 80);
  margin: 0;
  line-height: 1.2;
}

/* 导航菜单 */
.sidebar-nav {
  padding: 16px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  color: var(--gray-700);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
  position: relative;
}

.nav-link:hover {
  background: var(--gray-100);
  color: var(--primary-color);
}

.nav-link.active {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
  border-right: 3px solid var(--primary-color);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary-color);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.nav-text {
  flex: 1;
}

.nav-badge {
  background: var(--danger-color);
  color: var(--white);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

/* 侧边栏底部 */
.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.footer-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-700);
}

.status-good {
  color: var(--success-color);
}

/* 移动端遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: calc(100vh - 70px);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-search {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
  
  .header-search {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .admin-sidebar {
    transform: translateX(-100%);
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  }
  
  .user-info {
    display: none;
  }
  
  .dropdown-arrow {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 12px;
  }
  
  .header-actions {
    gap: 8px;
  }
  
  .action-item {
    width: 36px;
    height: 36px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  
  .logo-text {
    display: none;
  }
  
  .admin-sidebar {
    width: 100%;
  }
}

/* 滚动条美化 */
.admin-sidebar::-webkit-scrollbar {
  width: 6px;
}

.admin-sidebar::-webkit-scrollbar-track {
  background: var(--gray-100);
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 3px;
}

.admin-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

/* 动画效果 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.admin-header {
  animation: slideInDown 0.6s ease-out;
}

.dropdown-menu.show {
  animation: slideInRight 0.3s ease-out;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --white: #1a202c;
    --dark-color: #f7fafc;
    --gray-100: #2d3748;
    --gray-200: #4a5568;
    --gray-300: #718096;
    --gray-500: #a0aec0;
    --gray-600: #cbd5e0;
    --gray-700: #e2e8f0;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .nav-link.active {
    border-right-width: 4px;
  }
  
  .notification-badge {
    border: 2px solid var(--white);
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 打印样式 */
@media print {
  .admin-header,
  .admin-sidebar,
  .sidebar-overlay {
    display: none;
  }
}
</style>
