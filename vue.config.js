module.exports = {
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      // .entry('app') 获取默认入口，.clear()清除默认入口，.add()添加新入口
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')

      // externals 结点的作用是将某些包排除在打包文件之外，在真正使用时从window全局获取。前面是包的名字，后面是从 window 中查找该对象时的别名
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor',
        vuex: 'Vuex'
      })

      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')

      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
