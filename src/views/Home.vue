<template>
  <div class="home-container">
    <h1>欢迎来到维修管理系统</h1>
    <div class="user-info" v-if="userInfo">
      <p>用户名：{{ userInfo.username }}</p>
      <p>角色：{{ userInfo.roleType }}</p>
      <p>用户ID：{{ userInfo.userId }}</p>
    </div>
    <el-button type="primary" @click="handleLogout">退出登录</el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userInfo = ref(null)

onMounted(() => {
  try {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
      // 验证 token 是否存在
      const token = localStorage.getItem('token')
      if (!token) {
        handleLogout()
      }
    } else {
      handleLogout()
    }
  } catch (error) {
    console.error('Error loading user info:', error)
    handleLogout()
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
}
</style> 