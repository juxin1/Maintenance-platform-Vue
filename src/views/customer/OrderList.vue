<template>
  <div class="customer-orders">
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreateOrder">
        <el-icon><Plus /></el-icon>发布维修订单
      </el-button>
      <el-radio-group v-model="statusFilter" size="small">
        <el-radio-button label="all">全部订单</el-radio-button>
        <el-radio-button label="pending">待处理</el-radio-button>
        <el-radio-button label="processing">维修中</el-radio-button>
        <el-radio-button label="completed">已完成</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 订单列表 -->
    <el-card v-loading="loading">
      <el-timeline>
        <el-timeline-item
          v-for="order in filteredOrders"
          :key="order.orderId"
          :type="getTimelineType(order.status)"
          :timestamp="order.createTime"
          placement="top"
        >
          <el-card class="order-card">
            <template #header>
              <div class="order-header">
                <span class="order-id">订单号：{{ order.orderId }}</span>
                <el-tag :type="getStatusType(order.status)">
                  {{ getStatusLabel(order.status) }}
                </el-tag>
              </div>
            </template>
            
            <div class="order-content">
              <div class="device-info">
                <h4>设备信息</h4>
                <p><el-icon><Monitor /></el-icon>设备类型：{{ order.deviceType }}</p>
                <p><el-icon><Warning /></el-icon>故障描述：{{ order.problem }}</p>
              </div>
              
              <div class="repair-info" v-if="order.engineerName">
                <h4>维修信息</h4>
                <p><el-icon><User /></el-icon>维修工程师：{{ order.engineerName }}</p>
                <p><el-icon><Timer /></el-icon>预计完成时间：{{ order.estimatedTime }}</p>
              </div>
              
              <div class="price-info">
                <h4>费用信息</h4>
                <p><el-icon><Money /></el-icon>预估金额：¥{{ order.estimatedPrice }}</p>
                <p v-if="order.actualPrice"><el-icon><Money /></el-icon>实际金额：¥{{ order.actualPrice }}</p>
              </div>

              <div class="progress-info" v-if="order.status === 'processing'">
                <h4>维修进度</h4>
                <el-progress 
                  :percentage="order.progress" 
                  :status="order.progress === 100 ? 'success' : ''"
                />
              </div>

              <div class="actions">
                <el-button 
                  type="primary" 
                  link 
                  @click="handleDetail(order)"
                >
                  查看详情
                </el-button>
                <el-button 
                  type="danger" 
                  link 
                  v-if="order.status === 'pending'"
                  @click="handleCancel(order)"
                >
                  取消订单
                </el-button>
                <el-button 
                  type="success" 
                  link 
                  v-if="order.status === 'completed'"
                  @click="handleComment(order)"
                >
                  评价维修
                </el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 发布订单对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      title="发布维修订单"
      width="600px"
    >
      <el-form 
        ref="orderFormRef"
        :model="orderForm"
        :rules="orderRules"
        label-width="100px"
      >
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="orderForm.deviceType" placeholder="请选择设备类型">
            <el-option label="笔记本电脑" value="laptop" />
            <el-option label="台式电脑" value="desktop" />
            <el-option label="打印机" value="printer" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述" prop="problem">
          <el-input
            v-model="orderForm.problem"
            type="textarea"
            rows="4"
            placeholder="请详细描述设备故障情况"
          />
        </el-form-item>
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker
            v-model="orderForm.appointmentTime"
            type="datetime"
            placeholder="请选择预约时间"
            :disabled-date="disabledDate"
            :disabled-time="disabledTime"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="orderForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="orderForm.remark"
            type="textarea"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="orderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitOrder">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 评价对话框 -->
    <el-dialog
      v-model="commentDialogVisible"
      title="维修评价"
      width="500px"
    >
      <el-form :model="commentForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate
            v-model="commentForm.rating"
            :texts="['很差', '较差', '一般', '较好', '很好']"
            show-text
          />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入评价内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="commentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitComment">提交评价</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态过滤
