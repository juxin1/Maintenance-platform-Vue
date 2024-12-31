<template>
  <div class="tags-view">
    <el-scrollbar class="tags-scrollbar">
      <div class="tags-wrapper">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.path"
          :to="tag.path"
          custom
          v-slot="{ navigate }"
        >
          <el-tag
            :class="{ active: isActive(tag) }"
            :closable="!isAffix(tag)"
            :effect="isActive(tag) ? 'dark' : 'plain'"
            @click="navigate"
            @close.prevent="closeSelectedTag(tag)"
          >
            <el-icon v-if="tag.meta?.icon" class="tag-icon">
              <component :is="tag.meta.icon" />
            </el-icon>
            {{ tag.meta?.title }}
          </el-tag>
        </router-link>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 访问过的页面
const visitedViews = ref([])

// 判断是否是当前激活的标签
const isActive = (tag) => {
  return tag.path === route.path
}

// 判断是否是固定标签
const isAffix = (tag) => {
  return tag.meta?.affix
}

// 添加访问的页面到标签栏
const addVisitedView = (view) => {
  if (visitedViews.value.some(v => v.path === view.path)) return
  
  visitedViews.value.push(
    Object.assign({}, view, {
      title: view.meta?.title || 'unknown'
    })
  )
}

// 关闭选中的标签
const closeSelectedTag = (view) => {
  const index = visitedViews.value.indexOf(view)
  if (index === -1) return
  
  visitedViews.value.splice(index, 1)
  if (isActive(view)) {
    toLastView()
  }
}

// 跳转到最后一个标签
const toLastView = () => {
  const latestView = visitedViews.value.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    router.push('/')
  }
}

// 监听路由变化，添加标签
watch(() => route.path, () => {
  addVisitedView(route)
}, { immediate: true })
</script>

<style lang="less" scoped>
.tags-view {
  height: 34px;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
  
  .tags-scrollbar {
    height: 100%;
    white-space: nowrap;
    
    .tags-wrapper {
      padding: 4px 8px;
      
      .el-tag {
        margin-right: 4px;
        cursor: pointer;
        height: 26px;
        
        &.active {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: #fff;
          
          .el-icon {
            color: #fff;
          }
        }
        
        .tag-icon {
          margin-right: 4px;
        }
      }
    }
  }
}
</style> 