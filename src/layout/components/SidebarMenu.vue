<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="true"
    router
  >
    <template v-for="menu in menus" :key="menu.path">
      <!-- 子菜单 -->
      <el-sub-menu 
        v-if="menu.children && menu.children.length" 
        :index="menu.path"
      >
        <template #title>
          <el-icon v-if="menu.meta?.icon">
            <component :is="menu.meta.icon" />
          </el-icon>
          <span>{{ menu.meta?.title }}</span>
        </template>
        
        <el-menu-item 
          v-for="child in menu.children"
          :key="child.path"
          :index="menu.path + '/' + child.path"
        >
          <el-icon v-if="child.meta?.icon">
            <component :is="child.meta.icon" />
          </el-icon>
          <span>{{ child.meta?.title }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 单个菜单 -->
      <el-menu-item 
        v-else 
        :index="menu.path"
      >
        <el-icon v-if="menu.meta?.icon">
          <component :is="menu.meta.icon" />
        </el-icon>
        <span>{{ menu.meta?.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 是否折叠
const isCollapse = computed(() => {
  const el = document.querySelector('.sidebar-container')
  return el?.classList.contains('is-collapsed')
})

// 根据角色获取菜单
const menus = computed(() => {
  const role = userStore.userInfo.roleType
  return route.matched[0]?.children || []
})
</script>

<style lang="less" scoped>
.el-menu {
  border-right: none;
  
  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    .el-icon {
      margin-right: 12px;
    }
  }
}
</style> 