<template>
  <div class="admin-love-list-edit-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <h4 class="header-title">
                  <i class="mdi mdi-heart-pulse text-primary mr-2"></i>
                  修改事件 — {{ formData.eventname }}
                </h4>
              </div>

              <form class="form-container" @submit.prevent="submitForm" novalidate>
                <div class="form-group">
                  <label for="eventname">事件标题</label>
                  <input 
                    id="eventname"
                    type="text" 
                    class="form-control" 
                    v-model="formData.eventname" 
                    placeholder="请输入事件标题" 
                    required
                  >
                </div>
                
                <div class="form-group status-group">
                  <label for="switch3">完成状态</label>
                  <div class="custom-switch">
                    <input 
                      type="checkbox" 
                      id="switch3" 
                      v-model="formData.icon" 
                      class="custom-control-input" 
                      @change="handleSwitchChange"
                    >
                    <label class="custom-control-label" for="switch3" :data-on-label="'已完成'" :data-off-label="'未完成'"></label>
                  </div>
                </div>
                
                <div class="form-group" id="img_url" v-show="formData.icon">
                  <label for="imgurl">图片地址</label>
                  <input 
                    id="imgurl"
                    type="text" 
                    class="form-control" 
                    v-model="formData.imgurl" 
                    placeholder="请输入图片地址（没有无需填写）"
                  >
                  <div v-if="formData.imgurl" class="image-preview mt-3">
                    <img :src="formData.imgurl" alt="图片预览" @error="handleImageError">
                    <div v-if="imageError" class="image-error">图片加载失败，请检查URL是否正确</div>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button class="btn btn-submit" type="button" @click="submitForm" :disabled="loading">
                    <i class="mdi mdi-content-save mr-1"></i>
                    {{ loading ? '更新中...' : '提交修改' }}
                  </button>
                </div>
              </form>

            </div> <!-- end card-body-->
          </div> <!-- end card-->
        </div> <!-- end col-->
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
import { useRouter, useRoute } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'
import CustomModal from '@/components/CustomModal.vue'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminLoveListEditPage',
  components: {
    CustomModal
  },
  setup() {
    const { modalState, showSuccess, showError, showWarning, closeModal, confirmModal, cancelModal } = useModal()
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const imageError = ref(false)
    

    
    // 表单数据
    const formData = reactive({
      _id: '',
      eventname: '',
      icon: false,
      imgurl: ''
    })
    
    // 处理图片加载错误
    const handleImageError = () => {
      imageError.value = true
    }

    // 处理开关变化
    const handleSwitchChange = () => {
      
      if (!formData.icon) {
        formData.imgurl = ''
      }
    }

    // 表单提交
    const submitForm = async () => {
      // 表单验证
      if (!formData.eventname.trim()) {
        await showWarning('事件不能为空', '表单验证')
        return
      }
      
      try {
        loading.value = true
        
        // 匿名登录
        await ensureLogin()
        
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          await showError('认证已过期，请重新登录', '登录提示')
          router.push('/admin/login')
          return
        }

        // 调用云函数更新事件
        const result = await app.callFunction({
          name: 'lovelist',
          data: {
            action: 'updateItem',
            data: {
              _id: formData._id,
              eventname: formData.eventname,
              icon: formData.icon ? 1 : 0,
              imgurl: formData.imgurl || '0'
            },
            token: token
          }
        })
        
        if (result.result && result.result.success) {
          await showSuccess('事件修改成功！', '操作成功')
          router.push('/admin/love-list')
        } else {
          await showError('保存失败，请重试', '操作失败')
        }
      } catch (error) {
        await showError('保存失败，请重试', '操作失败')
      } finally {
        loading.value = false
      }
    }

    // 初始化表单数据
    onMounted(() => {
      const id = route.params.id
      const icon = route.query.icon === '1'
      const name = route.query.name || ''
      const imgurl = route.query.imgurl || ''
      
      formData._id = id
      formData.eventname = decodeURIComponent(name)
      formData.icon = icon
      formData.imgurl = decodeURIComponent(imgurl) === '0' ? '' : decodeURIComponent(imgurl)
      
      
    })

    return {
      formData,
      loading,
      imageError,
      handleSwitchChange,
      handleImageError,
      submitForm,
      modalState,
      closeModal,
      confirmModal,
      cancelModal
    }
  }
}
</script>

<style scoped>
.admin-love-list-edit-page {
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
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background: white;
  overflow: hidden;
  transition: all 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.card-body {
  padding: 30px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
}

.form-container {
  max-width: 90%;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
  display: block;
}

.form-control {
  display: block;
  width: 100%;
  padding: 12px 15px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
  outline: none;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-group label:first-child {
  margin-bottom: 0;
}

/* 自定义开关样式 */
.custom-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.custom-control-input {
  display: none;
}

.custom-control-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ff6b6b;
  transition: .4s;
  border-radius: 34px;
}

.custom-control-label:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 0px;
  top: 0.01px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 0.1em 0.3em rgba(0, 0, 0, 0.3);
}

.custom-control-input:checked + .custom-control-label {
  background-color: #0acf97;
}

.custom-control-input:checked + .custom-control-label:before {
  transform: translateX(34px);
}

.custom-control-label:after {
  content: attr(data-off-label);
  position: absolute;
  right: 10px;
  top: 2px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.custom-control-input:checked + .custom-control-label:after {
  content: attr(data-on-label);
  left: 10px;
  right: auto;
}

.image-preview {
  text-align: center;
  margin-top: 15px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.image-error {
  color: #dc3545;
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 6px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-submit {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.text-primary {
  color: #3498db !important;
}

.mr-1 {
  margin-right: 0.25rem !important;
}

.mr-2 {
  margin-right: 0.5rem !important;
}

.mt-3 {
  margin-top: 1rem !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-love-list-edit-page {
    padding: 20px 10px;
  }
  
  .card-body {
    padding: 20px 15px;
  }
  
  .header-title {
    font-size: 20px;
  }
  
  .status-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .form-actions {
    justify-content: center;
  }
}
</style>