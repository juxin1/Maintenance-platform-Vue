<template>
  <el-tag
    :type="type"
    :effect="effect"
    :size="size"
    :class="['status-tag', className]"
  >
    <el-icon v-if="showIcon" class="status-icon">
      <component :is="icon" />
    </el-icon>
    <slot>{{ label }}</slot>
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: ''
  },
  effect: {
    type: String,
    default: 'light'
  },
  size: {
    type: String,
    default: 'default'
  },
  showIcon: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

// 状态配置
const statusConfig = {
  pending: {
    type: '',
    label: '待处理',
    icon: 'Clock'
  },
  processing: {
    type: 'warning',
    label: '处理中',
    icon: 'Loading'
  },
  completed: {
    type: 'success',
    label: '已完成',
    icon: 'CircleCheck'
  },
  cancelled: {
    type: 'info',
    label: '已取消',
    icon: 'CircleClose'
  },
  failed: {
    type: 'danger',
    label: '失败',
    icon: 'Warning'
  }
}

// 计算属性
const config = computed(() => statusConfig[props.status] || {})
const type = computed(() => props.type || config.value.type)
const label = computed(() => config.value.label)
const icon = computed(() => config.value.icon)
</script>

<style lang="less" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  .status-icon {
    font-size: 14px;
  }
  
  &.is-loading {
    .status-icon {
      animation: rotating 2s linear infinite;
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 