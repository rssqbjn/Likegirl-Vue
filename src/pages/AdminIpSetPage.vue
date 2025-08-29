<template>
  <div class="admin-ip-set-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8 col-xl-6">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <h4 class="header-title">
                  <i class="mdi mdi-shield-plus text-danger mr-2"></i>
                  IP封禁拉黑添加
                </h4>
              </div>
              
              <div class="form-container">
                <form class="modern-form" @submit.prevent="submitForm" novalidate>
                  <div class="form-group">
                    <label for="ipAddress" class="form-label">
                      <i class="mdi mdi-ip-network mr-2"></i>IP地址
                    </label>
                    <input 
                      type="text" 
                      class="form-control modern-input" 
                      id="ipAddress" 
                      placeholder="请输入需封禁的IP地址"
                      v-model="formData.ipdz" 
                      required
                    >
                  </div>
                  
                  <div class="form-group">
                    <label for="reason" class="form-label">
                      <i class="mdi mdi-note-text mr-2"></i>信息备注
                    </label>
                    <input 
                      type="text" 
                      class="form-control modern-input" 
                      id="reason"
                      placeholder="备注IP封禁情况(被封禁的IP会显示此备注内容)" 
                      v-model="formData.bz" 
                      required
                    >
                  </div>
                  
                  <div class="form-group button-group">
                    <button 
                      class="btn btn-modern" 
                      type="button" 
                      @click="submitForm" 
                      :disabled="loading"
                    >
                      <i class="mdi mdi-check-circle mr-2"></i>
                      {{ loading ? '添加中...' : '提交添加' }}
                    </button>
                    <router-link to="/admin/ip-list">
                      <button type="button" class="btn btn-secondary-modern">
                        <i class="mdi mdi-arrow-left mr-2"></i>
                        返回列表
                      </button>
                    </router-link>
                  </div>
                </form>
              </div>
            </div>
          </div>
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

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import CustomModal from '../components/CustomModal.vue'
import { app, ensureLogin } from '@/utils/cloudbase'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminIpSetPage',
  components: {
    CustomModal
  },
  setup() {
    const router = useRouter()
    
    // 弹窗相关
    const { modalState, showSuccess, showError, showWarning, showConfirm, closeModal, confirmModal, cancelModal } = useModal()

    // 表单数据
    const formData = reactive({
      ipdz: '',
      bz: ''
    })

    const loading = ref(false)

    // 提交表单
    const submitForm = async () => {
      if (loading.value) return
      
      // 表单验证
      if (!formData.ipdz.trim()) {
        showError('IP地址不能为空','验证失败')
        return
      }
      
      if (!formData.bz.trim()) {
        showError('信息备注不能为空','验证失败')
        return
      }
      
      // 简单的IP格式验证
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipRegex.test(formData.ipdz.trim())) {
        showError('请输入正确的IP地址格式','验证失败')
        return
      }
      
      try {
        loading.value = true
        
        // 匿名登录
        await ensureLogin()
        
        // 获取管理员token
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          showError('请先登录管理员账号','认证失败')
          return
        }
        
        // 调用云函数添加IP封禁
        const result = await app.callFunction({
          name: 'ipManage',
          data: {
            action: 'addIpBan',
            token: token,
            data: {
              ip: formData.ipdz.trim(),
              reason: formData.bz.trim(),
              location: '手动添加' // 可以后续扩展为自动获取IP归属地
            }
          }
        })
        
        if (result.result && result.result.success) {
          showSuccess('添加成功！','操作成功')
          // 清空表单
          formData.ipdz = ''
          formData.bz = ''
          // 跳转到IP列表页面
          router.push('/admin/ip-list')
        } else {
          showError('添加失败：' + (result.result?.message || '未知错误'),'操作失败')
        }
      } catch (error) {
        showError('添加失败，请重试','操作失败')
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      loading,
      submitForm,
      modalState,
      showSuccess,
      showError,
      showWarning,
      showConfirm,
      closeModal,
      confirmModal,
      cancelModal
    }
  }
}
</script>

<style scoped>
.admin-ip-set-page {
  padding: 30px 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.container-fluid {
  max-width: 1200px;
  margin: 0 auto;
}

.modern-card {
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
}

.card-body {
  padding: 40px;
}

.header-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
}

.form-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.modern-form {
  max-width: 100%;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.modern-input {
  width: 100%;
  padding: 15px 20px;
  font-size: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  color: #2c3e50;
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.modern-input::placeholder {
  color: #6c757d;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.btn-modern {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  cursor: pointer;
}

.btn-modern:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  background: linear-gradient(45deg, #764ba2, #667eea);
}

.btn-modern:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary-modern {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: 2px solid #6c757d;
  background: transparent;
  color: #6c757d;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
}

.btn-secondary-modern:hover {
  transform: translateY(-3px);
  background: #6c757d;
  color: white;
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
  text-decoration: none;
}

.text-danger {
  color: #dc3545 !important;
}

.mr-2 {
  margin-right: 0.5rem !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-ip-set-page {
    padding: 20px 10px;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .button-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-modern,
  .btn-secondary-modern {
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .modern-input {
    padding: 12px 15px;
    font-size: 14px;
  }
}

/* 加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-card {
  animation: fadeInUp 0.6s ease-out;
}

/* 输入框动画效果 */
@keyframes inputFocus {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.modern-input:focus {
  animation: inputFocus 0.3s ease;
}
</style>
