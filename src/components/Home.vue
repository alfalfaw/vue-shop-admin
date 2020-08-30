<template>
  <el-container class="home">
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <el-menu
        :default-active="$route.path"
        background-color="rgb(48, 65, 86)"
        text-color="rgb(191, 203, 217)"
        active-text-color="rgb(64, 158, 255)"
        unique-opened
        :collapse="isCollapse"
        :collapse-transition="false"
        router
      >
        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
          <template slot="title">
            <i class="iconfont" :class="icons[item.id]"></i>
            <span class="ml-1">{{ item.authName }}</span>
          </template>
          <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
            <template slot="title">
              <i class="iconfont icon-appstore-fill"></i>
              <span class="ml-1">{{ subItem.authName }}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="d-flex ai-center jc-between text-primary">
        <div class="d-flex ai-center">
          <span class="iconfont icon-outdent toggle fs-xl" @click="toggleCollapse"></span>
          <el-breadcrumb separator="/" class="ml-4">
            <el-breadcrumb-item v-show="$route.path !== '/dashboard'" :to="{ path: '/dashboard' }"
              ><span class="fw-4">首页</span></el-breadcrumb-item
            >
            <el-breadcrumb-item v-for="(breadcrumb, index) in breadcrumbs" :key="index">
              <span>{{ breadcrumb }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <span class="iconfont icon-poweroff" @click="logout"></span>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      menulist: [],
      icons: {
        125: 'icon-user',
        103: 'icon-control',
        101: 'icon-shopping',
        102: 'icon-accountbook',
        145: 'icon-linechart'
      },
      // 是否折叠
      isCollapse: false
    }
  },
  computed: {
    breadcrumbs() {
      const path = this.$route.path.substring(1)

      for (let i = 0; i < this.menulist.length; i++) {
        const j = this.menulist[i].children.findIndex(item => item.path === path)
        if (j > -1) return [this.menulist[i].authName, this.menulist[i].children[j].authName]
      }
      return []
    }
  },

  methods: {
    // 退出登录
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: res.meta.msg
        })
      }

      this.menulist = res.data
      // console.log(this.menulist)
    },
    // 折叠、展开菜单
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  },
  created() {
    this.getMenuList()
  }
}
</script>

<style lang="scss" scoped>
.el-menu--vertical > ul > li:hover {
  background-color: #263445 !important;
}
.home {
  min-height: 100vh;
  .el-header {
    background: linear-gradient(to left, rgba(1, 170, 237, 1), rgba(82, 183, 109, 1));

    .toggle {
      cursor: pointer;
    }

    /deep/ .el-breadcrumb {
      .el-breadcrumb__separator {
        margin: 0 3px;
      }
    }
  }

  /deep/ .el-aside {
    background: rgb(48, 65, 86);
    color: rgb(191, 203, 217);

    .el-menu {
      border-right: none;

      &.el-menu--collapse {
        .el-submenu__title {
          text-align: center;
        }
      }
      .el-submenu__title {
        &:hover {
          background: #263445 !important;
        }
      }

      .el-menu-item.is-active {
        background: transparent !important;
      }
    }
  }
  .el-main {
    background: #eaedf1;
  }
}
</style>
