import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/little',
    name: 'Little',
    component: () => import('../pages/LittlePage.vue')
  },
  {
    path: '/page/:id',
    name: 'ArticlePage',
    component: () => import('../pages/ArticlePage.vue')
  },
  {
    path: '/leaving',
    name: 'Leaving',
    component: () => import('../pages/LeavingPage.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/AboutPage.vue')
  },
  {
    path: '/loveImg',
    name: 'LoveImg',
    component: () => import('../pages/LoveImgPage.vue')
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('../pages/ListPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
