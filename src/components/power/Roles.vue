<template>
  <div class="roles">
    <el-card>
      <div class="text-right">
        <el-button type="primary" size="medium" @click="addDialogVisible = true">添加角色</el-button>
      </div>
      <el-table :data="rolelist" border class="mt-4">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="{row}">
            <el-row v-for="item1 in row.children" :key="item1.id" class="rights-row py-2 d-flex ai-center">
              <!-- 渲染一级权限 -->
              <el-col :span="5" class="d-flex ai-center">
                <el-tag class="m-2" closable @close="removeRightById(row, item1)"> {{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row v-for="item2 in item1.children" :key="item2.id" class="rights-sub-row d-flex ai-center">
                  <el-col :span="6" class="d-flex ai-center">
                    <el-tag type="success" class="m-2" closable @close="removeRightById(row, item2)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      class="m-2"
                      :key="item3.id"
                      closable
                      @close="removeRightById(row, item3)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" fixed="right" min-width="180" align="center">
          <template #default="{row}">
            <!-- enterable="false" 鼠标放到提示框时提示框仍会消失 -->
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button @click="showEditDialog(row.id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button @click="removeRoleById(row)" size="mini" type="danger" icon="el-icon-delete"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button @click="showSetRightDialog(row)" size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px" label-position="right">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="addRole" size="medium">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px" label-position="right">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo" size="medium">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog @close="setRightDialogClosed" title="修改权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- show-checkbox 显示选择框， node-key 指定选中结点后的取值，default-expand-all 默认展开所有结点，default-checked-keys 默认选中的 key 数组 -->
      <el-tree
        ref="treeRef"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        :data="rightslist"
        :props="treeProps"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" size="medium" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      rolelist: [],
      editForm: {},
      editDialogVisible: false,
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 权限列表
      rightslist: [],
      // 树形控件绑定对象
      treeProps: {
        label: 'authName', // 显示名称
        children: 'children' // 层级关系
      },
      // 默认选中结点 id 数组
      defaultKeys: [],
      // 即将分配权限的角色 id
      roleId: ''
    }
  },

  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取角色列表失败'
        })
      }
      this.rolelist = res.data
      // console.log(this.rolelist)
    },
    // 展示编辑角色对话框
    async showEditDialog(id) {
      // 重新通过id查询一遍数据确保获得数据是最新的
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '查询角色信息失败'
        })
      }
      this.editForm = res.data
      this.editDialogVisible = true
      // console.log(this.editForm)
    },
    // 关闭编辑角色对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改角色信息
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(this.editForm)
        if (!valid) return false
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message({
            type: 'error',
            message: '修改角色信息失败'
          })
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message({
          type: 'success',
          message: '更新角色信息成功'
        })
      })
    },
    // 根据 id 删除角色
    async removeRoleById(row) {
      // console.log(row)
      const confirmResult = await this.$confirm(`此操作将永久删除角色 <strong>${row.roleName}</strong> , 是否继续?`, '提示', {
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

      const { data: res } = await this.$http.delete(`roles/${row.id}`)
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '删除角色失败'
        })
      }
      this.$message({
        type: 'success',
        message: '删除角色成功'
      })
      this.getRolesList()
    },

    // 添加角色对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message({
            type: 'error',
            message: '添加角色失败'
          })
        }
        this.$message({
          type: 'success',
          message: '分配角色权限失败'
        })
        // 隐藏添加角色对话框
        this.addDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
      })
    },
    // 根据 id 删除权限
    async removeRightById(row, right) {
      const confirmResult = await this.$confirm(
        `是否删除角色<strong> ${row.roleName} </strong>的<strong> ${right.authName} </strong>权限`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      ).catch(err => err)

      if (confirmResult === 'cancel') {
        return this.$message({
          type: 'info',
          message: '取消删除'
        })
      }

      const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${right.id}`)

      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '删除权限失败'
        })
      }
      this.$message({
        type: 'success',
        message: '删除权限成功'
      })
      // 为了防止关闭打开的页面，用返回的数据更新该行
      row.children = res.data
    },
    // 展示修改权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      this.getLeafKeys(role, this.defaultKeys)
      this.setRightDialogVisible = true
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取权限数据失败'
        })
      }
      this.rightslist = res.data
      // console.log(this.rightslist)
    },
    // 递归获取角色下所有三级权限的 id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听修改权限对话框的关闭事件
    setRightDialogClosed() {
      this.defaultKeys = []
    },
    // 分配权限
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '分配角色权限失败'
        })
      }
      this.$message({
        type: 'success',
        message: '分配角色权限成功'
      })
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style lang="scss" scoped>
.roles {
  .rights-row {
    border-bottom: 1px solid #eee;
    &:first-child {
      border-top: 1px solid #eee;
    }
  }
  .rights-sub-row {
    border-bottom: 1px solid #eee;
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
