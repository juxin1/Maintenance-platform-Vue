import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  // 管理员路由
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '控制台', icon: 'Monitor' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'orders',
        name: 'OrderManagement',
        component: () => import('@/views/admin/OrderManagement.vue'),
        meta: { title: '订单管理', icon: 'List' }
      },
      {
        path: 'repairs',
        name: 'RepairManagement',
        component: () => import('@/views/admin/RepairManagement.vue'),
        meta: { title: '维修单管理', icon: 'Tools' }
      }
    ]
  },
  // 工程师路由
  {
    path: '/engineer',
    component: Layout,
    redirect: '/engineer/dashboard',
    meta: { requiresAuth: true, roles: ['engineer'] },
    children: [
      {
        path: 'dashboard',
        name: 'EngineerDashboard',
        component: () => import('@/views/engineer/Dashboard.vue'),
        meta: { title: '工作台', icon: 'Monitor' }
      },
      {
        path: 'repairs',
        name: 'EngineerRepairs',
        component: () => import('@/views/engineer/RepairList.vue'),
        meta: { title: '维修单列表', icon: 'List' }
      }
    ]
  },
  // 接待员路由
  {
    path: '/receptionist',
    component: Layout,
    redirect: '/receptionist/dashboard',
    meta: { requiresAuth: true, roles: ['receptionist'] },
    children: [
      {
        path: 'dashboard',
        name: 'ReceptionistDashboard',
        component: () => import('@/views/receptionist/Dashboard.vue'),
        meta: { title: '工作台', icon: 'Monitor' }
      },
      {
        path: 'orders',
        name: 'ReceptionistOrders',
        component: () => import('@/views/receptionist/OrderList.vue'),
        meta: { title: '订单管理', icon: 'List' }
      },
      {
        path: 'customers',
        name: 'CustomerManagement',
        component: () => import('@/views/receptionist/CustomerList.vue'),
        meta: { title: '客户管理', icon: 'User' }
      }
    ]
  },
  // 客户路由
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer/dashboard',
    meta: { requiresAuth: true, roles: ['customer'] },
    children: [
      {
        path: 'dashboard',
        name: 'CustomerDashboard',
        component: () => import('@/views/customer/Dashboard.vue'),
        meta: { title: '我的主页', icon: 'Monitor' }
      },
      {
        path: 'orders',
        name: 'CustomerOrders',
        component: () => import('@/views/customer/OrderList.vue'),
        meta: { title: '我的订单', icon: 'List' }
      },
      {
        path: 'profile',
        name: 'CustomerProfile',
        component: () => import('@/views/customer/Profile.vue'),
        meta: { title: '个人资料', icon: 'User' }
      }
    ]
  },
  // 404 路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const roleType = userInfo.roleType

  // 登录页和注册页不需要验证
  if (to.path === '/login' || to.path === '/register') {
    if (token) {
      // 已登录用户访问登录页，重定向到对应的首页
      const roleRouteMap = {
        admin: '/admin/dashboard',
        engineer: '/engineer/dashboard',
        receptionist: '/receptionist/dashboard',
        customer: '/customer/dashboard'
      }
      next(roleRouteMap[roleType] || '/login')
    } else {
      next()
    }
    return
  }

  if (!token) {
    // 未登录，重定向到登录页
    next('/login')
  } else if (to.meta.roles && !to.meta.roles.includes(roleType)) {
    // 无权限访问，重定向到对应的首页
    const roleRouteMap = {
      admin: '/admin/dashboard',
      engineer: '/engineer/dashboard',
      receptionist: '/receptionist/dashboard',
      customer: '/customer/dashboard'
    }
    next(roleRouteMap[roleType] || '/login')
  } else {
    next()
  }
})

export default router 