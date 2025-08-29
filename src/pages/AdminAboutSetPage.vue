<template>
  <div class="admin-about-set-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-xl-10">
          <div class="page-header">
            <h2 class="page-title">
              <i class="mdi mdi-chat-processing text-primary mr-3"></i>
              对话配置管理
            </h2>
            <p class="page-subtitle">配置网站的对话内容和交互文本</p>
          </div>
          
          <form class="modern-form" @submit.prevent="submitForm" novalidate>
            <div class="cards-grid">
              <div class="card-wrapper">
                <div class="card modern-card">
                  <div class="card-body">
                    <div class="card-header-custom">
                      <h4 class="card-title">
                        <i class="mdi mdi-numeric-1-circle text-primary mr-2"></i>
                        对话配置——1
                      </h4>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-format-title mr-2"></i>对话标题
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请输入标题" 
                             v-model="formData.title" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-image mr-2"></i>对话模块背景图片地址
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请输入图片URL地址"
                             v-model="formData.aboutimg" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话1文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.info1" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话2文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.info2" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话3文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.info3" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-check-circle mr-2"></i>对话1按钮确认文本
                      </label>
                      <input type="text" class="form-control modern-input" 
                             v-model="formData.btn1" placeholder="请填写确认按钮文本">
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-close-circle mr-2"></i>对话1按钮取消文本
                      </label>
                      <input type="text" class="form-control modern-input" 
                             v-model="formData.btn2" placeholder="请填写取消按钮文本">
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-wrapper">
                <div class="card modern-card">
                  <div class="card-body">
                    <div class="card-header-custom">
                      <h4 class="card-title">
                        <i class="mdi mdi-numeric-2-circle text-success mr-2"></i>
                        对话配置——2
                      </h4>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话2-1文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infox1" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话2-2文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infox2" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话2-3文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infox3" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话2-4文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infox4" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话2-5文本
                      </label>
                      <input type="text" class="form-control modern-input" 
                             v-model="formData.infox5" placeholder="请填写对话内容">
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话2-6文本
                      </label>
                      <input type="text" class="form-control modern-input" 
                             v-model="formData.infox6" placeholder="请填写对话内容">
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-gesture-tap-button mr-2"></i>对话2-1按钮文本
                      </label>
                      <input type="text" class="form-control modern-input" 
                             v-model="formData.btnx2" placeholder="请填写按钮文本">
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-wrapper">
                <div class="card modern-card">
                  <div class="card-body">
                    <div class="card-header-custom">
                      <h4 class="card-title">
                        <i class="mdi mdi-numeric-3-circle text-warning mr-2"></i>
                        对话配置——3
                      </h4>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话3-1文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infof1" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话3-2文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infof2" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话3-3文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infof3" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话3-4文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infof4" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-gesture-tap-button mr-2"></i>对话3-1按钮文本
                      </label>
                      <input type="text" class="form-control modern-input" 
                             v-model="formData.btnf3" placeholder="请填写按钮文本">
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-wrapper">
                <div class="card modern-card">
                  <div class="card-body">
                    <div class="card-header-custom">
                      <h4 class="card-title">
                        <i class="mdi mdi-numeric-4-circle text-danger mr-2"></i>
                        对话配置——4
                      </h4>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话4-1文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infod1" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话4-2文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infod2" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话4-3文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infod3" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话4-4文本
                      </label>
                      <input type="text" class="form-control modern-input" placeholder="请填写对话内容"
                             v-model="formData.infod4" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">
                        <i class="mdi mdi-message-text mr-2"></i>对话4-5文本
                      </label>
                      <input type="text" class="form-control modern-input" 
                             v-model="formData.infod5" placeholder="请填写对话内容">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="submit-section">
              <button class="btn btn-modern" type="button" @click="submitForm" :disabled="loading">
                <i class="mdi mdi-content-save mr-2"></i>
                {{ loading ? '更新中...' : '提交修改' }}
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

