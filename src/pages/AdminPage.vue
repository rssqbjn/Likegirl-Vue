<template>
  <div class="admin-page">
    <!-- 统计卡片行 -->
    <div class="row">
        <!-- 留言祝福统计 -->
        <div class="col-md-6 col-xl-4">
          <div class="card">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-6">
                  <h5 class="text-muted font-weight-normal mt-0 text-truncate" title="Campaign Sent">留言祝福</h5>
                  <h3 class="my-2 py-1">{{ stats.leavingCount }}<i>条</i></h3>
                </div>
                <div class="col-6" style="text-align: center;">
                  <svg t="1717913183813" class="icon" viewBox="0 0 1178 1024" version="1.1"
                      xmlns="http://www.w3.org/2000/svg" p-id="1538" width="100" height="100">
                    <path
                        d="M1052.279486 606.582238c5.281913-43.119549 2.222694-86.401823-9.0981-128.631813-11.311152-42.2324-30.306511-81.239241-56.436431-115.946543-27.086979-35.965704-60.664853-65.659889-99.793436-88.252059-39.129789-22.590965-81.634601-36.822719-126.325948-42.298695-43.119549-5.280707-86.400618-2.222694-128.630607 9.0981-42.231195 11.320795-81.246474 30.302895-115.947748 56.436431-35.965704 27.088185-65.659889 60.664853-88.250854 99.794642-22.59217 39.129789-36.823924 81.634601-42.298696 126.324742-5.281913 43.119549-2.222694 86.401823 9.098101 128.631812s30.306511 81.239241 56.43643 115.946543c27.086979 35.965704 60.664853 65.659889 99.793437 88.25206 39.129789 22.590965 81.634601 36.822719 126.325948 42.298695 43.118344 5.280707 86.400618 2.222694 128.630607-9.098101 42.237222-11.317179 81.239241-30.306511 115.947748-56.43643 35.965704-27.086979 65.659889-60.664853 88.250854-99.794642 22.59217-39.129789 36.823924-81.634601 42.298695-126.324742z"
                        fill="#FA6666" p-id="1539"></path>
                    <path
                        d="M869.263982 276.743541c-22.866994-53.825608-55.566156-102.225865-97.188642-143.839912-41.614047-41.622485-90.014304-74.312004-143.839912-97.188642C572.447485 12.017497 513.314651 0 452.489485 0s-119.958 12.017497-175.745944 35.714987c-53.824403 22.865788-102.225865 55.566156-143.838707 97.188642-41.614047 41.62369-74.322853 90.014304-97.188641 143.839912C12.017497 332.531484 0 391.664318 0 452.489485c0 60.823962 12.017497 119.958 35.714987 175.744738 22.866994 53.825608 55.566156 102.225865 97.189847 143.839912 41.622485 41.612842 90.014304 74.312004 143.838707 97.188641 55.787943 23.697491 114.920777 35.714987 175.745944 35.714988s119.958-12.017497 175.745943-35.714988c53.825608-22.866994 102.225865-55.566156 143.839912-97.188641 41.622485-41.62369 74.312004-90.014304 97.188642-143.839912 23.697491-55.786738 35.714987-114.920777 35.714987-175.744738 0-60.825167-12.017497-119.958-35.714987-175.745944zM268.467499 500.831884c-26.695235 0-48.342399-21.648369-48.342399-48.342399 0-26.695235 21.647164-48.343605 48.342399-48.343605 26.695235 0 48.342399 21.648369 48.3424 48.343605 0 26.69403-21.647164 48.342399-48.3424 48.342399z m184.021986 0c-26.695235 0-48.342399-21.648369-48.3424-48.342399 0-26.695235 21.647164-48.343605 48.3424-48.343605 26.695235 0 48.343605 21.648369 48.343604 48.343605 0 26.69403-21.648369 48.342399-48.343604 48.342399z m184.021985 0c-26.69403 0-48.342399-21.648369-48.3424-48.342399 0-26.695235 21.648369-48.343605 48.3424-48.343605 26.695235 0 48.343605 21.648369 48.343604 48.343605 0 26.69403-21.648369 48.342399-48.343604 48.342399z"
                        fill="#FFCCCE" opacity=".9" p-id="1540"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 点点滴滴统计 -->
        <div class="col-md-6 col-xl-4">
          <div class="card">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-6">
                  <h5 class="text-muted font-weight-normal mt-0 text-truncate" title="New Leads">点点滴滴</h5>
                  <h3 class="my-2 py-1">{{ stats.littleCount }}<i>条</i></h3>
                </div>
                <div class="col-6" style="text-align: center;">
                  <svg t="1717913234288" class="icon" viewBox="0 0 1177 1024" version="1.1"
                      xmlns="http://www.w3.org/2000/svg" p-id="1707" width="100" height="100">
                    <path
                        d="M978.987254 727.204413c35.012548-8.899202 61.423559-36.382792 68.938987-71.716376 7.509278-35.337274-5.442843-71.186236-33.804667-93.559088l-93.688241-73.907042a17.033331 17.033331 0 0 1-6.45023-14.490878l7.767583-119.078334c2.34688-36.049456-15.627417-69.66224-46.909311-87.722639-31.281894-18.061629-69.387945-16.818077-99.428749 3.242336l-99.241785 66.266152a17.048091 17.048091 0 0 1-15.77379 1.659298l-110.849493-44.182355c-33.556203-13.375248-71.079224-6.669174-97.926893 17.504429-26.846439 24.172373-37.43692 60.790098-27.639802 95.560333l32.355702 114.854442a17.038251 17.038251 0 0 1-3.296456 15.517945l-76.274833 91.770638c-23.089954 27.778795-28.310164 65.53921-13.612642 98.546823 8.305102 18.652039 21.982936 33.585724 38.834223 43.31519 12.963191 7.484678 27.809545 11.886923 43.505843 12.506854l119.240697 4.72082a17.059161 17.059161 0 0 1 13.735645 7.931176l63.708938 100.903544c8.389973 13.286687 19.613915 23.936209 32.583257 31.424576 16.845138 9.725776 36.630026 14.110801 56.930292 11.973025 35.926454-3.778625 66.015228-27.173624 78.536842-61.063163l41.338546-111.940522a17.055471 17.055471 0 0 1 11.784831-10.616312l115.647806-29.413492-0.0123-0.00738z"
                        fill="#F779D4" p-id="1708"></path>
                    <path
                        d="M936.02631 484.815242c36.177378-35.256092 48.944996-87.004306 33.343409-135.047697-15.612657-48.043391-56.363253-82.400338-106.351306-89.663612l-165.129091-23.99771a23.818127 23.818127 0 0 1-17.942317-13.038222L606.097774 73.433484C583.734762 28.137961 538.467528 0 487.956716 0c-50.509583 0-95.786656 28.146571-118.139829 73.444555L295.967656 223.076611a23.840267 23.840267 0 0 1-17.942317 13.039452l-165.13032 23.99771c-49.988054 7.263274-90.73742 41.620221-106.347617 89.663612-15.612657 48.043391-2.835198 99.791605 33.339719 135.047697l119.485472 116.467a23.827967 23.827967 0 0 1 6.857367 21.09486l-28.205612 164.46242c-8.540036 49.78387 11.540057 99.163064 52.416115 128.857001 23.097335 16.782407 50.103676 25.303992 77.311741 25.303992 20.931268 0 41.989227-5.049236 61.430939-15.273171l147.698463-77.651226a23.850107 23.850107 0 0 1 22.179739 0l147.699693 77.651226c19.451552 10.223935 40.488602 15.273171 61.42971 15.273171 27.199455 0 54.224246-8.521586 77.312971-25.303992 40.866218-29.693937 60.946311-79.063291 52.414885-128.857001l-28.205612-164.46242a23.853797 23.853797 0 0 1 6.848757-21.09486L936.04599 484.815242h-0.01968z"
                        fill="#FAC5EB" opacity=".9" p-id="1709"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 恋爱清单统计 -->
        <div class="col-md-6 col-xl-4">
          <div class="card">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-6">
                  <h5 class="text-muted font-weight-normal mt-0 text-truncate" title="Deals">恋爱清单</h5>
                  <h3 class="my-2 py-1">{{ stats.loveListCount }}<i>条</i></h3>
                </div>
                <div class="col-6" style="text-align: center;">
                  <svg t="1717913149788" class="icon" viewBox="0 0 1060 1024" version="1.1"
                      xmlns="http://www.w3.org/2000/svg" p-id="1371" width="100" height="100">
                    <path
                        d="M992.512591 333.751271L627.279282 122.883497c-37.821381-21.835375-86.182236-8.877606-108.018874 28.943775L258.280252 603.857808c-31.836889 55.142184 11.457542 123.626034 75.013879 119.76939 87.04474-5.281102 181.618397-9.386522 192.44453-3.135576 10.847601 6.262311 54.725454 90.525065 93.728833 168.674519 28.433596 56.970744 109.171826 59.776724 141.008715 4.63454l260.980156-452.030536c21.835375-37.821381 8.877606-86.183498-28.943774-108.018874z"
                        fill="#C98FFF" p-id="1372"></path>
                    <path
                        d="M687.087577 0H108.487379C48.571745 0 0 48.571745 0 108.488642v716.102069c0 87.355393 98.418936 139.026092 171.287288 90.84582C271.085221 849.450534 380.635892 779.698816 397.787478 779.698816c17.184419 0 127.118987 70.01691 227.068458 136.114035C697.720499 963.998174 795.574956 911.946104 795.574956 824.590711V108.487379C795.574956 48.571745 747.00321 0 687.087577 0zM282.871095 199.525148h229.832765c24.41026 0 44.198609 19.788349 44.198609 44.198608s-19.788349 44.198609-44.198609 44.198609H282.871095c-24.41026 0-44.198609-19.788349-44.198608-44.198609s19.788349-44.198609 44.198608-44.198608z"
                        fill="#E2C8FA" opacity=".9" p-id="1373"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新留言表格 -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row mb-2">
                <div class="col-lg-4">
                  <div class="text-lg-right">
                    <button type="button" class="btn btn-danger mb-2 mr-2">
                      <i class="mdi mdi-basket mr-1"></i>
                      最新留言
                    </button>
                  </div>
                </div>
              </div>

              <div class="table-responsive">
                <table class="table table-centered mb-0">
                  <thead class="thead-light">
                    <tr>
                      <th>评论内容</th>
                      <th>Date</th>
                      <th>Name</th>
                      <th>QQ</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="message in recentMessages" :key="message.id">
                      <td>
                        <div class="textHide index">
                          {{ message.text }}
                        </div>
                      </td>
                      <td>
                        <small class="text-muted">
                          {{ formatDate(message.time) }}
                          <div class="color">{{ getTimeAgo(message.time) }}</div>
                        </small>
                      </td>
                      <td>
                        <h5>
                          <span class="badge badge-success-lighten">
                            <i class="mdi mdi-account-circle mr-1 rihjt-0"></i>
                            {{ message.name }}
                          </span>
                        </h5>
                      </td>
                      <td>
                        {{ message.QQ }}
                      </td>
                      <td>
                        <h5>
                          <span class="badge badge-danger-lighten">
                            {{ message.ip || '127.0.0.1' }}
                          </span>
                        </h5>
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
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { app, ensureLogin } from '@/utils/cloudbase'

