<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div 
      class="sidebar-container" 
      :class="{ 'is-collapsed': isCollapse }"
    >
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo">
        <span v-show="!isCollapse">维修管理系统</span>
      </div>
      <el-scrollbar>
        <sidebar-menu />
      </el-scrollbar>
    </div>

    <!-- 主容器 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="left">
          <el-icon 
            class="collapse-btn"
            @click="toggleSidebar"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="right">
          <el-tooltip content="全屏" placement="bottom">
            <el-icon class="action-icon" @click="toggleFullScreen">
              <FullScreen />
            </el-icon>
          </el-tooltip>
          
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-container">
              <el-avatar 
                :size="32" 
                :src="userInfo.avatar || ''"
              />
              <span class="username">{{ userInfo.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人资料
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 标签导航 -->
      <tags-view />

      <!-- 主要内容区 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'
import { Fold, Expand, FullScreen, User, Lock, SwitchButton } from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import SidebarMenu from './components/SidebarMenu.vue'
import TagsView from './components/TagsView.vue'

const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 处理用户操作
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      // 实现修改密码功能
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await userStore.logout()
        router.push('/login')
      } catch {}
      break
  }
}

// 全屏切换
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

<style lang="less" scoped>
.app-wrapper {
  height: 100vh;
  display: flex;
  
  .sidebar-container {
    width: 240px;
    height: 100%;
    background-color: var(--el-menu-bg-color);
    transition: width 0.3s;
    overflow: hidden;
    
    &.is-collapsed {
      width: 64px;
    }
    
    .logo {
      height: 60px;
      padding: 10px;
      display: flex;
      align-items: center;
      background: var(--el-menu-bg-color);
      overflow: hidden;
      
      img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
      
      span {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-menu-text-color);
        white-space: nowrap;
      }
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .navbar {
      height: 60px;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      border-bottom: 1px solid var(--el-border-color-light);
      
      .left {
        display: flex;
        align-items: center;
        
        .collapse-btn {
          font-size: 20px;
          cursor: pointer;
          margin-right: 16px;
          
          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
      
      .right {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .action-icon {
          font-size: 20px;
          cursor: pointer;
          
          &:hover {
            color: var(--el-color-primary);
          }
        }
        
        .avatar-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          
          .username {
            font-size: 14px;
          }
        }
      }
    }
    
    .app-main {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: var(--el-bg-color-page);
    }
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 