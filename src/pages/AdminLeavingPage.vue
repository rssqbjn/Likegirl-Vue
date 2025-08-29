<template>
  <div class="admin-leaving-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-xl-10">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <div class="title-section">
                  <h4 class="header-title">
                    <i class="mdi mdi-message-text text-primary mr-2"></i>
                    留言管理
                    <span class="message-count">
                      共 <b>{{ filteredMessages.length }}</b> 条
                    </span>
                  </h4>
                </div>
                <div class="header-actions">
                  <!-- 搜索框 -->
                  <div class="search-box">
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      placeholder="搜索留言内容或用户名..." 
                      class="search-input"
                    />
                    <i class="search-icon">🔍</i>
                  </div>
                  
                  <router-link to="/admin/leaving-settings">
                    <button type="button" class="btn btn-settings">
                      <i class="mdi mdi-cog mr-1"></i> 留言设置
                    </button>
                  </router-link>
                </div>
              </div>
              
              <div class="table-container">
                <div class="table-responsive">
                  <table id="basic-datatable" class="table table-modern">
                    <thead>
                      <tr>
                        <th class="text-center">序号</th>
                        <th class="text-center">留言内容</th>
                        <th class="text-center">时间</th>
                        <th class="text-center">用户名</th>
                        <th class="text-center">QQ</th>
                        <th class="text-center">IP地址</th>
                        <th class="text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loading" class="text-center">
                        <td colspan="7" class="py-4">加载中...</td>
                      </tr>
                      <tr v-else-if="paginatedMessages.length === 0" class="text-center">
                        <td colspan="7" class="py-4">{{ filteredMessages.length === 0 ? '暂无数据' : '没有匹配的搜索结果' }}</td>
                      </tr>
                      <tr v-for="(message, index) in paginatedMessages" :key="message.id" class="table-row">
                        <td class="text-center">
                          <div class="serial-number">
                            {{ (currentPage - 1) * pageSize + index + 1 }}
                          </div>
                        </td>
                        <td class="text-center">
                          <div class="message-text">
                            {{ message.text }}
                          </div>
                        </td>
                        <td class="text-center">
                          <div class="date-info">
                            <div class="full-date">{{ formatDate(message.time) }}</div>
                            <div class="time-ago">{{ timeAgo(message.time) }}</div>
                          </div>
                        </td>
                        <td class="text-center">
                          <div class="user-badge">
                            <i class="mdi mdi-account-circle mr-1"></i>
                            {{ message.name }}
                          </div>
                        </td>
                        <td class="text-center">{{ message.qq }}</td>
                        <td class="text-center">
                          <div class="ip-info">
                            <div class="ip-address">{{ message.ip || '127.0.0.1' }}</div>
                            <div class="ip-location">{{ message.city || '未知' }}</div>
                          </div>
                        </td>
                        <td class="text-center">
                          <button type="button" class="btn btn-delete" @click="deleteMessage(message.id, message.text)">
                            <i class="mdi mdi-delete mr-1"></i>删除
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- 分页控件 -->
                <div class="pagination-container">
                  <div class="pagination-settings">
                    <span class="page-size-label">每页显示：</span>
                    <select v-model="pageSize" class="page-size-select">
                      <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}条</option>
                    </select>
                  </div>
                  
                  <div class="pagination-controls">
                    <button 
                      class="pagination-btn" 
                      :class="{ disabled: currentPage === 1 }"
                      @click="currentPage > 1 && (currentPage--)"
                    >
                      &lt;
                    </button>
                    
                    <div class="pagination-pages">
                      <button 
                        v-for="page in displayedPages" 
                        :key="page" 
                        class="pagination-page" 
                        :class="{ active: currentPage === page }"
                        @click="currentPage = page"
                      >
                        {{ page }}
                      </button>
                    </div>
                    
                    <button 
                      class="pagination-btn" 
                      :class="{ disabled: currentPage === totalPages }"
                      @click="currentPage < totalPages && (currentPage++)"
                    >
                      &gt;
                    </button>
                  </div>
                  
                  <div class="pagination-info">
                    {{ filteredMessages.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredMessages.length)} / 共 ${filteredMessages.length} 条` : '暂无数据' }}
                  </div>
                </div>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { app, ensureLogin } from '@/utils/cloudbase'
import CustomModal from '@/components/CustomModal.vue'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminLeavingPage',
  components: {
    CustomModal
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    
    const leavingMessages = ref([])
    const loading = ref(false)
    const isAuthenticated = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const pageSizeOptions = ref([5, 10, 20, 50])
    const searchQuery = ref('')
    
    // 弹窗相关
    const { modalState, showSuccess, showError, showWarning, showConfirm, closeModal, confirmModal, cancelModal } = useModal()
    
    // 保留原有的提示信息状态（用于兼容）
    const showSuccessOld = ref(false)
    const showErrorOld = ref(false)
    const showConfirmOld = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')
    const confirmMessage = ref('')
    const confirmCallback = ref(null)

    // 根据搜索条件过滤列表
    const filteredMessages = computed(() => {
      if (!searchQuery.value) return leavingMessages.value
      
      const query = searchQuery.value.toLowerCase().trim()
      return leavingMessages.value.filter(message => 
        (message.text && message.text.toLowerCase().includes(query)) ||
        (message.name && message.name.toLowerCase().includes(query))
      )
    })

    // 计算分页后的列表
    const paginatedMessages = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      return filteredMessages.value.slice(startIndex, endIndex)
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredMessages.value.length / pageSize.value) || 1
    })

    // 计算要显示的页码
    const displayedPages = computed(() => {
      const pages = []
      const maxDisplayPages = 5 // 最多显示5个页码
      
      if (totalPages.value <= maxDisplayPages) {
        // 如果总页数小于等于最大显示页数，则显示所有页码
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i)
        }
      } else {
        // 否则，显示当前页附近的页码
        let startPage = Math.max(1, currentPage.value - 2)
        let endPage = Math.min(totalPages.value, startPage + maxDisplayPages - 1)
        
        // 调整起始页，确保显示maxDisplayPages个页码
        if (endPage - startPage + 1 < maxDisplayPages) {
          startPage = Math.max(1, endPage - maxDisplayPages + 1)
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
      }
      
      return pages
    })

    // 当页码或每页显示数量变化时，确保当前页码有效
    watch([pageSize, filteredMessages], () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
      }
    })

    // 当搜索条件变化时，重置到第一页
    watch(searchQuery, () => {
      currentPage.value = 1
    })

    // 显示成功提示（使用新的统一弹窗）
    const showSuccessMessage = (message) => {
      showSuccess('操作成功', message)
    }

    // 显示错误提示（使用新的统一弹窗）
    const showErrorMessage = (message) => {
      showError('操作失败', message)
    }

    // 显示确认对话框（使用新的统一弹窗）
    const showConfirmDialog = async (message, callback) => {
      try {
        const confirmed = await showConfirm(message,'确认操作')
        if (confirmed && callback) {
          callback()
        }
      } catch (error) {
      }
    }

    // 保留原有方法名以兼容现有代码
    const handleConfirm = () => {
      confirmModal()
    }

    const handleCancel = () => {
      cancelModal()
    }

    // 身份验证方法
    const authenticate = async () => {
      try {
        await ensureLogin()
        isAuthenticated.value = true
      } catch (error) {
        throw error
      }
    }

    // 获取留言列表
    const fetchMessages = async () => {
      loading.value = true
      try {
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }

        
        // 调用云函数获取留言列表
        const result = await app.callFunction({
          name: 'leaving',
          data: {
            action: 'getMessages',
            page: 1,
            limit: 100 // 获取更多数据用于管理
          }
        })

        if (result.result && result.result.success) {
          const data = result.result.data
          
          // 转换数据格式以适配前端显示
          leavingMessages.value = data.list.map(msg => ({
            id: msg._id || msg.id,
            name: msg.name,
            qq: msg.QQ,
            text: msg.text,
            time: typeof msg.time === 'string' ? parseInt(msg.time) * 1000 : msg.time,
            ip: msg.ip || '127.0.0.1',
            city: msg.city || '未知'
          }))

          // 更新统计数据
          if (store) {
            store.commit('setStats', {
              ...store.state.stats,
              leavingCount: leavingMessages.value.length
            })
          }

        } else {
          leavingMessages.value = []
        }
      } catch (error) {
        leavingMessages.value = []
        showErrorMessage('获取留言数据失败，请刷新页面重试')
      } finally {
        loading.value = false
      }
    }

    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const timeAgo = (timestamp) => {
      const seconds = Math.floor((Date.now() - timestamp) / 1000)
      
      let interval = Math.floor(seconds / 31536000)
      if (interval > 1) return interval + ' 年前'
      
      interval = Math.floor(seconds / 2592000)
      if (interval > 1) return interval + ' 个月前'
      
      interval = Math.floor(seconds / 86400)
      if (interval > 1) return interval + ' 天前'
      
      interval = Math.floor(seconds / 3600)
      if (interval > 1) return interval + ' 小时前'
      
      interval = Math.floor(seconds / 60)
      if (interval > 1) return interval + ' 分钟前'
      
      return Math.floor(seconds) + ' 秒前'
    }

    const deleteMessage = async (id, text) => {
      await showConfirmDialog(`您确认要删除 "${text}" 内容吗？此操作不可恢复。`, async () => {
        // 检查管理员令牌
        const token = localStorage.getItem('adminToken')
        if (!token) {
          showErrorMessage('未登录，请先登录')
          router.push('/admin/login')
          return
        }

        try {
          // 确保已经身份验证
          if (!isAuthenticated.value) {
            await authenticate()
          }

          // 调用云函数删除留言
          const result = await app.callFunction({
            name: 'leaving',
            data: {
              action: 'deleteMessage',
              token: token,
              data: {
                id: id
              }
            }
          })

          if (result.result && result.result.success) {
            // 从本地列表中移除
            leavingMessages.value = leavingMessages.value.filter(message => message.id !== id)
            
            // 更新统计数据
            if (store) {
              store.commit('setStats', {
                ...store.state.stats,
                leavingCount: leavingMessages.value.length
              })
            }

            showSuccessMessage('留言已成功删除')
          } else {
            showErrorMessage('删除失败: ' + (result.result?.message || '未知错误'))
          }
        } catch (error) {
          showErrorMessage('删除失败，请重试')
        }
      })
    }

    onMounted(async () => {
      try {
        // 先进行身份验证，再获取数据
        await authenticate()
        await fetchMessages()
      } catch (error) {
        showErrorMessage('初始化失败，请刷新页面重试')
      }
    })

    return {
      leavingMessages,
      loading,
      deleteMessage,
      formatDate,
      timeAgo,
      currentPage,
      pageSize,
      pageSizeOptions,
      paginatedMessages,
      totalPages,
      displayedPages,
      searchQuery,
      filteredMessages,
      modalState,
      closeModal,
      confirmModal,
      cancelModal,
      // 保留原有的变量名以兼容模板
      showSuccess: showSuccessOld,
      showError: showErrorOld,
      showConfirm: showConfirmOld,
      successMessage,
      errorMessage,
      confirmMessage,
      handleConfirm,
      handleCancel
    }
  }
}
</script>

<style scoped>
.admin-leaving-page {
  padding: 30px 20px;
  background: #f8f9fa;
  min-height: 100vh;
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

.message-count {
  font-size: 16px;
  background: #f1f5f9;
  padding: 5px 12px;
  border-radius: 20px;
  margin-left: 15px;
  color: #4b5563;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 搜索框样式 */
.search-box {
  position: relative;
  width: 250px;
}

.search-input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #495057;
  background-color: white;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
}

.btn-settings {
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.btn-settings:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.table-container {
  background: white;
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  margin: 0 auto;
}

.table-modern {
  width: 100%;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
}

.table-modern thead th {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  font-size: 16px;
  padding: 20px 15px;
  border: none;
  position: relative;
}

.table-modern thead th:first-child {
  border-top-left-radius: 10px;
}

.table-modern thead th:last-child {
  border-top-right-radius: 10px;
}

.table-modern tbody .table-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.table-modern tbody .table-row:hover {
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  transform: scale(1.01);
}

.table-modern tbody td {
  padding: 15px 10px;
  vertical-align: middle;
  border: none;
  font-size: 14px;
  color: #495057;
  text-align: center;
}

.serial-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  margin: 0 auto;
}

.message-text {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  margin: 0 auto;
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.full-date {
  font-size: 13px;
  color: #495057;
}

.time-ago {
  font-size: 12px;
  color: #6c757d;
  margin-top: 3px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  background: rgba(10, 207, 151, 0.18);
  color: #0acf97;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin: 0 auto;
}

.ip-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.ip-address {
  display: inline-block;
  padding: 3px 8px;
  background: rgba(250, 92, 124, 0.18);
  color: #fa5c7c;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 3px;
}

.ip-location {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

.btn-delete {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  background: linear-gradient(45deg, #dc3545, #fd7e14);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
  white-space: nowrap;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-settings {
  display: flex;
  align-items: center;
}

.page-size-label {
  font-size: 14px;
  color: #6c757d;
  margin-right: 8px;
}

.page-size-select {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-size-select:hover {
  border-color: #667eea;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: bold;
}

.pagination-btn:hover:not(.disabled) {
  background-color: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 5px;
}

.pagination-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-page:hover:not(.active) {
  background-color: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

.pagination-page.active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
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

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem !important;
  padding-bottom: 1.5rem !important;
}
.table-responsive {
  border-radius: 10px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-leaving-page {
    padding: 20px 10px;
  }
  
  .card-body {
    padding: 20px 15px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-title {
    font-size: 20px;
    justify-content: center;
  }
  
  .message-count {
    margin-left: 10px;
    font-size: 14px;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .search-box {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .message-text {
    max-width: 150px;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
  
  .pagination-info {
    margin-top: 10px;
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

/* 消息提示样式 */
.toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 1000;
  padding: 16px 20px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: linear-gradient(135deg, #00b894, #00cec9);
}

.toast-error {
  background: linear-gradient(135deg, #e17055, #d63031);
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin-left: auto;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 确认对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

.modal-dialog {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: scaleIn 0.3s ease;
}

.modal-header {
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-bottom: none;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.modal-body {
  padding: 25px;
  font-size: 1rem;
  color: #2c3e50;
  line-height: 1.6;
  text-align: center;
}

.modal-body p {
  margin: 0;
}

.modal-footer {
  padding: 20px 25px;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  gap: 15px;
  border-top: 1px solid #e9ecef;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #c82333, #bd2130);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式设计 - 模态框 */
@media (max-width: 768px) {
  .modal-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
  
  .toast {
    top: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
  }
}
</style>
