import { createRouter, createWebHistory } from 'vue-router'
import AdminApp from '../admin/AdminApp.vue'
import AdminPage from '../pages/AdminPage.vue'

const routes = [
  {
    path: '/admin',
    component: AdminApp,
    children: [
      {
        path: '',
        name: 'Admin',
        component: AdminPage,
        meta: {
          requiresAuth: true,
          title: '管理后台'
        }
      },
      {
        path: 'login',
        name: 'AdminLogin',
        component: () => import('../pages/AdminLogin.vue'),
        meta: {
          title: '管理员登录'
        }
      },
      {
        path: 'set',
        name: 'AdminSet',
        component: () => import('../pages/AdminSet.vue'),
        meta: {
          requiresAuth: true,
          title: '基本设置'
        }
      },
      {
        path: 'leaving',
        name: 'AdminLeaving',
        component: () => import('../pages/AdminLeavingPage.vue'),
        meta: {
          requiresAuth: true,
          title: '留言管理'
        }
      },
      {
        path: 'leaving-settings',
        name: 'AdminLeavingSettings',
        component: () => import('../pages/AdminLeavingSettingsPage.vue'),
        meta: {
          requiresAuth: true,
          title: '留言设置'
        }
      },
      {
        path: 'little',
        name: 'AdminLittle',
        component: () => import('../pages/AdminLittleSetPage.vue'),
        meta: {
          requiresAuth: true,
          title: '点点滴滴'
        }
      },
      {
        path: 'little-add',
        name: 'AdminLittleAdd',
        component: () => import('../pages/AdminLittleAddPage.vue'),
        meta: {
          requiresAuth: true,
          title: '新增文章'
        }
      },
      {
        path: 'little-edit/:id',
        name: 'AdminLittleEdit',
        component: () => import('../pages/AdminLittleAddPage.vue'),
        meta: {
          requiresAuth: true,
          title: '编辑文章'
        }
      },
      {
        path: 'love-img',
        name: 'AdminLoveImg',
        component: () => import('../pages/AdminLoveImgSetPage.vue'),
        meta: {
          requiresAuth: true,
          title: '恋爱相册'
        }
      },
      {
        path: 'love-img-add',
        name: 'AdminLoveImgAdd',
        component: () => import('../pages/AdminLoveImgAddPage.vue'),
        meta: {
          requiresAuth: true,
          title: '新增图片'
        }
      },
      {
        path: 'love-img-edit/:id',
        name: 'AdminLoveImgEdit',
        component: () => import('../pages/AdminLoveImgAddPage.vue'),
        meta: {
          requiresAuth: true,
          title: '编辑图片'
        }
      },
      {
        path: 'love-list',
        name: 'AdminLoveList',
        component: () => import('../pages/AdminLoveListPage.vue'),
        meta: {
          requiresAuth: true,
          title: '恋爱清单'
        }
      },
      {
        path: 'love-list-add',
        name: 'AdminLoveListAdd',
        component: () => import('../pages/AdminLoveListAddPage.vue'),
        meta: {
          requiresAuth: true,
          title: '新增事件'
        }
      },
      {
        path: 'love-list-edit/:id',
        name: 'AdminLoveListEdit',
        component: () => import('../pages/AdminLoveListEditPage.vue'),
        meta: {
          requiresAuth: true,
          title: '编辑事件'
        }
      },
      {
        path: 'about',
        name: 'AdminAbout',
        component: () => import('../pages/AdminAboutSetPage.vue'),
        meta: {
          requiresAuth: true,
          title: '关于页面设置'
        }
      },
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import('../pages/AdminUserPage.vue'),
        meta: {
          requiresAuth: true,
          title: '用户配置'
        }
      },
      {
        path: 'ip-list',
        name: 'AdminIpList',
        component: () => import('../pages/AdminIpListPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'IP/拉黑'
        }
      },
      {
        path: 'ip-set',
        name: 'AdminIpSet',
        component: () => import('../pages/AdminIpSetPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'IP封禁添加'
        }
      },
      {
        path: 'illegal',
        name: 'AdminIllegal',
        component: () => import('../pages/AdminIllegalAccessPage.vue'),
        meta: {
          requiresAuth: true,
          title: '非法访问'
        }
      },
      {
        path: 'like-girl',
        name: 'AdminLikeGirl',
        component: AdminPage,
        meta: {
          requiresAuth: true,
          title: '关于Like Girl'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Like Girl 管理后台`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      next('/admin/login')
      return
    }
  }

  next()
})

export default router