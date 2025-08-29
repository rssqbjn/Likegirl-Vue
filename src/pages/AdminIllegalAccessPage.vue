<template>
  <div class="admin-illegal-access-page">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="card modern-card">
            <div class="card-body">
              <div class="header-section">
                <h4 class="header-title">
                  <i class="mdi mdi-shield-alert text-warning mr-2"></i>
                  非法访问列表
                </h4>
              </div>
              
              <div class="table-container">
                <div class="table-responsive">
                  <table class="table table-modern">
                    <thead>
                      <tr>
                        <th class="text-center">序号</th>
                        <th class="text-center">访问时间</th>
                        <th class="text-center">非法文件路径</th>
                        <th class="text-center">IP地址</th>
                        <th class="text-center">IP归属地</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in illegalAccessList" :key="item.id" class="table-row">
                        <td class="text-center">
                          <div class="serial-number">
                            {{ index + 1 }}
                          </div>
                        </td>
                        <td class="text-center">
                          <span class="time-badge">{{ item.time }}</span>
                        </td>
                        <td class="text-center">
                          <span class="file-badge">{{ item.file }}</span>
                        </td>
                        <td class="text-center">
                          <span class="ip-badge">{{ item.ip || '127.0.0.1' }}</span>
                        </td>
                        <td class="text-center">{{ item.gsd }}</td>
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
  name: 'AdminIllegalAccessPage',
  components: {
    CustomModal
  },
  setup() {
    const illegalAccessList = ref([])
    const loading = ref(false)
    
    // 弹窗相关
    const { modalState, showSuccess, showError, showWarning, showConfirm, closeModal, confirmModal, cancelModal } = useModal()

    // 获取非法访问记录列表
    const fetchIllegalAccessList = async () => {
      try {
        loading.value = true
        
        // 匿名登录
        await ensureLogin()

        // 获取管理员token
        // 获取管理员token
        const token = localStorage.getItem('adminToken')
        if (!token) {
          showError('请先登录管理员账号才能查看非法访问记录','认证失败')
          illegalAccessList.value = []
          return
        }
        
        // 调用云函数获取非法访问记录列表
        const result = await app.callFunction({
          name: 'ipManage',
          data: {
            action: 'getIllegalAccess',
            token: token,
            data: {
              page: 1,
              limit: 100
            }
          }
        })
        
        if (result.result && result.result.success) {
          // 将数据库字段映射到页面显示字段
          illegalAccessList.value = (result.result.data.list || []).map(item => ({
            id: item._id,
            time: formatDate(item.accessTime),
            file: item.filePath || '未知文件',
            ip: item.ip,
            gsd: item.location || '未知'
          }))
        } else {
          const errorMsg = result.result?.message || '获取数据失败'
          if (errorMsg.includes('需要管理员权限')) {
            showError('请重新登录管理员账号','权限验证失败')
          } else {
            showError('获取非法访问记录失败：' + errorMsg,'获取失败')
          }
          illegalAccessList.value = []
        }
      } catch (error) {
        showError('请检查网络连接后重试','网络错误')
        illegalAccessList.value = []
      } finally {
        loading.value = false
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
                { orderable: true }
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
      fetchIllegalAccessList().then(() => {
        initDataTable()
      })
    })

    return {
      illegalAccessList,
      loading,
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
.admin-illegal-access-page {
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

.file-badge {
  padding: 6px 12px;
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  word-break: break-all;
}

.ip-badge {
  padding: 6px 12px;
  background: linear-gradient(45deg, #dc3545, #fd7e14);
  color: white;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.text-warning {
  color: #ffc107 !important;
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
  .admin-illegal-access-page {
    padding: 20px 10px;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .table-modern thead th,
  .table-modern tbody td {
    padding: 15px 10px;
    font-size: 14px;
  }
  
  .file-badge {
    font-size: 10px;
    padding: 4px 8px;
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
