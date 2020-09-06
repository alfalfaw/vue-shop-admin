import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/scss/style.scss'
import './plugins/element.js'
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 富文本
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import VueQuillEditor from 'vue-quill-editor'

// 导入表格树
import TreeTable from 'vue-table-with-tree-grid'

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(VueQuillEditor)

// 全局注册表格树
Vue.component('tree-table', TreeTable)

Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // 不足两位用零补齐
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
