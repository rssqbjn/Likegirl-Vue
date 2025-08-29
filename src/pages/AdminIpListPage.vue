<template>
  <div class="admin-ip-list-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <h4 class="header-title">
                  <i class="mdi mdi-shield-lock text-danger mr-2"></i>
                  IP封禁管理
                </h4>
                <router-link to="/admin/ip-set">
                  <button type="button" class="btn btn-modern">
                    <i class="mdi mdi-plus-circle mr-2"></i>
                    新增封禁
                  </button>
                </router-link>
              </div>
              
              <div class="table-container">
                <div class="table-responsive">
                  <table class="table table-modern">
                    <thead>
                      <tr>
                        <th class="text-center">序号</th>
                        <th class="text-center">IP归属地</th>
                        <th class="text-center">封禁时间</th>
                        <th class="text-center">备注</th>
                        <th class="text-center">IP地址</th>
                        <th class="text-center" style="width: 150px;">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in ipList" :key="item.id" class="table-row">
                        <td class="text-center">
                          <div class="serial-number">
                            {{ index + 1 }}
                          </div>
                        </td>
                        <td class="text-center">{{ item.ipAdd }}</td>
                        <td class="text-center">
                          <span class="time-badge">{{ item.Time }}</span>
                        </td>
                        <td class="text-center">
                          <span class="reason-badge">{{ item.text }}</span>
                        </td>
                        <td class="text-center">
                          <span class="ip-badge">{{ item.State || '127.0.0.1' }}</span>
                        </td>
                        <td class="text-center">
                          <div class="action-buttons">
                            <button type="button" class="btn btn-delete" @click="deleteIp(item.id, item.State)">
                              <i class="mdi mdi-delete mr-1"></i>删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
</template>

<script>
import { ref, onMounted } from 'vue'
import CustomModal from '../components/CustomModal.vue'
import { app, ensureLogin } from '@/utils/cloudbase'
import { useModal } from '@/utils/useModal'

export default {
  name: 'AdminIpListPage',
  components: {
    CustomModal
  },
  setup() {
    const ipList = ref([])
    const loading = ref(false)
    
    // 弹窗相关
    const { modalState, showSuccess, showError, showWarning, showConfirm, closeModal, confirmModal, cancelModal } = useModal()

    // 获取IP封禁列表
    const fetchIpList = async () => {
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
        
        // 调用云函数获取IP封禁列表
        const result = await app.callFunction({
          name: 'ipManage',
          data: {
            action: 'getIpList',
            token: token,
            data: {
              page: 1,
              limit: 100
            }
          }
        })
        
        if (result.result && result.result.success) {
          // 将数据库字段映射到页面显示字段
          ipList.value = (result.result.data.list || []).map(item => ({
            id: item._id,
            ipAdd: item.location || '未知',
            Time: formatDate(item.createTime),
            text: item.reason || '未知原因',
            State: item.ip
          }))
        } else {
          showError('获取IP封禁列表失败，请重新登录','获取失败')
        }
      } catch (error) {
        showError('获取IP封禁列表失败，请重新登录','获取失败')
      } finally {
        loading.value = false
      }
    }

    // 删除IP封禁
    // 删除IP封禁
    const deleteIp = async (id, ip) => {
      try {
        const confirmed = await showConfirm(`您确认要删除IP为 ${ip} 吗？此操作不可恢复。`,'确认删除')
        if (!confirmed) {
          return
        }

        // 匿名登录
        await ensureLogin()
        
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          showError('请先登录管理员账号','认证失败')
          return
        }
        
        // 调用云函数删除IP封禁
        const result = await app.callFunction({
          name: 'ipManage',
          data: {
            action: 'deleteIpBan',
            token: token,
            data: {
              id: id
            }
          }
        })
        
        if (result.result && result.result.success) {
          showSuccess('删除成功！','操作成功')
          // 从列表中移除
          ipList.value = ipList.value.filter(item => item.id !== id)
        } else {
          showError('删除失败，请重试','操作失败')
        }
      } catch (error) {
        // 如果是用户取消操作，不需要处理
        if (error.message === 'User cancelled') {
          console.log('用户取消了删除操作')
          return
        }
        showError('删除失败，请重试','操作失败')
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未知时间'
      try {
        const date = new Date(dateString)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    }

    // 初始化DataTable
    const initDataTable = () => {
      setTimeout(() => {
        try {
          if (window.$ && window.$.fn && window.$.fn.DataTable) {
            $('#basic-datatable').DataTable({
              language: {
                paginate: {
                  previous: "<i class='mdi mdi-chevron-left'>",
                  next: "<i class='mdi mdi-chevron-right'>"
                },
                info: "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                lengthMenu: "显示 _MENU_ 项结果"
              },
              pageLength: 10,
              columns: [
                { orderable: true },
                { orderable: true },
                { orderable: true },
                { orderable: true },
                { orderable: true },
                { orderable: false }
              ],
              drawCallback: function() {
                $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
              }
            })
          } else {
          }
        } catch (error) {
        }
      }, 500)
    }

    onMounted(() => {
      fetchIpList().then(() => {
        initDataTable()
      })
    })

    return {
      ipList,
      loading,
      deleteIp,
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
.admin-ip-list-page {
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

.btn-modern {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 1rem;
  border: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  background: linear-gradient(45deg, #764ba2, #667eea);
  color: white;
  text-decoration: none;
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

.time-badge {
  padding: 6px 12px;
  background: linear-gradient(45deg, #17a2b8, #20c997);
  color: white;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.reason-badge {
  padding: 6px 12px;
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.ip-badge {
  padding: 6px 12px;
  background: linear-gradient(45deg, #dc3545, #fd7e14);
  color: white;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
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

.text-center {
  text-align: center;
}

.text-danger {
  color: #dc3545 !important;
}

.mr-1 {
  margin-right: 0.25rem !important;
}

.mr-2 {
  margin-right: 0.5rem !important;
}

.table-responsive {
  border-radius: 15px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-ip-list-page {
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
  
  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }
  
  .table-modern thead th,
  .table-modern tbody td {
    padding: 15px 10px;
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
</style>
