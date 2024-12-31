<template>
  <div 
    v-loading="loading"
    :element-loading-text="text"
    :element-loading-spinner="spinner"
    :element-loading-background="background"
    class="loading-container"
  >
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '加载中...'
  },
  spinner: {
    type: String,
    default: 'el-icon-loading'
  },
  background: {
    type: String,
    default: 'rgba(255, 255, 255, 0.9)'
  }
})
</script>

<style lang="less" scoped>
.loading-container {
  width: 100%;
  min-height: 200px;
  position: relative;
}
</style> 