<script>
import { ref, reactive, onMounted } from 'vue'
import CustomModal from '../components/CustomModal.vue'
import { app, ensureLogin } from '@/utils/cloudbase'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminAboutSetPage',
  components: {
    CustomModal
  },
  setup() {
    // 弹窗相关
    const { modalState, showSuccess, showError, showWarning, showConfirm, closeModal, confirmModal, cancelModal } = useModal()

    // 表单数据
    const formData = reactive({
      title: '',
      aboutimg: '',
      info1: '',
      info2: '',
      info3: '',
      btn1: '',
      btn2: '',
      infox1: '',
      infox2: '',
      infox3: '',
      infox4: '',
      infox5: '',
      infox6: '',
      btnx2: '',
      infof1: '',
      infof2: '',
      infof3: '',
      infof4: '',
      btnf3: '',
      infod1: '',
      infod2: '',
      infod3: '',
      infod4: '',
      infod5: ''
    })

    const loading = ref(false)

    // 获取关于页面配置
    const fetchAboutData = async () => {
      try {
        loading.value = true
        
        // 使用统一的登录配置
        await ensureLogin()
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          this.$router.push('/admin/login')
          return
        }
        
        // 调用云函数获取关于页面配置
        const result = await app.callFunction({
          name: 'settings',
          data: {
            action: 'getSettings',
            data: {
              type: 'about'
            },
            token: token
          }
        })
        
        
        if (result.result && result.result.success) {
          const aboutData = result.result.data[0] || {}
          // 将数据库中的数据映射到表单字段
          Object.assign(formData, aboutData)
        } else {
          showError('获取关于页面配置失败，请重试','获取失败')
        }
      } catch (error) {
        showError('获取关于页面配置失败，请重试','获取失败')
      } finally {
        loading.value = false
      }
    }

    // 提交表单
    const submitForm = async () => {
      if (loading.value) return
      
      // 表单验证
      if (!formData.title.trim()) {
        showError('对话标题不能为空','验证失败')
        return
      }
      
      try {
        loading.value = true
        
        // 使用统一的登录配置
        await ensureLogin()
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          showError('认证已过期，请重新登录','认证失败')
          return
        }
        
        // 过滤掉_id字段，避免更新时出错
        const settingsData = { ...formData }
        delete settingsData._id
        
        // 调用云函数更新关于页面配置
        const result = await app.callFunction({
          name: 'settings',
          data: {
            action: 'updateSettings',
            type: 'about',
            settings: settingsData,
            token: token
          }
        })
        
        
        if (result.result && result.result.success) {
          showSuccess('更新成功！','操作成功')
        } else {
          showError('更新失败：'+ result.result?.message,'操作失败')
        }
      } catch (error) {
        showError('更新失败，请重试','操作失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchAboutData()
    })

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
.admin-about-set-page {
  padding: 30px 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.container-fluid {
  max-width: 100%;
  margin: 0;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
}

.modern-form {
  max-width: 100%;
}

.modern-card {
  border: none;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.12);
}

.card-body {
  padding: 30px;
}

.card-header-custom {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.modern-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  color: #2c3e50;
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.modern-input::placeholder {
  color: #6c757d;
  font-size: 13px;
}

.submit-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.btn-modern {
  padding: 15px 40px;
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

.text-primary {
  color: #667eea !important;
}

.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.mr-2 {
  margin-right: 0.5rem !important;
}

.mr-3 {
  margin-right: 1rem !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .container-fluid {
    padding: 0 15px;
  }
  
  .cards-grid {
    gap: 15px;
  }
}

@media (max-width: 992px) {
  .admin-about-set-page {
    padding: 20px 10px;
  }
  
  .container-fluid {
    padding: 0 10px;
  }
  
  .page-header {
    padding: 20px 0;
    margin-bottom: 30px;
  }
  
  .page-title {
    font-size: 28px;
    flex-direction: column;
    gap: 10px;
  }
  
  .cards-grid {
    gap: 15px;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .modern-input {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .btn-modern {
    padding: 12px 30px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .card-title {
    font-size: 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .form-label {
    font-size: 13px;
  }
  
  .modern-input {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .submit-section {
    padding: 20px;
  }
  
  .btn-modern {
    width: 100%;
    padding: 12px 20px;
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

.page-header {
  animation: fadeInUp 0.4s ease-out;
}

.submit-section {
  animation: fadeInUp 0.8s ease-out;
}

/* 输入框动画效果 */
@keyframes inputFocus {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

.modern-input:focus {
  animation: inputFocus 0.3s ease;
}

/* 卡片渐变动画 */
.modern-card:nth-child(odd) {
  animation-delay: 0.1s;
}

.modern-card:nth-child(even) {
  animation-delay: 0.2s;
}
</style>
