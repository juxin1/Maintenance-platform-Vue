<template>
  <div class="customer-profile">
    <!-- 基本信息卡片 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h3>个人资料</h3>
          <el-button type="primary" @click="handleEdit" v-if="!isEditing">
            <el-icon><Edit /></el-icon>编辑资料
          </el-button>
          <div v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveProfile">保存</el-button>
          </div>
        </div>
      </template>

      <div class="profile-content">
        <div class="avatar-section">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
          >
            <el-avatar 
              :size="100" 
              :src="userInfo.avatar || ''" 
              v-if="userInfo.avatar"
            />
            <el-icon v-else class="avatar-placeholder"><Plus /></el-icon>
          </el-upload>
          <p class="upload-tip">点击上传头像</p>
        </div>

        <el-form 
          ref="formRef"
          :model="userInfo"
          :rules="formRules"
          :disabled="!isEditing"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userInfo.username" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="userInfo.nickname" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="userInfo.phone" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="userInfo.email" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="地址" prop="address">
            <el-input v-model="userInfo.address" />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 账号安全卡片 -->
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <h3>账号安全</h3>
        </div>
      </template>

      <div class="security-items">
        <div class="security-item">
          <div class="item-info">
            <h4>登录密码</h4>
            <p>建议定期更改密码，提高账号安全性</p>
          </div>
          <el-button link type="primary" @click="handleChangePassword">
            修改密码
          </el-button>
        </div>
        
        <div class="security-item">
          <div class="item-info">
            <h4>手机绑定</h4>
            <p>已绑定：{{ userInfo.phone }}</p>
          </div>
          <el-button link type="primary" @click="handleChangePhone">
            更换手机
          </el-button>
        </div>
        
        <div class="security-item">
          <div class="item-info">
            <h4>邮箱绑定</h4>
            <p>{{ userInfo.email ? `已绑定：${userInfo.email}` : '未绑定邮箱' }}</p>
          </div>
          <el-button link type="primary" @click="handleChangeEmail">
            {{ userInfo.email ? '更换邮箱' : '绑定邮箱' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form 
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordChange">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 用户信息
const userInfo = ref({
  username: 'customer001',
  nickname: '张三',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  address: '北京市朝阳区xxx街道xxx号',
  avatar: ''
})

// 编辑状态
const isEditing = ref(false)
const formRef = ref(null)

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 头像上传
const beforeAvatarUpload = (file) => {
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
  return true
}

const handleAvatarSuccess = (res) => {
  userInfo.value.avatar = res.url
  ElMessage.success('头像上传成功')
}

// 编辑相关
const handleEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  // 重置表单
  formRef.value?.resetFields()
}

const saveProfile = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // 调用更新资料 API
      ElMessage.success('资料更新成功')
      isEditing.value = false
    }
  })
}

// 密码修改相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (passwordForm.value.confirmPassword !== '') {
      passwordFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const handleChangePassword = () => {
  passwordDialogVisible.value = true
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 调用修改密码 API
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
    }
  })
}

// 其他安全设置
const handleChangePhone = () => {
  ElMessage.info('更换手机号功能开发中')
}

const handleChangeEmail = () => {
  ElMessage.info('更换邮箱功能开发中')
}
</script>

<style lang="less" scoped>
.customer-profile {
  .profile-card,
  .security-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
      }
    }
  }
  
  .profile-content {
    .avatar-section {
      text-align: center;
      margin-bottom: 30px;
      
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
        
        .avatar-placeholder {
          font-size: 28px;
          color: #8c939d;
          width: 100px;
          height: 100px;
          line-height: 100px;
          text-align: center;
        }
      }
      
      .upload-tip {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 8px;
      }
    }
  }
  
  .security-items {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      
      &:first-child {
        padding-top: 0;
      }
      
      .item-info {
        h4 {
          margin: 0 0 8px;
          font-size: 16px;
          color: var(--el-text-color-primary);
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .customer-profile {
    .el-row {
      margin: 0 !important;
    }
    
    .el-col {
      padding: 0 !important;
    }
  }
}
</style> 