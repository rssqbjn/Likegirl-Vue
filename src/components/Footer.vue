<template>

  <!-- 页脚内容 -->
  <div v-if="siteConfig.icp || siteConfig.copyright" class="footer-warp">
    <div class="footer">
      <div class="footer-content">
        <!-- 自定义页脚内容 -->
        <div v-if="siteConfig.footerCon" v-html="siteConfig.footerCon" class="custom-footer"></div>
        <p v-if="siteConfig.icp" class="icp-info">
          <img src="/Style/img/icp.svg" alt="ICP备案">
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{{ siteConfig.icp }}</a>
        </p>
        <p v-if="siteConfig.copyright" class="copyright-info">{{ siteConfig.copyright }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { app, ensureLogin } from '@/utils/cloudbase'

// 网站配置数据
const siteConfig = ref({
  icp: '', // ICP备案号
  copyright: '', // 版权信息
  footerCon: '' // 自定义页脚内容
})

const isAuthenticated = ref(false)

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

// 获取网站配置数据
const fetchSiteConfig = async () => {
  try {
    // 确保身份验证
    const authSuccess = await authenticate()
    if (!authSuccess) {
      
      return
    }

    

    // 并行获取text和diySet配置数据
    const [textResult, diyResult] = await Promise.all([
      app.callFunction({
        name: 'settings',
        data: {
          action: 'getSettings',
          data: { type: 'text' }
        }
      }),
      app.callFunction({
        name: 'settings',
        data: {
          action: 'getSettings',
          data: { type: 'diySet' }
        }
      })
    ])

    
    

    if (textResult.result && textResult.result.success) {
      const textConfig = textResult.result.data[0] || {}
      

      // 获取diySet配置
      let diyConfig = {}
      if (diyResult.result && diyResult.result.success) {
        diyConfig = diyResult.result.data[0] || {}
        
      }

      // 更新siteConfig，保留默认值作为回退
      siteConfig.value = {
        icp: textConfig.icp || '',
        copyright: textConfig.Copyright || '', // 注意这里是大写的Copyright
        footerCon: diyConfig.footerCon || ''
      }

      
    } else {
      
      
    }

  } catch (error) {
    
    
  }
}

onMounted(async () => {
  await fetchSiteConfig()
})
</script>

<style scoped>
/* 页脚容器 */
.footer-warp {
  background: #f8f9fa;
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid #e9ecef;
  width: 100%;
}

/* 页脚主体 */
.footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

/* 页脚内容容器 - 确保居中 */
.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

/* 段落样式 */
.footer p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* ICP备案信息 */
.icp-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* 版权信息 */
.copyright-info {
  text-align: center;
  width: 100%;
}

/* 图标样式 */
.footer img {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 链接样式 */
.footer a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer a:hover {
  color: #333;
  text-decoration: underline;
}

/* 自定义页脚内容 */
.custom-footer {
  width: 100%;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-warp {
    padding: 1.5rem 0;
    margin-top: 2rem;
  }

  .footer {
    padding: 0 0.5rem;
  }

  .footer p {
    font-size: 0.8rem;
  }

  .icp-info {
    flex-direction: column;
    gap: 0.3rem;
  }
}

@media (max-width: 480px) {
  .footer-warp {
    padding: 1rem 0;
  }

  .footer p {
    font-size: 0.75rem;
    margin: 0.3rem 0;
  }
}
</style>

<style scoped>
/* 页脚容器 */
.footer-warp {
  background: #f8f9fa;
  padding: 1.5rem 0 1rem 0;
  margin-top: 3rem;
  border-top: 1px solid #e9ecef;
  width: 100%;
}

/* 页脚主体 */
.footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

/* 页脚内容容器 - 确保居中 */
.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

/* 段落样式 */
.footer p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* ICP备案信息 */
.icp-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* 版权信息 */
.copyright-info {
  text-align: center;
  width: 100%;
}

/* 图标样式 */
.footer img {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 链接样式 */
.footer a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer a:hover {
  color: #333;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-warp {
    padding: 1.5rem 0;
    margin-top: 2rem;
  }

  .footer {
    padding: 0 0.5rem;
  }

  .footer p {
    font-size: 0.8rem;
  }

  .icp-info {
    flex-direction: column;
    gap: 0.3rem;
  }
}

@media (max-width: 480px) {
  .footer-warp {
    padding: 1rem 0;
  }

  .footer p {
    font-size: 0.75rem;
    margin: 0.3rem 0;
  }
}
</style>
