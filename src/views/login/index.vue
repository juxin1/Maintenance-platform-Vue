<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="logo" class="logo">
        <h2>维修管理系统</h2>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="roleType">
          <el-select
            v-model="loginForm.roleType"
            placeholder="请选择登录角色"
            class="role-select"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="维修工程师" value="engineer" />
            <el-option label="维修接待" value="receptionist" />
            <el-option label="客户" value="customer" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-actions">
          <el-link type="primary" @click="handleRegister">注册账号</el-link>
          <el-link type="primary" @click="handleForgotPassword">忘记密码？</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 登录表单
const formRef = ref(null)
const loginForm = ref({
  username: '',
  password: '',
  roleType: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  roleType: [
    { required: true, message: '请选择登录角色', trigger: 'change' }
  ]
}

const loading = ref(false)

// 处理登录
const handleLogin = () => {
  if (!formRef.value) return
  
  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const userData = await userStore.login(loginForm.value)
        ElMessage.success('登录成功')
        
        // 根据角色类型跳转到对应页面
        const roleRouteMap = {
          admin: '/admin/dashboard',
          engineer: '/engineer/dashboard',
          receptionist: '/receptionist/dashboard',
          customer: '/customer/dashboard'
        }
        
        const redirectPath = roleRouteMap[userData.roleType]
        if (redirectPath) {
          router.push(redirectPath)
        } else {
          ElMessage.error('未知的角色类型')
          userStore.logout()
        }
      } catch (error) {
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 处理注册
const handleRegister = () => {
  router.push('/register')
}

// 处理忘记密码
const handleForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%);
  
  .login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
      
      .logo {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }
      
      h2 {
        margin: 0;
        font-size: 24px;
        color: var(--el-text-color-primary);
      }
    }
    
    .login-form {
      .role-select {
        width: 100%;
      }
      
      .login-button {
        width: 100%;
      }
      
      .login-actions {
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .login-container {
    .login-box {
      width: 90%;
      padding: 20px;
    }
  }
}
</style> 