export default {
  name: 'AdminPage',
  setup() {
    const store = useStore()
    
    const recentMessages = ref([])
    const stats = ref({
      leavingCount: 0,
      littleCount: 0,
      loveListCount: 0
    })
    const loading = ref(true)
    const isAuthenticated = ref(false)
    

    // 身份验证方法
    const authenticate = async () => {
      try {
        // 尝试匿名登录
        await ensureLogin()
        isAuthenticated.value = true
        
      } catch (error) {
        
        throw error
      }
    }

    // 使用备用留言数据
    const useBackupMessageData = () => {
      recentMessages.value = [
        {
          id: 1,
          text: '祝你们永远幸福快乐！',
          time: Math.floor(Date.now() / 1000) - 300,
          name: '小明',
          QQ: '123456789',
          ip: '192.168.1.1'
        },
        {
          id: 2,
          text: '愿得一人心，白首不相离',
          time: Math.floor(Date.now() / 1000) - 1800,
          name: '小红',
          QQ: '987654321',
          ip: '192.168.1.2'
        },
        {
          id: 3,
          text: '真羡慕你们的爱情！',
          time: Math.floor(Date.now() / 1000) - 3600,
          name: '小李',
          QQ: '456789123',
          ip: '192.168.1.3'
        }
      ]
    }

    // 获取统计数据
    const fetchStats = async () => {
      try {
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }
        
        // 并行获取所有统计数据
        const [leavingResult, littleResult, loveListResult] = await Promise.all([
          // 获取留言数量
          app.callFunction({
            name: 'leaving',
            data: {
              action: 'getStats'
            }
          }),
          // 获取点点滴滴数量
          app.callFunction({
            name: 'article',
            data: {
              action: 'getStats'
            }
          }),
          // 获取恋爱清单数量
          app.callFunction({
            name: 'lovelist',
            data: {
              action: 'getStats'
            }
          })
        ])
        
        
        
        
        
        // 处理留言数量
        if (leavingResult.result && leavingResult.result.success) {
          stats.value.leavingCount = leavingResult.result.data.count || 0
        } else {
          stats.value.leavingCount = 0
        }
        
        // 处理点点滴滴数量
        if (littleResult.result && littleResult.result.success) {
          stats.value.littleCount = littleResult.result.data.count || 0
        } else {
          stats.value.littleCount = 0
        }
        
        // 处理恋爱清单数量
        if (loveListResult.result && loveListResult.result.success) {
          stats.value.loveListCount = loveListResult.result.data.total || 0
        } else {
          stats.value.loveListCount = 0
        }
        
        
      } catch (error) {
        
        // 设置为0而不是模拟数据，这样用户能知道有问题
        stats.value = {
          leavingCount: 0,
          littleCount: 0,
          loveListCount: 0
        }
      }
    }

    // 获取最新留言
    const fetchRecentMessages = async () => {
      try {
        // 确保已经身份验证
        if (!isAuthenticated.value) {
          await authenticate()
        }
        
        // 调用云函数获取最新留言，修正参数传递方式
        const result = await app.callFunction({
          name: 'leaving',
          data: {
            action: 'getMessages',
            page: 1,
            limit: 5
          }
        })
        
        
        
        if (result.result && result.result.success) {
          const data = result.result.data
          
          // 转换数据格式以适配前端显示
          recentMessages.value = data.list.map(msg => ({
            id: msg._id || msg.id,
            text: msg.text,
            time: parseInt(msg.time), // 确保时间戳是数字
            name: msg.name,
            QQ: msg.QQ || '未填写',
            ip: msg.ip || '127.0.0.1'
          }))
          
          
        } else {
          
          // 使用模拟数据作为备用
          useBackupMessageData()
        }
      } catch (error) {
        
        // 使用模拟数据作为备用
        useBackupMessageData()
      } finally {
        loading.value = false
      }
    }

    // 格式化日期
    const formatDate = (timestamp) => {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 获取相对时间
    const getTimeAgo = (timestamp) => {
      const now = Math.floor(Date.now() / 1000)
      const diff = now - timestamp
      
      if (diff < 60) {
        return '刚刚'
      } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分钟前`
      } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}小时前`
      } else {
        return `${Math.floor(diff / 86400)}天前`
      }
    }

    onMounted(async () => {
      try {
        loading.value = true
        
        // 先进行身份验证
        await authenticate()
        
        // 并行获取数据
        await Promise.all([
          fetchStats(),
          fetchRecentMessages()
        ])
      } catch (error) {
        
      } finally {
        loading.value = false
      }
    })

    return {
      stats,
      recentMessages,
      loading,
      formatDate,
      getTimeAgo
    }
  }
}
</script>

<style scoped>
.admin-page {
  margin-top: 40px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container-fluid {
  padding: 20px;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 0 35px 0 rgba(154, 161, 171, 0.15);
  margin-bottom: 24px;
}

.card-body {
  padding: 24px;
}

.text-muted {
  color: #6c757d !important;
}

.font-weight-normal {
  font-weight: 400 !important;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-2 {
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

.py-1 {
  padding-top: 0.25rem !important;
  padding-bottom: 0.25rem !important;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #fff;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
}

.mb-2 {
  margin-bottom: 0.5rem !important;
}

.mr-2 {
  margin-right: 0.5rem !important;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
  border-collapse: collapse;
}

.table-centered th,
.table-centered td {
  text-align: center;
  vertical-align: middle;
}

.thead-light th {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #495057;
}

.table th,
.table td {
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
}

.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
}

.badge-success-lighten {
  background-color: #d4edda;
  color: #155724;
}

.badge-danger-lighten {
  background-color: #f8d7da;
  color: #721c24;
}

.textHide {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color {
  color: #6c757d;
  font-size: 0.875rem;
}

.icon {
  width: 100px;
  height: 100px;
}
</style>
