<template>
  <div class="login">
    <div class="login-container">
      <div class="login-box px-4">
        <h2 class="text-center py-4 text-primary ">电商后台管理系统</h2>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="pt-5">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-key"></el-input>
          </el-form-item>

          <el-form-item class="text-right ">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) {
          this.$message({
            type: 'error',
            message: '登录失败'
          })
        } else {
          this.$message({
            type: 'success',
            message: '登录成功'
          })
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        }
      })
    },
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  .login-container {
    background: #2b4b6b;
    min-height: 100vh;
    position: relative;
    .login-box {
      height: 300px;
      width: 400px;
      background: white;
      border-radius: 3px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
