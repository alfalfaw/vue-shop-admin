<template>
  <div class="rights">
    <el-card>
      <el-table :data="rightsList" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template #default="{row}">
            <el-tag v-if="row.level === '0'">一级</el-tag>
            <el-tag type="success" v-if="row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-if="row.level === '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data() {
    return {
      rightsList: []
    }
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取权限列表失败'
        })
      }
      this.rightsList = res.data
      console.log(this.rightsList)
    }
  },
  created() {
    this.getRightsList()
  }
}
</script>

<style lang="scss" scoped></style>