const statusFilter = ref('all')
const loading = ref(false)

// 订单列表
const orderList = ref([
  {
    orderId: 'ORD20240319001',
    deviceType: '笔记本电脑',
    problem: '无法开机，按电源键无反应',
    status: 'processing',
    createTime: '2024-03-19 10:00:00',
    engineerName: '张工',
    estimatedTime: '2024-03-19 16:00:00',
    estimatedPrice: 299,
    progress: 70,
    phone: '13800138000',
    remark: '尽快维修'
  }
])

// 过滤后的订单列表
const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return orderList.value
  return orderList.value.filter(order => order.status === statusFilter.value)
})

// 发布订单相关
const orderDialogVisible = ref(false)
const orderFormRef = ref(null)
const orderForm = ref({
  deviceType: '',
  problem: '',
  appointmentTime: '',
  phone: '',
  remark: ''
})

// 表单验证规则
const orderRules = {
  deviceType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  problem: [
    { required: true, message: '请描述故障情况', trigger: 'blur' },
    { min: 10, message: '描述不能少于10个字符', trigger: 'blur' }
  ],
  appointmentTime: [
    { required: true, message: '请选择预约时间', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 评价相关
const commentDialogVisible = ref(false)
const commentForm = ref({
  rating: 5,
  content: ''
})

// 处理函数
const handleCreateOrder = () => {
  orderDialogVisible.value = true
  orderForm.value = {
    deviceType: '',
    problem: '',
    appointmentTime: '',
    phone: '',
    remark: ''
  }
}

const submitOrder = async () => {
  if (!orderFormRef.value) return
  
  await orderFormRef.value.validate((valid, fields) => {
    if (valid) {
      // 调用创建订单 API
      ElMessage.success('订单提交成功')
      orderDialogVisible.value = false
    }
  })
}

const handleDetail = (order) => {
  ElMessage.info(`查看订单 ${order.orderId} 详情`)
}

const handleCancel = (order) => {
  ElMessageBox.confirm(
    '确定要取消该订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('订单已取消')
  })
}

const handleComment = (order) => {
  commentDialogVisible.value = true
  commentForm.value = {
    rating: 5,
    content: ''
  }
}

const submitComment = async () => {
  if (!commentForm.value.content) {
    ElMessage.warning('请输入评价内容')
    return
  }
  
  // 调用提交评价 API
  ElMessage.success('评价提交成功')
  commentDialogVisible.value = false
}

// 工具函数
const getTimelineType = (status) => {
  const types = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status]
}

const getStatusType = (status) => {
  const types = {
    pending: '',
    processing: 'warning',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status]
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    processing: '维修中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status]
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

const disabledTime = (date) => {
  return {
    hours: () => [0, 1, 2, 3, 4, 5, 6, 7, 19, 20, 21, 22, 23]
  }
}
</script>

<style lang="less" scoped>
.customer-orders {
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .order-card {
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .order-id {
        font-weight: bold;
      }
    }
    
    .order-content {
      h4 {
        margin: 16px 0 8px;
        color: var(--el-text-color-primary);
        font-size: 14px;
        
        &:first-child {
          margin-top: 0;
        }
      }
      
      p {
        margin: 8px 0;
        color: var(--el-text-color-regular);
        display: flex;
        align-items: center;
        gap: 8px;
        
        .el-icon {
          font-size: 16px;
        }
      }
      
      .progress-info {
        margin: 16px 0;
      }
      
      .actions {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--el-border-color-lighter);
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .customer-orders {
    .action-bar {
      flex-direction: column;
      gap: 12px;
      
      .el-radio-group {
        width: 100%;
        display: flex;
        
        .el-radio-button {
          flex: 1;
          
          :deep(.el-radio-button__inner) {
            width: 100%;
          }
        }
      }
    }
  }
}
</style> 