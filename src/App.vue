<template>
  <div id="app" class="admin-app">
    <!-- 加载动画 -->
    <div v-if="showLoading" id="Loadanimation">
      <div id="Loadanimation-center">
        <div id="Loadanimation-center-absolute">
          <div class="xccx_object" id="xccx_four"></div>
          <div class="xccx_object" id="xccx_three"></div>
          <div class="xccx_object" id="xccx_two"></div>
          <div class="xccx_object" id="xccx_one"></div>
        </div>
      </div>
    </div>

    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const showLoading = ref(true)

    onMounted(async () => {
      try {
        await store.dispatch('checkAuth')
        await store.dispatch('fetchSiteInfo')
        
        setTimeout(() => {
          showLoading.value = false
        }, 1000)
      } catch (error) {
        
        showLoading.value = false
      }
    })

    return {
      showLoading
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
}

#Loadanimation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
}

#Loadanimation-center {
  position: relative;
  width: 100px;
  height: 100px;
}

#Loadanimation-center-absolute {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.xccx_object {
  width: 20px;
  height: 20px;
  background-color: #5369f8;
  border-radius: 50%;
  position: absolute;
  animation: xccx_animate 2s infinite ease-in-out;
}

#xccx_one {
  top: 0;
  left: 0;
  animation-delay: 0s;
}

#xccx_two {
  top: 0;
  right: 0;
  animation-delay: 0.4s;
}

#xccx_three {
  bottom: 0;
  right: 0;
  animation-delay: 0.8s;
}

#xccx_four {
  bottom: 0;
  left: 0;
  animation-delay: 1.2s;
}

@keyframes xccx_animate {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .admin-app {
    font-size: 14px;
  }
}
</style>