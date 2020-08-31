<template>
  <div class="cate">
    <el-card>
      <!-- 按钮 -->
      <div class="text-right">
        <el-button type="primary" size="medium" @click="showAddCateDialog">添加分类</el-button>
      </div>
      <!-- 表格 -->
      <!-- selection-type 是否为多选类型表格  expand-type 是否为展开行类型表格 show-index 是否显示索引 index-text 数据索引名字 -->
      <tree-table
        :selection-type="false"
        :expand-type="false"
        class="mt-4 fs-md"
        :data="catelist"
        :columns="columns"
        index-text="#"
        :show-index="true"
        border
      >
        <!-- 定义模板列 -->
        <template slot="isok" slot-scope="{ row }">
          <i style="color: red;" class="el-icon-error" v-if="row.cat_deleted"></i>
          <i style="color: lightgreen;" class="el-icon-success" v-else></i>
        </template>
        <template slot="order" slot-scope="{ row }">
          <el-tag size="mini" v-if="row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt">
          <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
            <el-button size="mini" type="danger" icon="el-icon-delete"></el-button>
          </el-tooltip>
        </template>
      </tree-table>

      <!-- 分页 -->

      <div class="d-flex mt-4">
        <el-pagination
          class="ml-auto"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- props 配置级联框属性 clearable 是否可以清空  change-on-select 允许选中任何一项-->
          <el-cascader
            class="w-100"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" size="medium">取 消</el-button>
        <el-button @click="addCate" type="primary" size="medium">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import TreeTable from 'vue-table-with-tree-grid'
export default {
  name: 'Cate',
  components: {
    TreeTable
  },
  data() {
    return {
      catelist: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: parseInt(this.$route.query.pagenum) || 1, // 页码
        pagesize: parseInt(this.$route.query.pagesize) || 5 // 每页大小
      },
      // 总页数
      total: 0,
      // 为 tree-table 指定列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
          minWidth: '125px'
        }
      ],
      // 添加分类对话框的显示与隐藏
      addDialogVisible: false,
      // 添加分类表单
      addForm: {
        cat_name: '',
        // 父级 id，默认是 0
        cat_pid: 0,
        // 分类等级，默认是 0，即一级分类
        cat_level: 0
      },
      // 添加分类表单校验规则
      addFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover', // 触发方式
        label: 'cat_name', // 标签名
        value: 'cat_id', // 值
        children: 'children' // 如何定义层级关系
      },
      // 级联选中的项的 value 值，是一个数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取分类数据失败'
        })
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 变化
    handleSizeChange(newVal) {
      // console.log(newVal)
      this.queryInfo.pagesize = newVal
      this.getCateList()
      this.$router.push({ path: 'categories', query: this.queryInfo })
    },
    // 监听 pagenum 变化
    handleCurrentChange(newVal) {
      this.queryInfo.pagenum = newVal
      this.getCateList()
      this.$router.push({ path: 'categories', query: this.queryInfo })
    },
    // 添加分类对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },

    // 展示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取父级分类数据失败'
        })
      }
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 级联选择器选中项发生变化时触发
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        // 父级分类 id 总是选中列表id中的最后一个
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 分类等级
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 添加分类事件
    async addCate() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message({
            type: 'error',
            message: '添加分类失败'
          })
        }
        this.$message({
          type: 'success',
          message: '添加分类成功'
        })
        // 重新获取分类列表
        this.getCateList()
        // 隐藏添加分类对话框
        this.addDialogVisible = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .zk-table {
  color: #909399;
}
/deep/ .zk-table__header-row {
  border-bottom: 1px solid #ebeef5;
  background: transparent;
  .zk-table__cell-inner {
    padding-top: 1.2rem;
    padding-bottom: 1.2rem;
    font-size: 1.4rem;
    color: #909399;
  }
}
/deep/ .zk-table__body-row {
  font-size: 1.4rem;
  color: #606266;
  &.zk-table--row-hover:hover {
    background-color: rgb(242, 245, 249) !important;
  }
}
/deep/ .zk-table__body-row:not(:first-of-type) {
  border-top: 1px solid #ebeef5 !important;
}
.cate {
}
</style>
