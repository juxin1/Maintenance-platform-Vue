<template>
  <div class="empty-container">
    <el-empty
      :image="image"
      :image-size="size"
      :description="description"
    >
      <template #default>
        <slot>
          <el-button v-if="actionText" type="primary" @click="handleAction">
            {{ actionText }}
          </el-button>
        </slot>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
const props = defineProps({
  image: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 200
  },
  description: {
    type: String,
    default: '暂无数据'
  },
  actionText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])

const handleAction = () => {
  emit('action')
}
</script>

<style lang="less" scoped>
.empty-container {
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 