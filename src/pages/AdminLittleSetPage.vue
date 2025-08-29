<template>
  <div class="admin-little-set-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <h4 class="header-title">
                  <i class="mdi mdi-book-open-page-variant text-primary mr-2"></i>
                  点点滴滴管理
                </h4>
                <div class="header-actions">
                  <!-- 搜索框 -->
                  <div class="search-box">
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      placeholder="搜索文章标题..." 
                      class="search-input"
                    />
                    <i class="search-icon">🔍</i>
                  </div>
                  
                  <router-link to="/admin/little-add">
                    <button type="button" class="btn btn-primary btn-modern">
                      <i class="mdi mdi-plus-circle mr-2"></i>
                      新增文章
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
                        <th class="text-center">标题</th>
                        <th class="text-center">发布时间</th>
                        <th class="text-center">发布者</th>
                        <th class="text-center" style="width:200px;">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loading" class="text-center">
                        <td colspan="5" class="py-4">加载中...</td>
                      </tr>
                      <tr v-else-if="paginatedArticles.length === 0" class="text-center">
                        <td colspan="5" class="py-4">{{ filteredArticles.length === 0 ? '暂无数据' : '没有匹配的搜索结果' }}</td>
                      </tr>
                      <tr v-for="(article, index) in paginatedArticles" :key="article.id" class="table-row">
                        <td class="text-center">
                          <div class="serial-number">
                            {{ (currentPage - 1) * pageSize + index + 1 }}
                          </div>
                        </td>
                        <td class="text-center">{{ article.articletitle }}</td>
                        <td class="text-center">{{ article.articletime }}</td>
                        <td class="text-center">{{ article.articlename }}</td>
                        <td class="text-center">
                          <div class="action-buttons">
                            <router-link :to="`/admin/little-edit/${article.id}`">
                              <button type="button" class="btn btn-edit">
                                <i class="mdi mdi-pencil mr-1"></i>修改
                              </button>
                            </router-link>
                            <button type="button" class="btn btn-delete" @click="deleteArticle(article.id, article.articletitle)">
                              <i class="mdi mdi-delete mr-1"></i>删除
                            </button>
                          </div>
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
                    {{ filteredArticles.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredArticles.length)} / 共 ${filteredArticles.length} 条` : '暂无数据' }}
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { app, ensureLogin } from '@/utils/cloudbase'
import CustomModal from '@/components/CustomModal.vue'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminLittleSetPage',
  components: {
    CustomModal
  },
  setup() {
    const { modalState, showSuccess, showError, showConfirm, closeModal, confirmModal, cancelModal } = useModal()
    const router = useRouter()
    const articles = ref([])
    const loading = ref(false)
    const authenticated = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const pageSizeOptions = ref([5, 10, 20, 50])
    const searchQuery = ref('')
    

    // 根据搜索条件过滤列表
    const filteredArticles = computed(() => {
      if (!searchQuery.value) return articles.value
      
      const query = searchQuery.value.toLowerCase().trim()
      return articles.value.filter(article => 
        article.articletitle && article.articletitle.toLowerCase().includes(query)
      )
    })

    // 计算分页后的列表
    const paginatedArticles = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      return filteredArticles.value.slice(startIndex, endIndex)
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredArticles.value.length / pageSize.value) || 1
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
    watch([pageSize, filteredArticles], () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
      }
    })

    // 当搜索条件变化时，重置到第一页
    watch(searchQuery, () => {
      currentPage.value = 1
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

    // 获取文章列表
    const fetchArticles = async () => {
      try {
        loading.value = true
        
        // 确保已经身份验证
        if (!authenticated.value) {
          await doAuth()
        }
        
        // 调用云函数获取文章列表
        const result = await app.callFunction({
          name: 'article',
          data: {
            action: 'getArticles',
            page: 1,
            limit: 100 // 获取更多数据用于管理
          }
        })

        if (result.result && result.result.success) {
          const data = result.result.data
          
          // 转换数据格式以适配前端显示
          articles.value = data.list.map(article => ({
            id: article._id || article.id,
            articletitle: article.articletitle,
            articletime: article.articletime,
            articlename: article.articlename
          }))
        } else {
          articles.value = []
        }
      } catch (error) {
        articles.value = []
        await showError('获取文章数据失败，请刷新页面重试', '加载失败')
      } finally {
        loading.value = false
      }
    }

    // 删除文章
    const deleteArticle = async (id, title) => {
      try {
        await showConfirm(`您确认要删除标题为 "${title}" 的文章吗？`, '确认删除')
        
        // 确保已经身份验证
        if (!authenticated.value) {
          await doAuth()
        }

        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          await showError('请先登录管理员账号', '登录提示')
          router.push('/admin/login')
          return
        }

        // 调用云函数删除文章
        const result = await app.callFunction({
          name: 'article',
          data: {
            action: 'deleteArticle',
            data: {
              id: id
            },
            token: token
          }
        })

        if (result.result && result.result.success) {
          // 从本地列表中移除
          articles.value = articles.value.filter(article => article.id !== id)
          
          await showSuccess('文章删除成功！', '操作成功')
        } else {
          await showError('删除失败: ' + (result.result?.message || '未知错误'), '删除失败')
        }
      } catch (error) {
        if (error.message !== 'User cancelled' && error.message !== 'Modal closed') {
          await showError('删除失败，请重试', '操作失败')
        }
      }
    }

    onMounted(async () => {
      try {
        // 先进行身份验证，再获取数据
        await doAuth()
        await fetchArticles()
      } catch (error) {
        await showError('初始化失败，请刷新页面重试', '加载失败')
      }
    })

    return {
      articles,
      loading,
      deleteArticle,
      currentPage,
      pageSize,
      pageSizeOptions,
      paginatedArticles,
      totalPages,
      displayedPages,
      searchQuery,
      filteredArticles,
      modalState,
      closeModal,
      confirmModal,
      cancelModal
    }
  }
}
</script>

<style scoped>
.admin-little-set-page {
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
  padding: 40px;
}

.header-section {
  display: flex;
  justify-content: space-between;
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

.btn-modern {
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  background: linear-gradient(45deg, #764ba2, #667eea);
}

.table-container {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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
  padding: 20px 15px;
  vertical-align: middle;
  border: none;
  font-size: 15px;
  color: #2c3e50;
}

.serial-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.btn-edit {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  background: linear-gradient(45deg, #20c997, #28a745);
  color: white;
  text-decoration: none;
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
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  background: linear-gradient(45deg, #fd7e14, #dc3545);
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

.text-center {
  text-align: center;
}

.text-primary {
  color: #667eea !important;
}

.mr-1 {
  margin-right: 0.25rem !important;
}

.mr-2 {
  margin-right: 0.5rem !important;
}

.table-responsive {
  border-radius: 10px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-little-set-page {
    padding: 20px 10px;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .search-box {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 5px;
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
</style>