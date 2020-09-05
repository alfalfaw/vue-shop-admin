<template>
  <div class="list">
    <el-card>
      <el-row>
        <el-col :span="12">
          <el-input v-model="queryInfo.query" clearable placeholder="请输入内容" size="medium" @clear="search" @keyup.enter.native="search">
            <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button @click="goAddPage" size="medium" type="primary">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table class="mt-5" :data="goodslist" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time">
          <template #default="{row}">{{ row.add_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="180" align="center">
          <template #default="{row}">
            <!-- enterable="false" 鼠标放到提示框时提示框仍会消失 -->
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button @click="goEditPage(row)" size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button @click="removeGoodById(row)" size="mini" type="danger" icon="el-icon-delete"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex mt-4">
        <el-pagination
          background
          class="ml-auto"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'List',
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: parseInt(this.$route.query.pagenum) || 1,
        pagesize: parseInt(this.$route.query.pagesize) || 10
      },
      // 商品列表
      goodslist: [],
      total: 0,
      lastQuery: this.$route.query.query || ''
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取商品列表失败'
        })
      }

      // console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 监听 pagesize 变化
    handleSizeChange(newVal) {
      // console.log(newVal)
      this.queryInfo.pagesize = newVal
      this.getGoodsList()
      this.$router.push({ path: 'goods', query: this.queryInfo })
    },
    // 监听 pagenum 变化
    handleCurrentChange(newVal) {
      this.queryInfo.pagenum = newVal
      this.getGoodsList()
      this.$router.push({ path: 'goods', query: this.queryInfo })
    },
    // 查询
    search() {
      if (this.lastQuery !== this.queryInfo.query) {
        this.queryInfo.pagenum = 1
        this.$router.push({ path: 'goods', query: this.queryInfo })
        this.getGoodsList()
        this.lastQuery = this.queryInfo.query
      }
    },
    // 根据 id 删除商品
    async removeGoodById(row) {
      const confirmResult = await this.$confirm(`此操作将永久删除商品 <strong>${row.goods_name}</strong> , 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).catch(err => err)
      // console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message({
          type: 'info',
          message: '取消删除'
        })
      }

      const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '删除商品失败'
        })
      }
      this.$message({
        type: 'success',
        message: '删除商品成功'
      })
      this.getGoodsList()
    },

    goAddPage() {
      this.$router.push('/goods/add')
    },
    goEditPage(row) {
      console.log(row)
      this.$router.push(`goods/edit/${row.goods_id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
}
</style>
