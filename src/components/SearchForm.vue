<template>
  <el-form :inline="true" :model="formData" class="search-form">
    <template v-for="item in fields" :key="item.prop">
      <!-- 输入框 -->
      <el-form-item 
        v-if="item.type === 'input'" 
        :label="item.label"
      >
        <el-input 
          v-model="formData[item.prop]"
          :placeholder="item.placeholder || `请输入${item.label}`"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <!-- 选择器 -->
      <el-form-item 
        v-else-if="item.type === 'select'" 
        :label="item.label"
      >
        <el-select 
          v-model="formData[item.prop]"
          :placeholder="item.placeholder || `请选择${item.label}`"
          clearable
        >
          <el-option
            v-for="option in item.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <!-- 日期选择器 -->
      <el-form-item 
        v-else-if="item.type === 'date'" 
        :label="item.label"
      >
        <el-date-picker
          v-model="formData[item.prop]"
          :type="item.dateType || 'date'"
          :placeholder="item.placeholder"
          :start-placeholder="item.startPlaceholder"
          :end-placeholder="item.endPlaceholder"
          :value-format="item.valueFormat"
          clearable
        />
      </el-form-item>
    </template>

    <!-- 操作按钮 -->
    <el-form-item>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>重置
      </el-button>
      <slot name="extra-buttons"></slot>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  fields: {
    type: Array,
    required: true
  },
  initialValues: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['search', 'reset'])

// 表单数据
const formData = ref({ ...props.initialValues })

// 监听初始值变化
watch(
  () => props.initialValues,
  (newVal) => {
    formData.value = { ...newVal }
  }
)

// 搜索
const handleSearch = () => {
  emit('search', formData.value)
}

// 重置
const handleReset = () => {
  formData.value = { ...props.initialValues }
  emit('reset')
}
</script>

<style lang="less" scoped>
.search-form {
  margin-bottom: 20px;
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
    
    &:last-child {
      margin-right: 0;
    }
  }
  
  .el-button {
    margin-left: 8px;
    
    &:first-child {
      margin-left: 0;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .search-form {
    :deep(.el-form-item) {
      margin-right: 0;
      display: flex;
      
      .el-form-item__content {
        flex: 1;
        margin-left: 0 !important;
        
        .el-input,
        .el-select,
        .el-date-editor {
          width: 100%;
        }
      }
    }
  }
}
</style> 