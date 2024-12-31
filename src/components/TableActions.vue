<template>
  <div class="table-actions">
    <template v-for="(action, index) in actions" :key="index">
      <el-button
        v-if="!action.hidden"
        :type="action.type || 'primary'"
        :link="action.link !== false"
        :disabled="action.disabled"
        :loading="action.loading"
        @click="handleAction(action)"
      >
        <el-icon v-if="action.icon"><component :is="action.icon" /></el-icon>
        {{ action.label }}
      </el-button>
      <el-divider 
        v-if="index < actions.length - 1 && !action.hidden" 
        direction="vertical"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  row: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['action'])

// 处理操作点击
const handleAction = async (action) => {
  if (action.confirm) {
    try {
      await ElMessageBox.confirm(
        action.confirmMessage || '确定执行此操作?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: action.confirmType || 'warning'
        }
      )
    } catch {
      return
    }
  }
  
  emit('action', { type: action.type, row: props.row })
}
</script>

<style lang="less" scoped>
.table-actions {
  display: flex;
  align-items: center;
  white-space: nowrap;
  
  .el-button {
    padding: 4px 8px;
    
    .el-icon {
      margin-right: 4px;
    }
  }
  
  .el-divider {
    margin: 0 4px;
  }
}
</style> 