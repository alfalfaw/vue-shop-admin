<template>
  <div class="params">
    <el-card>
      <el-alert show-icon :closable="false" title="注意：只允许为第三级分类设置相关参数！" type="warning"> </el-alert>

      <div class="mt-4">
        <!-- 选择商品分类区域 -->
        <el-form label-width="100px" label-position="left">
          <el-form-item label="选择商品分类">
            <el-cascader size="medium" v-model="selectedKeys" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
          </el-form-item>
        </el-form>
        <!-- tab 页签区域 -->

        <el-tabs class="mt-3" v-model="activeName" @tab-click="handleTabClick">
          <!-- 添加动态参数面板 -->
          <el-tab-pane label="动态参数" name="many">
            <div class="text-right">
              <el-button @click="addDialogVisible = true" type="primary" size="mini" :disabled="isBtnDisabled">
                添加参数
              </el-button>
              <el-table class="mt-3" :data="manyTableData" border>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="{ row }">
                    <el-tag @close="handleTagClosed(i, row)" class="mr-3 mb-3" closable v-for="(item, i) in row.attr_vals" :key="i">
                      {{ item }}</el-tag
                    >

                    <el-input
                      v-if="row.inputVisible"
                      v-model="row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(row)"
                      @blur="handleInputConfirm(row)"
                      class="input-new-tag"
                    >
                    </el-input>
                    <el-button v-else size="small" @click="showInputVisible(row)">+ 添加标签</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作" min-width="180" align="center">
                  <template #default="{row}">
                    <!-- enterable="false" 鼠标放到提示框时提示框仍会消失 -->
                    <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
                      <el-button @click="showEditDialog(row.attr_id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                      <el-button @click="removeParams(row)" size="mini" type="danger" icon="el-icon-delete"></el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <!-- 添加静态属性面板 -->
          <el-tab-pane label="静态属性" name="only">
            <div class="text-right">
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">
                添加属性
              </el-button>
              <el-table class="mt-3" :data="onlyTableData" border>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="{ row }">
                    <el-tag @close="handleTagClosed(i, row)" class="mr-3 mb-3" closable v-for="(item, i) in row.attr_vals" :key="i">
                      {{ item }}</el-tag
                    >

                    <el-input
                      v-if="row.inputVisible"
                      v-model="row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(row)"
                      @blur="handleInputConfirm(row)"
                      class="input-new-tag"
                    >
                    </el-input>
                    <el-button v-else size="small" @click="showInputVisible(row)">+ 添加标签</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作" min-width="180" align="center">
                  <template #default="{row}">
                    <!-- enterable="false" 鼠标放到提示框时提示框仍会消失 -->
                    <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
                      <el-button @click="showEditDialog(row.attr_id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                      <el-button @click="removeParams(row)" size="mini" type="danger" icon="el-icon-delete"></el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px" label-position="left">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" size="medium">取 消</el-button>
        <el-button @click="addParams" type="primary" size="medium">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数/属性对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px" label-position="left">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" size="medium">取 消</el-button>
        <el-button @click="editParams" type="primary" size="medium">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: { expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' },
      // 级联选择框双向绑定的数组
      selectedKeys: [],
      // 选中标签页
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数/属性表单
      addForm: {
        attr_name: ''
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 修改参数/属性对话框的显示和隐藏
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      // 修改表单验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      // 控制按钮和文本框的切换显示
      inputVisible: false,
      // 文本框输入内容
      inputValue: ''
    }
  },
  computed: {
    // 是否禁用按钮
    isBtnDisabled() {
      return this.selectedKeys.length !== 3
    },
    // 当前选中的三级分类的 id
    catId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取商品分类失败'
        })
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框选中项发生变化
    async handleChange() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        // 清空 table
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message({
          type: 'error',
          message: '只允许为第三级分类设置相关参数'
        })
      }
      this.getParamsData()
    },
    // tab 页签点击事件处理函数
    handleTabClick() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return false
      }
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 根据所选分类id和当前所处的面板获取对应参数
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取参数列表失败'
        })
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 文本框的输入值
        item.inputValue = ''
        // 文本框的显示与隐藏
        item.inputVisible = false
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数/属性
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        }

        const { data: res } = await this.$http.post(`categories/${this.catId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          return this.$message({
            type: 'error',
            message: '添加失败'
          })
        }
        this.$message.success('添加' + this.titleText + '成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },

    // 修改参数/属性对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取参数信息失败'
        })
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑属性/参数对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false

        const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: this.editForm.attr_vals
        })
        if (res.meta.status !== 200) {
          return this.$message({
            type: 'error',
            message: '修改参数信息失败'
          })
        }
        this.$message({
          type: 'success',
          message: '修改参数信息成功'
        })
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 删除 属性/参数
    async removeParams(row) {
      const confirmResult = await this.$confirm(`此操作将永久删除${this.titleText} <strong>${row.attr_name}</strong> , 是否继续?`, '提示', {
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

      const { data: res } = await this.$http.delete(`categories/${this.catId}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: `删除${this.titleText}失败`
        })
      }
      this.$message({
        type: 'success',
        message: `删除${this.titleText}成功`
      })
      this.getParamsData()
    },
    // 增加 参数/属性 的可选项
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length !== 0) {
        // 输入信息合法，进行后续处理
        row.attr_vals.push(row.inputValue.trim())
        this.saveAttrVals(row)
      }
      row.inputValue = ''
      row.inputVisible = false
    },
    // 保存 参数/属性 的可选项
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '修改参数失败'
        })
      }
      this.$message({
        type: 'success',
        message: '修改参数成功'
      })
    },
    // 输入框的显示和隐藏
    showInputVisible(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除 参数/属性 的可选项
    handleTagClosed(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>

<style lang="scss" scoped>
.params {
  .input-new-tag {
    width: 90px;
  }
}
</style>
