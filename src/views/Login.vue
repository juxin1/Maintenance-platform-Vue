<template>
  <div class="login-container">
    <div class="theme-switch" @click="toggleDark()">
      <el-icon :size="20">
        <component :is="isDark ? 'Sunny' : 'Moon'" />
      </el-icon>
    </div>

    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <el-icon :size="32"><Setting /></el-icon>
        </div>
        <h1>维修管理系统</h1>
        <p class="subtitle">登录以获得更快捷的服务体验</p>
      </div>

      <div class="form-container">
        <template v-if="!showPassword">
          <el-input
            v-model="loginForm.username"
            placeholder="账号"
            class="custom-input"
            @keyup.enter="handleUsername"
          />
          <el-button
            type="primary"
            class="next-button"
            :loading="loading"
            @click="handleUsername"
          >
            继续
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>
        </template>

        <template v-else>
          <div class="user-info" @click="showPassword = false">
            <el-icon><User /></el-icon>
            <span>{{ loginForm.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>

          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            class="custom-input"
            @keyup.enter="handleLogin"
          />

          <el-checkbox v-model="rememberMe" class="remember-me">记住账号</el-checkbox>

          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>
        </template>

        <div class="divider"></div>
        <router-link to="/register" class="register-button">
          注册账号
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-container {
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
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      background-color: rgba(255, 255, 255, 0.9);
    }
  }

  .login-box {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;

      .logo {
        width: 72px;
        height: 72px;
        margin: 0 auto 1.2rem;
        background: linear-gradient(135deg, #0071e3 0%, #36d1dc 100%);
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 16px rgba(0, 113, 227, 0.2);
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }

      h1 {
        font-size: 2rem;
        font-weight: 500;
        color: #1d1d1f;
        margin-bottom: 0.8rem;
        letter-spacing: -0.5px;
      }

      .subtitle {
        color: #86868b;
        font-size: 1.1rem;
      }
    }

    .form-container {
      .custom-input {
        margin-bottom: 1.2rem;

        :deep(.el-input__wrapper) {
          box-shadow: none !important;
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          padding: 0 18px;
          height: 52px;
          background-color: transparent;
          transition: all 0.3s ease;

          &:hover {
            border-color: #86868b;
          }

          &.is-focus {
            border-color: #0066cc;
            border-width: 2px;
          }

          .el-input__inner {
            height: 50px;
            line-height: 50px;
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
        gap: 10px;
        padding: 14px;
        margin-bottom: 1.2rem;
        cursor: pointer;
        color: #1d1d1f;
        transition: all 0.3s ease;
        border-radius: 12px;

        &:hover {
          color: #0066cc;
          background-color: #f5f5f7;
        }
      }

      .remember-me {
        margin-bottom: 1.2rem;
        color: #1d1d1f;
      }

      .next-button,
      .login-button {
        width: 100%;
        height: 52px;
        font-size: 17px;
        border-radius: 12px;
        background: #0071e3;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          background: #0077ed;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 113, 227, 0.2);
        }

        .arrow-icon {
          font-size: 18px;
          transition: transform 0.3s ease;
        }

        &:hover .arrow-icon {
          transform: translateX(4px);
        }
      }

      .divider {
        height: 1px;
        background: #d2d2d7;
        margin: 2.5rem 0;
        opacity: 0.8;
      }

      .register-button {
        display: block;
        width: 100%;
        height: 52px;
        line-height: 50px;
        text-align: center;
        color: #0066cc;
        border: 1px solid #0066cc;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.3s ease;
        font-size: 17px;
        
        &:hover {
          background: #0066cc;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 102, 204, 0.2);
        }
      }
    }
  }
}

// 深色模式优化
html.dark {
  .login-container {
    background-color: #1d1d1f;

    .theme-switch {
      background-color: rgba(255, 255, 255, 0.1);
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }
    }

    .login-box {
      background: #2d2d2f;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

      .login-header {
        h1 {
          color: #f5f5f7;
        }
      }

      .form-container {
        .custom-input {
          :deep(.el-input__wrapper) {
            border-color: #424245;
            
            &:hover {
              border-color: #6e6e73;
            }
            
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

          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }

        .remember-me {
          color: #f5f5f7;
        }

        .divider {
          background: #424245;
        }
      }
    }
  }
}

// 响应式优化
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
    
    .login-box {
      padding: 1.5rem;
      max-width: 100%;
      
      .login-header {
        h1 {
          font-size: 1.6rem;
        }
        
        .subtitle {
          font-size: 1rem;
        }
      }
    }
  }
}

@media (min-width: 1200px) {
  .login-container {
    .login-box {
      max-width: 400px;
      padding: 2rem;
    }
  }
}
</style>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, ArrowRight, ArrowDown, Setting } from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'
import { login } from '@/api/user'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const handleUsername = () => {
  if (loginForm.username) {
    showPassword.value = true
  } else {
    ElMessage.warning('请输入账号')
  }
}

const handleLogin = async () => {
  if (!loginForm.password) {
    ElMessage.warning('请输入密码')
    return
  }

  try {
    loading.value = true
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (res.code === 1 && res.data) {
      const userData = res.data
      if (userData.token) {
        localStorage.setItem('token', userData.token)
      }
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      if (rememberMe.value) {
        localStorage.setItem('rememberedUsername', loginForm.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }

      // 根据角色类型跳转到对应的页面
      const roleRouteMap = {
        admin: '/admin/dashboard',
        engineer: '/engineer/dashboard',
        receptionist: '/receptionist/dashboard',
        customer: '/customer/dashboard'
      }

      const targetRoute = roleRouteMap[userData.roleType]
      if (targetRoute) {
        ElMessage.success('登录成功')
        await router.push(targetRoute)
      } else {
        ElMessage.error('未知的用户角色')
      }
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时检查是否有记住的用户名
const initRememberedUsername = () => {
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    rememberMe.value = true
  }
}

initRememberedUsername()
</script>
