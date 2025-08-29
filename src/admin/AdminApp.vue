<template>
  <div id="app" class="admin-app">
    <!-- 登录页面单独显示 -->
    <template v-if="isLoginPage">
      <router-view />
    </template>
    
    <!-- 管理后台布局 -->
    <template v-else>
      <!-- 头部导航和侧边栏 -->
      <AdminHeader />
      
      <!-- 主要内容区域 -->
      <div class="content-page">
        <div class="content">
          <!-- 路由视图 -->
          <router-view />
          
          <!-- 底部 -->
          <AdminFooter />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import AdminHeader from '../components/AdminHeader.vue'
import AdminFooter from '../components/AdminFooter.vue'

export default {
  name: 'AdminApp',
  components: {
    AdminHeader,
    AdminFooter
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const showLoading = ref(true)

    // 判断是否为登录页面
    const isLoginPage = computed(() => route.path === '/admin/login')

    onMounted(async () => {
      // 初始化应用
      try {
        // 检查登录状态
        const isAuthenticated = await store.dispatch('checkAuth')
        
        // 如果未登录且当前路由不是登录页面，则跳转到登录页面
        if (!isAuthenticated && route.path !== '/admin/login') {
          router.push('/admin/login')
          showLoading.value = false
          return
        }
        
        // 获取站点信息
        await store.dispatch('fetchSiteInfo')
        
        // 延迟隐藏加载动画
        setTimeout(() => {
          showLoading.value = false
        }, 1000)
      } catch (error) {
        
        showLoading.value = false
        
        // 如果初始化失败且不在登录页面，跳转到登录页面
        if (route.path !== '/admin/login') {
          router.push('/admin/login')
        }
      }
    })

    return {
      showLoading,
      isLoginPage
    }
  }
}
</script>

<style>
.admin-app {
  font-family: 'Noto Serif SC', serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 内容页面样式 */
.content-page {
  margin-left: 260px;
  margin-top: 30px;
  padding-top: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 全局样式重置 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

html {
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 991.98px) {
  .content-page {
    margin-left: 0;
    margin-top: 70px;
  }
}

@media (max-width: 768px) {
  .admin-app {
    font-size: 14px;
  }
}
</style>
