<template>
  <div class="order">
    <el-card>
      <el-row>
        <el-col :span="12">
          <el-input v-model="queryInfo.query" clearable placeholder="请输入内容" size="medium" @clear="search">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table class="mt-5" :data="orderlist" border style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="{ row }">
            <el-tag size="medium" v-if="row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag size="medium" v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="{ row }">
            {{ row.create_time | dateFormat }}
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" min-width="180" align="center">
          <template #default="{row}">
            <!-- enterable="false" 鼠标放到提示框时提示框仍会消失 -->
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button @click="showEditDialog(row.id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="定位" placement="top" :enterable="false">
              <el-button @click="showProgressDialog" size="mini" type="success" icon="el-icon-location"></el-button>
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
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader class="w-100" v-model="editForm.address1" :options="cityData" :props="cascaderProps" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false" size="medium">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: 'Order',
  data() {
    return {
      queryInfo: {
        query: this.$route.query.query || '', // 查询内容
        pagenum: parseInt(this.$route.query.pagenum) || 1, // 页码
        pagesize: parseInt(this.$route.query.pagesize) || 10 // 每页大小
      },
      // 订单总数
      total: 0,
      // 订单列表
      orderlist: [],
      lastQuery: this.$route.query.query || '',
      // 修改地址对话框的显示与隐藏
      editDialogVisible: false,
      editForm: {
        address1: [],
        address2: ''
      },
      editFormRules: {
        address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      cityData,
      cascaderProps: {
        expandTrigger: 'hover', // 触发方式
        label: 'label', // 标签名
        value: 'value', // 值
        children: 'children' // 如何定义层级关系
      },
      // 物流进度对话框的显示与隐藏
      progressDialogVisible: false,
      // 物流进度
      progressInfo: {}
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取订单数据失败'
        })
      }
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    // 查询
    search() {
      if (this.lastQuery !== this.queryInfo.query) {
        this.queryInfo.pagenum = 1
        this.$router.push({ path: 'orders', query: this.queryInfo })
        this.getOrderList()
        this.lastQuery = this.queryInfo.query
      }
    },
    // 监听 pagesize 变化
    handleSizeChange(newVal) {
      // console.log(newVal)
      this.queryInfo.pagesize = newVal
      this.getOrderList()
      this.$router.push({ path: 'orders', query: this.queryInfo })
    },
    // 监听 pagenum 变化
    handleCurrentChange(newVal) {
      this.queryInfo.pagenum = newVal
      this.getOrderList()
      this.$router.push({ path: 'orders', query: this.queryInfo })
    },
    // 展示修改地址对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
    },
    // 关闭编辑修改地址对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async showProgressDialog() {
      const { data: res } = await this.$http.get('kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取物流进度失败'
        })
      }
      this.progressInfo = res.data
      // console.log(this.progressInfo)
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.order {
}
</style>
