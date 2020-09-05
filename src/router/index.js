import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Dashboard from '@/components/Dashboard'
import Users from '@/components/user/Users'
import Rights from '@/components/power/Rights'
import Roles from '@/components/power/Roles'
import Cate from '@/components/goods/Cate'
import Params from '@/components/goods/Params'
import GoodsList from '@/components/goods/List'
import Add from '@/components/goods/Add'
import Edit from '@/components/goods/Edit'
import Order from '@/components/order/Order'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: '/users',
        name: 'Users',
        component: Users
      },
      {
        path: '/rights',
        name: 'Rights',
        component: Rights
      },
      {
        path: '/roles',
        name: 'Roles',
        component: Roles
      },
      {
        path: '/categories',
        name: 'Categories',
        component: Cate
      },
      {
        path: '/params',
        name: 'Params',
        component: Params
      },
      {
        path: '/goods',
        name: 'Goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        name: 'Add',
        component: Add
      },
      {
        path: '/goods/edit/:id',
        name: 'Edit',
        props: true,
        component: Edit
      },
      {
        path: '/orders',
        name: 'Order',
        component: Order
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
