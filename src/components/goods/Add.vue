<template>
  <div class="add">
    <el-card>
      <!-- <el-alert title="添加商品" center type="info" :closable="false"> </el-alert> -->

      <el-steps class="mt-5" align-center :space="200" :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" class="mt-5" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane name="0" label="基本信息">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input-number :precision="2" :step="0.1" v-model="addForm.goods_price"></el-input-number>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input-number :precision="2" :step="0.5" v-model="addForm.goods_weight"></el-input-number>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input-number v-model="addForm.goods_number"></el-input-number>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                class="w-100"
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cascaderProps"
                clearable
                @change="handleCateChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="1" label="商品参数">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox size="mini" border :label="subItem" v-for="(subItem, i) in item.attr_list" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="2" label="商品属性">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox size="mini" border :label="subItem" v-for="(subItem, i) in item.attr_list" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="3" label="商品图片">
            <el-upload
              :headers="headers"
              :action="uploadUrl"
              :before-upload="beforeUpload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png/bmp/gif文件，且不超过2M</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane name="4" label="商品内容">
            <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce" />
            <div class="text-right mt-3">
              <el-button @click="add" type="primary" size="small">保存提交</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane name="6" label="完成添加">
            <img class="add-success" src="@/assets/add-good-success.svg" alt="" />
            <p class="text-center mt-3">
              商品添加成功，将在 <strong>{{ countdown }}</strong> 秒后进行跳转。
            </p>
            <p class="text-center">如果没有跳转，请点击<router-link to="/goods">这里</router-link>返回</p>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="预览" :visible.sync="previewDialogVisible" width="50%">
      <img class="w-100" :src="previewPath" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
import _ from 'lodash'
export default {
  name: 'Add',
  components: {
    quillEditor
  },
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类数组
        goods_cat: [],
        pics: [],
        // 商品详情
        goods_introduce: '',
        // 属性 / 参数
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 商品分类列表
      catelist: [],
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        chidlren: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 图片上传地址
      uploadUrl: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      headers: {
        Authorization: sessionStorage.token
      },
      // 图片预览路径
      previewPath: '',
      // 控制图片预览对话框显示与隐藏
      previewDialogVisible: false,
      // 是否添加成功
      addSuccess: false,
      // 倒计时
      countdown: 3
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },

  methods: {
    // 获取所有分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取商品分类数据失败'
        })
      }
      this.catelist = res.data
      console.log(this.catelist)
    },

    // 根据分类获取动态参数列表
    async getManyTableData() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'many'
        }
      })

      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取参数列表失败'
        })
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        item.attr_list = _.cloneDeep(item.attr_vals)
      })
      this.manyTableData = res.data
    },
    // 根据分类获取静态属性列表
    async getOnlyTableData() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'only'
        }
      })

      if (res.meta.status !== 200) {
        return this.$message({
          type: 'error',
          message: '获取属性列表失败'
        })
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        item.attr_list = _.cloneDeep(item.attr_vals)
      })
      this.onlyTableData = res.data
    },
    // 级联选择器选中项变化
    handleCateChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return false
      }
      // 如果选择了三级分类，发送请求更新动态参数和静态属性
      this.getManyTableData()
      this.getOnlyTableData()
    },
    // 监听切换tab
    beforeTabLeave(activeName, oldActiveName) {
      console.log('打印选择分类')
      console.log(this.addForm.goods_cat)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message({
          type: 'error',
          message: '请先选择商品分类'
        })
        return false
      }
      // 如果用户没有提交，不能跳转到完成添加
      if (activeName === '6' && !this.addSuccess) {
        return false
      }
      if (oldActiveName === '6') return false
    },

    // 切换面板
    async tabClicked() {},
    // 图片预览
    handlePreview(file) {
      if (!file) return
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 移除图片
    handleRemove(file) {
      // 如果file中有 response 属性，说明删除上传成功的图片，否则什么也不做
      if (file.response) {
        const filePath = file.response.data.tmp_path
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        this.addForm.pics.splice(i, 1)
      }
    },
    // 控制上传图片大小和格式
    beforeUpload(file) {
      const isSupport = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'].indexOf(file.type) > -1
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isSupport) {
        this.$message.error('上传图片只能是 JPG/PNG/BMP/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isSupport && isLt2M
    },
    // 图片上传成功
    handleSuccess(res) {
      this.addForm.pics.push({
        pic: res.data.tmp_path
      })
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message({
            type: 'error',
            message: '请填写必要的表单项'
          })
        }
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        form.attrs = []
        // 如果没有打开过商品参数/商品属性面板，这两个数组均为空
        this.manyTableData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        this.onlyTableData.forEach(item => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        console.log(form)

        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message({
            type: 'error',
            message: res.meta.msg
          })
        }
        this.$message({
          type: 'success',
          message: '添加商品成功'
        })
        this.addSuccess = true
        this.activeIndex = '6'
        const timer = setInterval(() => {
          this.countdown--
          if (this.countdown === 0) {
            clearInterval(timer)
            this.$router.push('/goods')
          }
        }, 1000)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-steps .el-step__title {
  font-size: 1.3rem;
}
/deep/ .el-checkbox {
  margin: 0 5px 0 0 !important;
}
/deep/ .ql-editor {
  min-height: 260px;
}
.add {
  #pane-6 {
    padding-top: 45px;
    .add-success {
      display: block;
      width: 200px;
      margin: 0 auto;
    }
  }
}
</style>
