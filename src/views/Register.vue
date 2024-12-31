<template>
  <div class="register-container">
    <div class="theme-switch" @click="toggleDark()">
      <el-icon :size="20">
        <component :is="isDark ? 'Sunny' : 'Moon'" />
      </el-icon>
    </div>

    <div class="register-box">
      <div class="register-header">
        <div class="logo">
          <el-icon :size="32"><Setting /></el-icon>
        </div>
        <h1>维修管理系统</h1>
        <p class="subtitle">创建您的账号</p>
      </div>

      <div class="form-container">
        <template v-if="!showNext">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            class="custom-input"
            @keyup.enter="handleNext"
          />
          <div class="error-message" v-if="usernameError">{{ usernameError }}</div>

          <el-button
            type="primary"
            class="next-button"
            :loading="loading"
            @click="handleNext"
          >
            继续
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>
        </template>

        <template v-else>
          <div class="user-info" @click="showNext = false">
            <el-icon><User /></el-icon>
            <span>{{ registerForm.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>

          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            class="custom-input"
          />
          <div class="error-message" v-if="passwordError">{{ passwordError }}</div>

          <el-input
            v-model="registerForm.phoneNumber"
            placeholder="请输入手机号码"
            class="custom-input"
          />
          <div class="error-message" v-if="phoneError">{{ phoneError }}</div>

          <el-button
            type="primary"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >
            创建账号
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>
        </template>

        <div class="divider"></div>
        <router-link to="/login" class="login-link">
          返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, ArrowRight, ArrowDown, Setting } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
const loading = ref(false)
const showNext = ref(false)

// 错误信息
const usernameError = ref('')
const passwordError = ref('')
const phoneError = ref('')

const registerForm = reactive({
  username: '',
  password: '',
  phoneNumber: ''
})

const validateUsername = () => {
  if (!registerForm.username) {
    usernameError.value = '请输入用户名'
    return false
  }
  if (registerForm.username.length < 3 || registerForm.username.length > 20) {
    usernameError.value = '用户名长度在 3 到 20 个字符'
    return false
  }
  usernameError.value = ''
  return true
}

const validatePassword = () => {
  if (!registerForm.password) {
    passwordError.value = '请输入密码'
    return false
  }
  if (registerForm.password.length < 6) {
    passwordError.value = '密码长度不能小于 6 个字符'
    return false
  }
  passwordError.value = ''
  return true
}

const validatePhone = () => {
  if (!registerForm.phoneNumber) {
    phoneError.value = '请输入手机号码'
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phoneNumber)) {
    phoneError.value = '请输入正确的手机号码'
    return false
  }
  phoneError.value = ''
  return true
}

const handleNext = () => {
  if (validateUsername()) {
    showNext.value = true
  }
}

const handleRegister = async () => {
  if (!validatePassword() || !validatePhone()) {
    return
  }

  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f7;
  padding: 20px;

  .theme-switch {
    position: fixed;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .register-box {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
      
      .logo {
        width: 64px;
        height: 64px;
        margin: 0 auto 1rem;
        background: linear-gradient(135deg, #0071e3 0%, #36d1dc 100%);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      
      h1 {
        font-size: 1.8rem;
        font-weight: 500;
        color: #1d1d1f;
        margin-bottom: 0.5rem;
      }
      
      .subtitle {
        color: #86868b;
        font-size: 1rem;
      }
    }

    .form-container {
      .custom-input {
        margin-bottom: 1rem;

        :deep(.el-input__wrapper) {
          box-shadow: none !important;
          border: 1px solid #d2d2d7;
          border-radius: 8px;
          padding: 0 15px;
          height: 48px;
          background-color: transparent;

          &.is-focus {
            border-color: #0066cc;
          }

          .el-input__inner {
            height: 46px;
            line-height: 46px;
            font-size: 16px;
            color: #1d1d1f;

            &::placeholder {
              color: #86868b;
            }
          }
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        margin-bottom: 1rem;
        cursor: pointer;
        color: #1d1d1f;
        transition: all 0.3s;

        &:hover {
          color: #0066cc;
        }
      }

      .next-button,
      .register-button {
        width: 100%;
        height: 48px;
        font-size: 16px;
        border-radius: 8px;
        background: #0071e3;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &:hover {
          background: #0077ed;
        }

        .arrow-icon {
          font-size: 16px;
        }
      }

      .divider {
        height: 1px;
        background: #d2d2d7;
        margin: 2rem 0;
      }

      .login-link {
        display: block;
        width: 100%;
        height: 48px;
        line-height: 46px;
        text-align: center;
        color: #0066cc;
        border: 1px solid #0066cc;
        border-radius: 8px;
        text-decoration: none;
        transition: all 0.3s;

        &:hover {
          background: #0066cc;
          color: white;
        }
      }
    }
  }
}

// 深色模式
html.dark {
  .register-container {
    background-color: #1d1d1f;

    .register-box {
      background: #2d2d2f;

      .register-header {
        h1 {
          color: #f5f5f7;
        }
      }

      .form-container {
        .custom-input {
          :deep(.el-input__wrapper) {
            border-color: #424245;
            
            .el-input__inner {
              color: #f5f5f7;

              &::placeholder {
                color: #86868b;
              }
            }
          }
        }

        .user-info {
          color: #f5f5f7;
        }

        .divider {
          background: #424245;
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
    
    .register-box {
      .register-header {
        h1 {
          font-size: 1.5rem;
        }
      }
    }
  }
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin: -8px 0 12px 2px;
  height: 18px;
}
</style>
