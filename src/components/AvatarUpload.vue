<template>
  <div class="avatar-upload">
    <el-upload
      class="avatar-uploader"
      :action="uploadUrl"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :headers="headers"
    >
      <el-avatar
        v-if="modelValue"
        :size="size"
        :src="modelValue"
        :class="['avatar', className]"
      />
      <div v-else class="avatar-placeholder" :style="placeholderStyle">
        <el-icon><Plus /></el-icon>
        <span v-if="showTip" class="upload-tip">点击上传头像</span>
      </div>
      
      <template #tip>
        <div v-if="showTip" class="upload-tip">
          支持 JPG、PNG 格式，大小不超过 2MB
        </div>
      </template>
    </el-upload>
    
    <!-- 图片裁剪对话框 -->
    <el-dialog
      v-model="cropperVisible"
      title="图片裁剪"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="cropper-container">
        <vue-cropper
          ref="cropperRef"
          :src="cropperImage"
          :aspect-ratio="1"
          :view-mode="1"
          :auto-crop-area="0.8"
          :background="true"
          :movable="true"
          :zoomable="true"
          :center="true"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cropperVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCrop">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  size: {
    type: [Number, String],
    default: 100
  },
  showTip: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: ''
  },
  uploadUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'error'])

// 上传相关
const headers = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }

  // 显示裁剪对话框
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (e) => {
    cropperImage.value = e.target.result
    cropperVisible.value = true
  }
  
  return false
}

const handleSuccess = (res) => {
  emit('update:modelValue', res.url)
  emit('success', res)
  ElMessage.success('头像上传成功')
}

const handleError = (err) => {
  emit('error', err)
  ElMessage.error('头像上传失败')
}

// 裁剪相关
const cropperVisible = ref(false)
const cropperImage = ref('')
const cropperRef = ref(null)

const handleCrop = () => {
  if (!cropperRef.value) return
  
  cropperRef.value.getCropBlob((blob) => {
    const formData = new FormData()
    formData.append('file', blob, 'avatar.png')
    
    // 手动上传裁剪后的图片
    fetch(props.uploadUrl, {
      method: 'POST',
      headers: headers.value,
      body: formData
    })
      .then(res => res.json())
      .then(res => {
        handleSuccess(res)
        cropperVisible.value = false
      })
      .catch(err => {
        handleError(err)
        cropperVisible.value = false
      })
  })
}

// 样式相关
const placeholderStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  lineHeight: `${props.size}px`
}))
</script>

<style lang="less" scoped>
.avatar-upload {
  display: inline-block;
  
  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration);
      
      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }
  
  .avatar-placeholder {
    text-align: center;
    background-color: var(--el-fill-color-lighter);
    border-radius: 50%;
    color: var(--el-text-color-secondary);
    
    .el-icon {
      font-size: 24px;
      line-height: 1;
      vertical-align: middle;
    }
    
    .upload-tip {
      display: block;
      font-size: 12px;
      margin-top: 4px;
    }
  }
  
  .upload-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px;
  }
}

.cropper-container {
  height: 400px;
  
  :deep(.vue-cropper) {
    height: 100%;
  }
}
</style> 