<template>
  <div class="admin-little-add-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <h4 class="header-title">
                  <i class="mdi mdi-pencil-box-outline text-primary mr-2"></i>
                  {{ isEditMode ? '编辑文章' : '新增文章' }}
                </h4>
              </div>

              <div v-if="loading" class="text-center loading-container">
                <div class="spinner-border" role="status">
                  <span class="sr-only">加载中...</span>
                </div>
                <p class="mt-3">正在加载文章内容...</p>
              </div>

              <form v-else class="form-container" @submit.prevent="submitForm" novalidate>
                <div class="form-row">
                  <div class="form-group col-md-6 mx-auto">
                    <label for="example-select">发布者</label>
                    <select class="form-control custom-select" id="example-select" v-model="formData.articlename">
                      <option :value="siteConfig.boy">{{ siteConfig.boy }}</option>
                      <option :value="siteConfig.girl">{{ siteConfig.girl }}</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group col-md-6 mx-auto">
                    <label for="validationCustom01">文章标题</label>
                    <input 
                      type="text" 
                      class="form-control custom-input" 
                      id="validationCustom01" 
                      placeholder="请输入文章标题"
                      v-model="formData.articletitle" 
                      required
                    >
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group col-12">
                    <label for="editor">文章内容</label>
                    <div v-if="!editorLoaded" class="fallback-editor">
                      <textarea 
                        class="form-control" 
                        v-model="formData.articletext" 
                        placeholder="请输入文章内容..."
                        rows="15"
                      ></textarea>
                    </div>
                    <div v-else id="editormd-container" class="editor-container">
                      <textarea style="display:none;" v-model="formData.articletext"></textarea>
                    </div>
                  </div>
                </div>
                
                <div class="form-group text-center mt-4">
                  <button 
                    class="btn btn-submit" 
                    type="button" 
                    @click="submitForm"
                    :disabled="submitting"
                  >
                    <i class="mdi" :class="isEditMode ? 'mdi-update' : 'mdi-send'"></i>
                    {{ submitting ? (isEditMode ? '更新中...' : '发布中...') : (isEditMode ? '更新文章' : '发布文章') }}
                  </button>
                </div>
              </form>

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
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { app, ensureLogin } from '@/utils/cloudbase'
import CustomModal from '@/components/CustomModal.vue'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminLittleAddPage',
  components: {
    CustomModal
  },
  setup() {
    const { modalState, showSuccess, showError, showWarning, closeModal, confirmModal, cancelModal } = useModal()
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const authenticated = ref(false)
    const submitting = ref(false)
    const loading = ref(false)
    const editorLoaded = ref(false)
    let editor = null

    // 判断是编辑模式还是新增模式
    const isEditMode = computed(() => !!route.params.id)
    const articleId = computed(() => route.params.id)


    // 表单数据
    const formData = reactive({
      articletitle: '',
      articletext: '',
      articlename: ''
    })

    // 网站配置
    const siteConfig = reactive({
      boy: '男孩名字',
      girl: '女孩名字'
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

    // 加载现有文章内容（编辑模式）
    const loadArticle = async () => {
      if (!isEditMode.value) return

      try {
        loading.value = true

        // 确保已经身份验证
        if (!authenticated.value) {
          await doAuth()
        }

        // 调用云函数获取文章详情
        const result = await app.callFunction({
          name: 'article',
          data: {
            action: 'getArticle',
            data: {
              id: articleId.value
            }
          }
        })


        if (result.result && result.result.success && result.result.data) {
          let article = result.result.data
          
          // 处理特殊的数据结构，如果数据在 data["0"] 中
          if (article["0"]) {
            article = article["0"]
          }
          
          // 填充表单数据
          formData.articletitle = article.articletitle || ''
          formData.articletext = article.articletext || ''
          formData.articlename = article.articlename || ''
          
        } else {
          alert('加载文章失败: ' + (result.result?.message || '文章不存在'))
          router.push('/admin/little')
        }
      } catch (error) {
        alert('加载文章失败，请重试')
        router.push('/admin/little')
      } finally {
        loading.value = false
      }
    }

    // 表单提交
    const submitForm = async () => {
      // 如果使用了Editor.md，先同步内容
      if (editor && editorLoaded.value) {
        try {
          formData.articletext = editor.getMarkdown();
        } catch (error) {
        }
      }
      
      // 表单验证
      if (!formData.articletitle.trim()) {
        await showWarning('文章标题不能为空', '输入提示')
        return
      }
      
      if (!formData.articletext.trim()) {
        await showWarning('文章内容不能为空', '输入提示')
        return
      }

      if (!formData.articlename.trim()) {
        await showWarning('请选择发布者', '输入提示')
        return
      }
      
      try {
        submitting.value = true

        // 确保已经身份验证
        if (!authenticated.value) {
          await doAuth()
        }


        // 根据模式调用不同的云函数接口
        const action = isEditMode.value ? 'updateArticle' : 'addArticle'
        const data = {
          articletitle: formData.articletitle.trim(),
          articletext: formData.articletext.trim(),
          articlename: formData.articlename.trim(),
          articletime: new Date().toISOString().split('T')[0] // 当前日期
        }

        // 如果是编辑模式，添加文章ID（使用_id字段）
        if (isEditMode.value) {
          data._id = articleId.value
        }

        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          await showError('请先登录管理员账号', '登录提示')
          router.push('/admin/login')
          return
        }

        const result = await app.callFunction({
          name: 'article',
          data: {
            action: action,
            data: data,
            token: token
          }
        })

        if (result.result && result.result.success) {
          await showSuccess(isEditMode.value ? '文章更新成功！' : '文章发布成功！', '操作成功')
          
          if (!isEditMode.value) {
            // 新增模式：重置表单
            formData.articletitle = ''
            formData.articletext = ''
            // 保持发布者选择不变
          }
          
          // 跳转到文章列表页
          router.push('/admin/little')
        } else {
          await showError('操作失败: ' + (result.result?.message || '未知错误'), '操作失败')
        }
      } catch (error) {
        await showError('操作失败，请重试', '操作失败')
      } finally {
        submitting.value = false
      }
    }

    // 获取网站配置
    const fetchSiteConfig = async () => {
      try {
        // 确保已经身份验证
        if (!authenticated.value) {
          await doAuth()
        }

        // 调用云函数获取设置
        const result = await app.callFunction({
          name: 'settings',
          data: {
            action: 'getSettings'
          }
        })


        if (result.result && result.result.success) {
          const settings = result.result.data
          
          // 更新配置 - 使用正确的字段名
          siteConfig.boy = settings.text?.boy || '男孩名字'
          siteConfig.girl = settings.text?.girl || '女孩名字'
          
          // 设置默认发布者（如果不是编辑模式）
          if (!isEditMode.value) {
            formData.articlename = siteConfig.boy
          }
          
        } else {
          // 使用默认值
          if (!isEditMode.value) {
            formData.articlename = siteConfig.boy
          }
        }
      } catch (error) {
        // 使用默认值
        if (!isEditMode.value) {
          formData.articlename = siteConfig.boy
        }
      }
    }

    // 等待Editor.md加载
    const waitForEditorMd = () => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 最多等待5秒
        
        const checkEditorMd = () => {
          attempts++;
          if (typeof window !== 'undefined' && window.editormd && window.jQuery) {
            resolve(true);
          } else if (attempts >= maxAttempts) {
            reject(new Error('Editor.md 加载超时'));
          } else {
            setTimeout(checkEditorMd, 100);
          }
        };
        
        checkEditorMd();
      });
    };

    // 初始化Editor.md编辑器
    const initEditor = async () => {
      try {
        // 等待Editor.md加载完成
        await waitForEditorMd();
        
        editorLoaded.value = true;
        
        // 等待DOM更新
        await nextTick();
        
        // 初始化编辑器 - 使用与PHP版本相同的简化配置
        editor = window.editormd("editormd-container", {
          width: "100%",
          height: 500,
          path: "/editormd/lib/",
          htmlDecode: true,
          placeholder: "请输入文章内容...",
          markdown: formData.articletext || "",
          saveHTMLToTextarea: true,
          onchange: function() {
            // 将编辑器内容同步到formData
            formData.articletext = this.getMarkdown();
            
            // 每次内容变化时也应用视频样式
            setTimeout(() => {
              const previewContainer = document.querySelector('.editormd-preview-container');
              if (previewContainer) {
                const videos = previewContainer.querySelectorAll('video');
                videos.forEach(video => {
                  video.style.maxWidth = '100%';
                  video.style.maxHeight = '300px';
                  video.style.width = 'auto';
                  video.style.height = 'auto';
                  video.style.objectFit = 'contain';
                  video.style.display = 'block';
                  video.style.margin = '10px 0';
                });
              }
            }, 100);
          },
          onload: function() {
            // 如果有初始内容，设置到编辑器中
            if (formData.articletext) {
              this.setMarkdown(formData.articletext);
            }
            
            // 强制应用视频样式
            setTimeout(() => {
              const previewContainer = document.querySelector('.editormd-preview-container');
              if (previewContainer) {
                const videos = previewContainer.querySelectorAll('video');
                videos.forEach(video => {
                  video.style.maxWidth = '100%';
                  video.style.maxHeight = '300px';
                  video.style.width = 'auto';
                  video.style.height = 'auto';
                  video.style.objectFit = 'contain';
                  video.style.display = 'block';
                  video.style.margin = '10px 0';
                });
              }
            }, 500);
          }
        });
        
      } catch (error) {
        editorLoaded.value = false;
      }
    };

    onMounted(async () => {
      try {
        // 先进行身份验证
        await doAuth()
        
        // 获取网站配置
        await fetchSiteConfig()
        
        // 如果是编辑模式，加载文章内容
        if (isEditMode.value) {
          await loadArticle()
        }
        
        // 初始化编辑器
        await initEditor();
      } catch (error) {
        await showError('初始化失败，请刷新页面重试', '初始化失败')
      }
    })

    return {
      formData,
      siteConfig,
      submitting,
      loading,
      isEditMode,
      editorLoaded,
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
/* 引入Google字体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.admin-little-add-page {
  padding: 30px 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.container-fluid {
  max-width: 1600px;
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

.size_18 {
  font-size: 24px !important;
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
#example-select {
width: 60%;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #667eea;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

select.form-control {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px 12px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

textarea.form-control {
  height: auto;
  resize: vertical;
  min-height: 150px;
}

.text_right {
  text-align: right;
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
  cursor: pointer;
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

.spinner-border {
  width: 3rem;
  height: 3rem;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
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

/* Editor.md 相关样式 */
.editor-container {
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  max-width: 100%;
}

.fallback-editor textarea {
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.fallback-editor textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

#editormd-container {
  border-radius: 8px;
  max-width: 100%;
  overflow: hidden;
}

/* EditorMD 工具栏样式优化 */
.editormd-toolbar {
  border-radius: 8px 8px 0 0 !important;
  background: #f8f9fa !important;
  border-bottom: 1px solid #e9ecef !important;
  height: auto !important;
  min-height: 40px !important;
  padding: 5px 10px !important;
}

/* EditorMD 工具栏按钮样式 */
.editormd-toolbar .fa,
.editormd-toolbar .editormd-ico {
  font-size: 14px !important;
  padding: 6px 8px !important;
  margin: 2px !important;
}

/* CodeMirror 编辑器样式 */
.CodeMirror {
  border-radius: 0 0 8px 8px !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  height: 400px !important;
  max-height: 500px !important;
}

/* EditorMD 预览面板样式 - 模仿ArticlePage样式 */
.editormd-preview {
  border-radius: 0 0 8px 0 !important;
  font-size: 1.2rem !important;
  line-height: 2.5rem !important;
  letter-spacing: 0.2rem !important;
  font-family: 'Noto Serif SC', serif !important;
  font-weight: 400 !important;
  padding: 15px !important;
  overflow-x: auto !important;
  background: #fff !important;
}

/* 预览区域标题样式 - 彩色背景 */
.editormd-preview h1 {
  position: relative !important;
  padding: 0.5rem 1rem !important;
  padding-left: 1.5rem !important;
  box-sizing: border-box !important;
  border-radius: 0.35rem !important;
  margin: 0.8rem 0 !important;
  font-size: 1.5rem !important;
  line-height: 1.5em !important;
  font-weight: 700 !important;
  background: #e5edff !important;
  color: #007bff !important;
  font-family: 'Noto Serif SC', serif !important;
}

.editormd-preview h2 {
  position: relative !important;
  padding: 0.5rem 1rem !important;
  padding-left: 1.5rem !important;
  box-sizing: border-box !important;
  border-radius: 0.35rem !important;
  margin: 0.8rem 0 !important;
  font-size: 1.5rem !important;
  line-height: 1.5em !important;
  font-weight: 700 !important;
  background: #f3e7ff !important;
  color: #7f00ff !important;
  font-family: 'Noto Serif SC', serif !important;
}

.editormd-preview h3 {
  position: relative !important;
  padding: 0.5rem 1rem !important;
  padding-left: 1.5rem !important;
  box-sizing: border-box !important;
  border-radius: 0.35rem !important;
  margin: 0.8rem 0 !important;
  font-size: 1.5rem !important;
  line-height: 1.5em !important;
  font-weight: 700 !important;
  background: #ffe7ec !important;
  color: #ff0035 !important;
  font-family: 'Noto Serif SC', serif !important;
}

/* 标题前的白色装饰条 */
.editormd-preview h1::before,
.editormd-preview h2::before,
.editormd-preview h3::before {
  content: "" !important;
  position: absolute !important;
  background: #ffffff !important;
  width: 4px !important;
  height: 70% !important;
  border-radius: 10rem !important;
  top: 50% !important;
  left: 0.95rem !important;
  transform: translate(-50%, -50%) !important;
}

.editormd-preview h4,
.editormd-preview h5,
.editormd-preview h6 {
  font-size: 1.5rem !important;
  line-height: 1.5em !important;
  color: #373737 !important;
  font-weight: 700 !important;
  margin: 0.8rem 0 !important;
  font-family: 'Noto Serif SC', serif !important;
}

.editormd-preview h4 {
  border-bottom: 1px solid #bfbfbf !important;
}

.editormd-preview h5 {
  border-bottom: 1px dashed #bfbfbf !important;
}

/* 段落样式 */
.editormd-preview p {
  margin-bottom: 1.2rem !important;
  text-indent: 2em !important;
  font-family: 'Noto Serif SC', serif !important;
}

/* 文本样式 */
.editormd-preview b,
.editormd-preview strong {
  font-weight: 700 !important;
}

.editormd-preview s,
.editormd-preview del {
  color: #ff9191 !important;
}

.editormd-preview i,
.editormd-preview em {
  font-style: italic !important;
  color: #575757 !important;
}

/* 代码样式 */
.editormd-preview code {
  padding: 0.2rem 0.3rem !important;
  border-radius: 0.4rem !important;
  font-size: 1rem !important;
  color: #ff5916 !important;
  background-color: rgb(255 241 221) !important;
  font-family: 'Noto Serif SC', serif !important;
  font-weight: 700 !important;
  margin: 0 0.3rem !important;
}

/* 引用块样式 */
.editormd-preview blockquote {
  display: block !important;
  width: 100% !important;
  padding: 1rem !important;
  border-left: 4px solid #fd7e14 !important;
  border-radius: 0.35rem !important;
  color: #fd7e14 !important;
  background-color: rgba(253, 126, 20, 0.1) !important;
  box-sizing: border-box !important;
  font-weight: 700 !important;
  line-height: 1.5em !important;
  margin: 1.5rem 0 !important;
  font-family: 'Noto Serif SC', serif !important;
}

/* 分割线样式 */
.editormd-preview hr {
  height: 5px !important;
  border: none !important;
  border-top: 4px dotted #ffa1a7 !important;
  text-align: center !important;
  width: 75% !important;
  margin: 35px auto !important;
}

/* EditorMD 预览区域媒体元素响应式样式 */
.editormd-preview img,
.editormd-preview video,
.editormd-preview audio,
.editormd-preview iframe {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 1.5rem 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 8px 0 rgb(28 31 33 / 15%) !important;
}

/* 视频元素特殊处理 */
.editormd-preview video {
  width: 100% !important;
  border-radius: 1rem !important;
  box-shadow: 0px 6px 20px rgb(122 122 122 / 35%) !important;
  max-height: 450px !important;
  object-fit: cover !important;
}

/* 图片元素特殊处理 */
.editormd-preview img {
  width: 100% !important;
  height: 100% !important;
  max-height: 450px !important;
  object-fit: cover !important;
  box-shadow: 0 4px 8px 0 rgb(28 31 33 / 15%) !important;
  border-radius: 12px !important;
  margin: 1.5rem 0 !important;
}

/* iframe 元素特殊处理 */
.editormd-preview iframe {
  width: 100% !important;
  height: 350px !important;
  border-radius: 25px !important;
  border: 2px solid #d9d9d9d1 !important;
  box-shadow: 2px 1px 15px rgb(36 37 38 / 44%) !important;
  margin: 20px 0 !important;
}

/* 列表样式 */
.editormd-preview ul,
.editormd-preview ol {
  margin: 1rem 0 !important;
  padding-left: 2rem !important;
  font-family: 'Noto Serif SC', serif !important;
}

.editormd-preview li {
  margin-bottom: 0.5rem !important;
  line-height: 1.8 !important;
}

/* 表格样式 */
.editormd-preview table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 1.5rem 0 !important;
  font-family: 'Noto Serif SC', serif !important;
}

.editormd-preview th,
.editormd-preview td {
  border: 1px solid #e9ecef !important;
  padding: 0.75rem !important;
  text-align: left !important;
}

.editormd-preview th {
  background-color: #f8f9fa !important;
  font-weight: 700 !important;
}

/* EditorMD 容器整体样式控制 */
.editormd {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

/* EditorMD 编辑区域样式 */
.editormd-editor {
  width: 50% !important;
  border-right: 1px solid #e9ecef !important;
}

/* EditorMD 预览区域样式 */
.editormd-preview-container {
  width: 50% !important;
  background: #fff !important;
}

/* 全屏模式下的样式调整 */
.editormd-fullscreen {
  z-index: 9999 !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .CodeMirror {
    height: 300px !important;
    font-size: 12px !important;
  }
  
  .editormd-toolbar .fa,
  .editormd-toolbar .editormd-ico {
    font-size: 12px !important;
    padding: 4px 6px !important;
  }
  
  .editormd-preview {
    font-size: 12px !important;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-little-add-page {
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
</style>