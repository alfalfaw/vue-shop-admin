import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '@/components/Login'
// import Home from '@/components/Home'
// import Dashboard from '@/components/Dashboard'
// import Users from '@/components/user/Users'
// import Rights from '@/components/power/Rights'
// import Roles from '@/components/power/Roles'
// import Cate from '@/components/goods/Cate'
// import Params from '@/components/goods/Params'
// import GoodsList from '@/components/goods/List'
// import Add from '@/components/goods/Add'
// import Edit from '@/components/goods/Edit'
// import Order from '@/components/order/Order'
// import Report from '@/components/report/Report'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: 'Login-Home-Dashboard' */ '@/components/Login')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import(/* webpackChunkName: 'Login-Home-Dashboard' */ '@/components/Home'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import(/* webpackChunkName: 'Login-Home-Dashboard' */ '@/components/Dashboard')
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import(/* webpackChunkName: 'Users-Rights-Roles' */ '@/components/user/Users')
      },
      {
        path: '/rights',
        name: 'Rights',
        component: () => import(/* webpackChunkName: 'Users-Rights-Roles' */ '@/components/power/Rights')
      },
      {
        path: '/roles',
        name: 'Roles',
        component: () => import(/* webpackChunkName: 'Users-Rights-Roles' */ '@/components/power/Roles')
      },

      {
        path: '/categories',
        name: 'Categories',
        component: () => import(/* webpackChunkName: 'Categories-Params-Goods-Add-Edit' */ '@/components/goods/Cate')
      },
      {
        path: '/params',
        name: 'Params',
        component: () => import(/* webpackChunkName: 'Categories-Params-Goods-Add-Edit' */ '@/components/goods/Params')
      },
      {
        path: '/goods',
        name: 'Goods',
        component: () => import(/* webpackChunkName: 'Categories-Params-Goods-Add-Edit' */ '@/components/goods/List')
      },
      {
        path: '/goods/add',
        name: 'Add',
        component: () => import(/* webpackChunkName: 'Categories-Params-Goods-Add-Edit' */ '@/components/goods/Add')
      },
      {
        path: '/goods/edit/:id',
        name: 'Edit',
        props: true,
        component: () => import(/* webpackChunkName: 'Categories-Params-Goods-Add-Edit' */ '@/components/goods/Edit')
      },
      {
        path: '/orders',
        name: 'Order',
        component: () => import(/* webpackChunkName: 'Order-Report' */ '@/components/order/Order')
      },
      {
        path: '/reports',
        name: 'Report',
        component: () => import(/* webpackChunkName: 'Order-Report' */ '@/components/report/Report')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

/**
 *  to 将要访问的路径
 *  from 从哪个路径跳转而来
 *  next 是一个函数，表示放行
 */
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
