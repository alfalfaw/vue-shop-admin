<template>
  <div class="users">
    <el-card>
      <el-row>
        <el-col :span="12">
          <el-input v-model="queryInfo.query" clearable placeholder="请输入内容" size="medium" @clear="search">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button size="medium" type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table @selection-change="handleSelectionChange" class="mt-5" :data="userList" border style="width: 100%">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名" width="90"> </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"> </el-table-column>
        <el-table-column prop="role_name" label="角色" width="100"> </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }"
            ><el-switch v-model="row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="userStateChanged(row)"> </el-switch
          ></template>
        </el-table-column>
        <!-- min-width 设置单元格最小宽度，align 设置对齐方式 -->
        <el-table-column label="操作" fixed="right" min-width="180" align="center">
          <template #default="{row}">
            <!-- enterable="false" 鼠标放到提示框时提示框仍会消失 -->
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button @click="showEditDialog(row.id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button @click="removeUserById(row)" size="mini" type="danger" icon="el-icon-delete"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="d-flex ai-center mt-4 jc-between">
        <el-button type="danger" size="small" @click="removeUsers">删除选中</el-button>
        <el-pagination
          class="text-right d-flex ai-center"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" label-position="left">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="addUser" size="medium">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" label-position="left">
        <el-form-item label="用户名" required>
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="editUserInfo" size="medium">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 邮箱校验规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) {
        return callback()
      }

      callback(new Error('请输入正确的邮箱'))
    }
    // 手机号校验规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号'))
    }
    return {
      queryInfo: {
        query: this.$route.query.query || '', // 查询内容
        pagenum: parseInt(this.$route.query.pagenum) || 1, // 页码
        pagesize: parseInt(this.$route.query.pagesize) || 2 // 每页大小
      },
      userList: [],
      total: 0,
      lastQuery: this.$route.query.query || '',
      // 添加用户对话显示和隐藏
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: ''
      },
      // 添加用户表单校验规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 修改用户对话显示和隐藏
      editDialogVisible: false,
      // 查询到用户信息
      editForm: {},
      // 修改用户表单校验规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 选中的数据
      multipleSelection: []
    }
  },
  methods: {
    // 获取管理员列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取用户数据失败'
        })
      }
      this.userList = res.data.users
      this.total = res.data.total

      // console.log(this.userList)
    },
    // 监听 pagesize 变化
    handleSizeChange(newVal) {
      // console.log(newVal)
      this.queryInfo.pagesize = newVal
      this.getUserList()
      this.$router.push({ path: 'users', query: this.queryInfo })
    },
    // 监听 pagenum 变化
    handleCurrentChange(newVal) {
      this.queryInfo.pagenum = newVal
      this.getUserList()
      this.$router.push({ path: 'users', query: this.queryInfo })
    },
    // 监听用户状态改变
    async userStateChanged(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message({
          type: 'error',
          message: '更新用户状态失败'
        })
      }

      this.$message({
        type: 'success',
        message: '更新用户状态成功'
      })
    },

    // 查询
    search() {
      if (this.lastQuery !== this.queryInfo.query) {
        this.$router.push({ path: 'users', query: this.queryInfo })
        this.getUserList()
        this.lastQuery = this.queryInfo.query
      }
    },
    // 添加用户对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message({
            type: 'error',
            message: '添加用户失败'
          })
        }
        this.$message({
          type: 'success',
          message: '添加用户成功'
        })
        // 隐藏添加用户对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
      })
    },
    // 展示编辑用户对话框
    async showEditDialog(id) {
      // 重新通过id查询一遍数据确保获得数据是最新的
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '查询用户信息失败'
        })
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 关闭编辑用户对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message({
            type: 'error',
            message: '修改用户信息失败'
          })
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message({
          type: 'success',
          message: '更新用户信息成功'
        })
      })
    },
    // 根据id删除用户
    async removeUserById(row) {
      const confirmResult = await this.$confirm(`此操作将永久删除用户 <strong>${row.username}</strong> , 是否继续?`, '提示', {
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

      const { data: res } = await this.$http.delete(`users/${row.id}`)
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '删除用户失败'
        })
      }
      this.$message({
        type: 'success',
        message: '删除用户成功'
      })
      this.getUserList()
    },
    // 多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 删除多个
    async removeUsers() {
      let nameStr = this.multipleSelection.map(user => user.username).join('、')
      const confirmResult = await this.$confirm(`此操作将永久删除用户 <strong>${nameStr}</strong>，是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).catch(err => err)
      if (confirmResult === 'cancel') {
        return this.$message({
          type: 'info',
          message: '取消删除'
        })
      }
      const deleted = []

      for (let i = 0; i < this.multipleSelection.length; i++) {
        await this.$http.delete(`users/${this.multipleSelection[i].id}`)
        deleted.push(this.multipleSelection[i].username)
      }

      nameStr = deleted.join('、')
      this.$alert(`<strong>${nameStr}</strong> 已删除`, '提示', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
        callback: action => action
      })
      this.getUserList()
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="scss" scoped></style>
