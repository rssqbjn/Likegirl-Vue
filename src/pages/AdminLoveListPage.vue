<template>
  <div class="admin-love-list-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-xl-10">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <div class="title-section">
                  <h4 class="header-title">
                    <i class="mdi mdi-heart-multiple text-primary mr-2"></i>
                    恋爱清单
                  </h4>
                </div>
                <div class="header-actions">
                  <!-- 搜索框 -->
                  <div class="search-box">
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      placeholder="搜索事件标题..." 
                      class="search-input"
                    />
                    <i class="search-icon">🔍</i>
                  </div>
                  
                  <router-link to="/admin/love-list-add">
                    <button type="button" class="btn btn-add">
                      <i class="mdi mdi-plus-circle mr-1"></i>新增清单
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
                        <th class="text-center">事件标题</th>
                        <th class="text-center">完成状态</th>
                        <th class="text-center">图片预览</th>
                        <th class="text-center" style="width:180px;">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="loading" class="text-center">
                        <td colspan="5" class="py-4">加载中...</td>
                      </tr>
                      <tr v-else-if="paginatedList.length === 0" class="text-center">
                        <td colspan="5" class="py-4">{{ filteredList.length === 0 ? '暂无数据' : '没有匹配的搜索结果' }}</td>
                      </tr>
                      <tr v-for="(item, index) in paginatedList" :key="item._id" class="table-row">
                        <td class="text-center">
                          <div class="serial-number">
                            {{ (currentPage - 1) * pageSize + index + 1 }}
                          </div>
                        </td>
                        <td class="text-center">
                          <div class="event-title">{{ item.eventname }}</div>
                        </td>
                        <td class="text-center">
                          <span v-if="item.icon" class="badge badge-success-lighten">
                            <i class="mdi mdi-check-circle mr-1"></i>已完成
                          </span>
                          <span v-else class="badge badge-danger-lighten">
                            <i class="mdi mdi-clock-outline mr-1"></i>未完成
                          </span>
                        </td>
                        <td class="text-center">
                          <div class="image-preview">
                            <img v-if="item.imgurl && item.imgurl !== '0'" src="data:image/svg+xml;base64,PHN2ZyB0PSIxNzE4MDc0MDU3NzQyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjYzMzYiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTUxMiA1MTJtLTUxMiAwYTUxMiA1MTIgMCAxIDAgMTAyNCAwIDUxMiA1MTIgMCAxIDAtMTAyNCAwWiIgZmlsbD0iI0ZERUJFRCIgcC1pZD0iNjMzNyI+PC9wYXRoPjxwYXRoIGQ9Ik02NDIuNTYgNTEzLjI4bC0xNDAuOCAxMTEuMzYtNzUuNTItNjAuMTZMMjgxLjYgNTk5LjA0VjM3MS4yYzAtMjguMTYgMjMuMDQtNTEuMiA1MS4yLTUxLjJoMzU4LjRjMjguMTYgMCA1MS4yIDIzLjA0IDUxLjIgNTEuMnYyMjYuNTZsLTk5Ljg0LTg0LjQ4ek0zNzEuMiAzNzEuMmMtMjEuNzYgMC0zOC40IDE2LjY0LTM4LjQgMzguNHMxNi42NCAzOC40IDM4LjQgMzguNCAzOC40LTE2LjY0IDM4LjQtMzguNC0xNi42NC0zOC40LTM4LjQtMzguNHogbTQ5LjkyIDIyMC4xNmw3OS4zNiA2Mi43MiAxNDIuMDgtMTEyLjY0IDk5Ljg0IDg4LjMyVjY1Mi44YzAgMjguMTYtMjMuMDQgNTEuMi01MS4yIDUxLjJIMzMyLjhjLTI4LjE2IDAtNTEuMi0yMy4wNC01MS4yLTUxLjJ2LTI4LjE2bDEzOS41Mi0zMy4yOHoiIGZpbGw9IiNFQzNBNEUiIHAtaWQ9IjYzMzgiPjwvcGF0aD48L3N2Zz4=" class="preview-icon" alt="图片预览" style="max-height: 40px;" />
                            <span v-else class="no-image">暂无图片</span>
                          </div>
                        </td>
                        <td class="text-center">
                          <div class="action-buttons">
                            <router-link :to="`/admin/love-list-edit/${item._id}?icon=${item.icon ? 1 : 0}&name=${encodeURIComponent(item.eventname)}&imgurl=${encodeURIComponent(item.imgurl || '')}`">
                              <button type="button" class="btn btn-edit">
                                <i class="mdi mdi-pencil mr-1"></i>修改
                              </button>
                            </router-link>
                            <button type="button" class="btn btn-delete" @click="deleteItem(item._id, item.eventname)">
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
                    {{ filteredList.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredList.length)} / 共 ${filteredList.length} 条` : '暂无数据' }}
                  </div>
                </div>
              </div>
            </div> <!-- end card-body-->
          </div> <!-- end card -->
        </div><!-- end col-->
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
import { app, ensureLogin } from '@/utils/cloudbase'
import CustomModal from '@/components/CustomModal.vue'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminLoveListPage',
  components: {
    CustomModal
  },
  setup() {
    const { modalState, showSuccess, showError, showConfirm, closeModal, confirmModal, cancelModal } = useModal()
    const loveList = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const pageSizeOptions = ref([5, 10, 20, 50])
    const searchQuery = ref('')

    // 根据搜索条件过滤列表
    const filteredList = computed(() => {
      if (!searchQuery.value) return loveList.value
      
      const query = searchQuery.value.toLowerCase().trim()
      return loveList.value.filter(item => 
        item.eventname && item.eventname.toLowerCase().includes(query)
      )
    })

    // 计算分页后的列表
    const paginatedList = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      return filteredList.value.slice(startIndex, endIndex)
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredList.value.length / pageSize.value) || 1
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
    watch([pageSize, filteredList], () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
      }
    })

    // 当搜索条件变化时，重置到第一页
    watch(searchQuery, () => {
      currentPage.value = 1
    })



    // 获取恋爱清单列表
    const fetchLoveList = async () => {
      try {
        loading.value = true
        
        // 匿名登录
        await ensureLogin()
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          this.$router.push('/admin/login')
          return
        }

        // 调用云函数获取恋爱清单列表
        const result = await app.callFunction({
          name: 'lovelist',
          data: {
            action: 'getList',
            page: 1,
            limit: 100,
            token: token
          }
        })
        
        
        
        if (result.result && result.result.success) {
          // 获取列表并倒序排列，让新增加的显示在最上边
          const list = result.result.data.list || []
          loveList.value = list.reverse()
        } else {
          showError('获取失败', '获取恋爱清单列表失败，请重试')
        }
      } catch (error) {
        showError('获取失败', '获取恋爱清单列表失败，请重试')
      } finally {
        loading.value = false
      }
    }

    // 删除事件
    const deleteItem = async (id, eventname) => {
      try {
        const confirmed = await showConfirm(`您确认要删除内容为 ${eventname} 的事件吗？此操作不可恢复。`,'确认删除',)
        if (!confirmed) {
          return
        }

        // 匿名登录
        await ensureLogin()
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          showError('认证失败', '认证已过期，请重新登录')
          this.$router.push('/admin/login')
          return
        }

        // 调用云函数删除事件
        const result = await app.callFunction({
          name: 'lovelist',
          data: {
            action: 'deleteItem',
            data: {
              id: id
            },
            token: token
          }
        })
        
        if (result.result && result.result.success) {
          // 从列表中移除
          loveList.value = loveList.value.filter(item => item._id !== id)
          showSuccess('删除成功', '事件已成功删除！')
        } else {
          showError('删除失败', '删除事件时出现错误，请重试')
        }
      } catch (error) {
        // 如果是用户取消操作，不需要处理
        if (error.message === 'User cancelled') {
          console.log('用户取消了删除操作')
          return
        }
        showError('删除失败', '删除事件时出现错误，请重试')
      }
    }

    onMounted(() => {
      // 获取恋爱清单列表
      fetchLoveList()
      
      // 初始化DataTable
      setTimeout(() => {
        // DataTable初始化逻辑（如需要）
      }, 500)
    })

    return {
      loveList,
      loading,
      deleteItem,
      currentPage,
      pageSize,
      pageSizeOptions,
      paginatedList,
      totalPages,
      displayedPages,
      searchQuery,
      filteredList,
      modalState,
      closeModal,
      confirmModal,
      cancelModal
    }
  }
}
</script>

<style scoped>
.admin-love-list-page {
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

.table-container {
  background: white;
  border-radius: 10px;
  padding: 5px;
  max-width: 100%;
  margin: 0 auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
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
  text-align: center;
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

.event-title {
  font-weight: 500;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 auto;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  white-space: nowrap;
}

.badge-success-lighten {
  color: #0acf97;
  background-color: rgba(10, 207, 151, 0.18);
}

.badge-danger-lighten {
  color: #fa5c7c;
  background-color: rgba(250, 92, 124, 0.18);
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.no-image {
  color: #6c757d;
  font-style: italic;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-add {
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(10, 207, 151, 0.2);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 207, 151, 0.3);
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
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
  white-space: nowrap;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
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

.table-responsive {
  border-radius: 10px;
  overflow: hidden;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-love-list-page {
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
    gap: 10px;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: center;
  }
  
  .pagination-info {
    margin-top: 10px;
  }
}
</style>