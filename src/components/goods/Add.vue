<template>
  <div class="add">
    <el-card>
      <el-alert title="添加商品" center type="info" :closable="false"> </el-alert>
      <el-steps class="mt-5" align-center :space="200" :active="activeIndex" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-tabs class="mt-5" tab-position="left">
        <el-tab-pane label="基本信息">基本信息</el-tab-pane>
        <el-tab-pane label="商品参数">商品参数</el-tab-pane>
        <el-tab-pane label="商品属性">商品属性</el-tab-pane>
        <el-tab-pane label="商品图片">商品图片</el-tab-pane>
        <el-tab-pane label="商品内容">商品内容</el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Add',
  data() {
    return {
      activeIndex: 0
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-steps .el-step__title {
  font-size: 1.3rem;
}
.add {
}
</style>
