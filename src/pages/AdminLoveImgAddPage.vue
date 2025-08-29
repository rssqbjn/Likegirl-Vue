<template>
  <div class="admin-love-img-add-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <h4 class="header-title">
                  <i class="mdi mdi-image-plus text-primary mr-2"></i>
                  {{ isEditMode ? '编辑图片' : '新增图片' }}
                </h4>
              </div>

              <div v-if="loading" class="text-center loading-container">
                <div class="spinner-border" role="status">
                  <span class="sr-only">加载中...</span>
                </div>
                <p class="mt-3">正在加载图片信息...</p>
              </div>

              <div v-else class="form-container">
                <form class="needs-validation" @submit.prevent="submitForm" novalidate>
                  <div class="form-group">
                    <label for="example-date">日期</label>
                    <div class="date-input-container">
                      <input 
                        class="form-control" 
                        id="example-date" 
                        type="date" 
                        v-model="formData.imgDatd" 
                        placeholder="日期" 
                        required
                      >
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="imgText">
                      图片描述
                      <span class="description-badge">尽量控制在25个字符以内</span>
                    </label>
                    <input 
                      id="imgText"
                      type="text" 
                      class="form-control" 
                      v-model="formData.imgText" 
                      placeholder="请输入图片描述" 
                      required
                    >
                  </div>

                  <div class="form-group" id="img_url">
                    <label for="imgUrl">图片URL</label>
                    <input 
                      id="imgUrl"
                      type="text" 
                      class="form-control" 
                      v-model="formData.imgUrl" 
                      placeholder="请输入图片URL地址" 
                      required
                    >
                    <div class="url-preview" v-if="formData.imgUrl">
                      <img :src="formData.imgUrl" alt="图片预览" class="img-preview" @error="handleImageError">
                      <div class="preview-overlay" v-if="imageError">图片加载失败</div>
                    </div>
                  </div>
                  
                  <div class="form-actions">
                    <button 
                      class="btn btn-submit" 
                      type="button" 
                      @click="submitForm"
                      :disabled="submitting"
                    >
                      <i class="mdi" :class="isEditMode ? 'mdi-content-save' : 'mdi-plus-circle'"></i>
                      {{ submitting ? (isEditMode ? '更新中...' : '添加中...') : (isEditMode ? '更新图片' : '新增相册') }}
                    </button>
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'
import CustomModal from '@/components/CustomModal.vue'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminLoveImgAddPage',
  components: {
    CustomModal
  },
  setup() {
    const { modalState, showSuccess, showError, showWarning, closeModal, confirmModal, cancelModal } = useModal()
    const router = useRouter()
    const route = useRoute()
    const authenticated = ref(false)
    const loading = ref(false)
    const submitting = ref(false)
    const imageError = ref(false)

    // 判断是编辑模式还是新增模式
    const isEditMode = computed(() => !!route.params.id)
    const imageId = computed(() => route.params.id)

    
    // 表单数据
    const formData = reactive({
      imgDatd: new Date().toISOString().split('T')[0], // 当前日期，格式：YYYY-MM-DD
      imgText: '',
      imgUrl: ''
    })
    
    // 处理图片加载错误
    const handleImageError = () => {
      imageError.value = true;
    }
    
    // 监听图片URL变化，重置错误状态
    watch(() => formData.imgUrl, () => {
      imageError.value = false;
    })

    // 身份验证
    const doAuth = async () => {
      try {
        await ensureLogin()
        authenticated.value = true
      } catch (error) {
        throw error
      }
    }

    // 获取图片详情（编辑模式）
    const fetchImageDetails = async () => {
      if (!isEditMode.value) return

      try {
        loading.value = true

        // 确保已经身份验证
        if (!authenticated.value) {
          await doAuth()
        }

        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          router.push('/admin/login')
          return
        }

        // 调用云函数获取图片详情
        const result = await app.callFunction({
          name: 'loveImg',
          data: {
            action: 'getPhotoDetail',
            data: {
              id: imageId.value
            },
            token: token
          }
        })

        if (result.result && result.result.success && result.result.data) {
          const photo = result.result.data
          
          // 填充表单数据
          formData.imgDatd = photo.imgDatd || ''
          formData.imgText = photo.imgText || ''
          formData.imgUrl = photo.imgUrl || ''
          
        } else {
          await showError('加载图片详情失败: ' + (result.result?.message || '获取相册详情失败'), '加载失败')
          router.push('/admin/love-img')
        }
      } catch (error) {
        await showError('获取图片详情失败，请重试', '加载失败')
        router.push('/admin/love-img')
      } finally {
        loading.value = false
      }
    }

    // 表单提交
    const submitForm = async () => {
      // 表单验证
      if (!formData.imgText.trim()) {
        await showWarning('图片描述不能为空', '表单验证')
        return
      }
      
      if (!formData.imgUrl.trim()) {
        await showWarning('图片链接不能为空', '表单验证')
        return
      }

      if (!formData.imgDatd) {
        await showWarning('请选择日期', '表单验证')
        return
      }
      
      try {
        submitting.value = true

        // 确保已经身份验证
        if (!authenticated.value) {
          await doAuth()
        }

        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          alert('认证已过期，请重新登录')
          router.push('/admin/login')
          return
        }

        // 根据模式调用不同的云函数接口
        const action = isEditMode.value ? 'updatePhoto' : 'addPhoto'
        const data = {
          imgDatd: formData.imgDatd,
          imgText: formData.imgText.trim(),
          imgUrl: formData.imgUrl.trim()
        }

        // 如果是编辑模式，添加图片ID
        if (isEditMode.value) {
          data.id = imageId.value
        }

        const result = await app.callFunction({
          name: 'loveImg',
          data: {
            action: action,
            data: data,
            token: token
          }
        })
        if (result.result && result.result.success) {
          await showSuccess(isEditMode.value ? '图片修改成功！' : '图片添加成功！', '操作成功')
          
          if (!isEditMode.value) {
            // 新增模式：重置表单
            formData.imgText = ''
            formData.imgUrl = ''
            formData.imgDatd = new Date().toISOString().split('T')[0]
          }
          
          // 跳转到图片列表页
          router.push('/admin/love-img')
        } else {
          await showError('操作失败: ' + (result.result?.message || '未知错误'), '操作失败')
        }
      } catch (error) {
        await showError('保存失败，请重试', '操作失败')
      } finally {
        submitting.value = false
      }
    }

    onMounted(async () => {
      try {
        // 先进行身份验证
        await doAuth()
        
        // 如果是编辑模式，加载图片详情
        if (isEditMode.value) {
          await fetchImageDetails()
        }
      } catch (error) {
        await showError('初始化失败，请刷新页面重试', '初始化失败')
      }
    })

    return {
      formData,
      isEditMode,
      loading,
      submitting,
      submitForm,
      imageError,
      handleImageError,
      modalState,
      closeModal,
      confirmModal,
      cancelModal
    }
  }
}
</script>

<style scoped>
.admin-love-img-add-page {
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
  margin-bottom: 30px;
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
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #667eea;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.date-input-container {
  max-width: 300px;
}

.description-badge {
  display: inline-block;
  margin-left: 10px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
  border-radius: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-submit {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  background: linear-gradient(45deg, #764ba2, #667eea);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-container {
  padding: 40px 0;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
  color: #667eea;
}

.url-preview {
  margin-top: 15px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.img-preview {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  background-color: #f8f9fa;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.text-primary {
  color: #667eea !important;
}

.mr-2 {
  margin-right: 0.5rem !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-love-img-add-page {
    padding: 20px 10px;
  }
  
  .card-body {
    padding: 20px 15px;
  }
  
  .header-title {
    font-size: 20px;
  }
  
  .form-container {
    max-width: 100%;
  }
  
  .btn-submit {
    width: 100%;
    padding: 10px;
  }
  
  .date-input-container {
    max-width: 100%;
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

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
