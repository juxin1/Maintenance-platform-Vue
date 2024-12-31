<template>
  <div class="receptionist-dashboard">
    <!-- 快捷操作区 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="action-card" shadow="hover" @click="handleCreateOrder">
          <el-icon size="24"><Plus /></el-icon>
          <h3>创建订单</h3>
          <p>为客户创建新的维修订单</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="action-card" shadow="hover" @click="handleCustomerQuery">
          <el-icon size="24"><Search /></el-icon>
          <h3>客户查询</h3>
          <p>查询客户信息和维修历史</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="action-card" shadow="hover" @click="handleDeviceCheck">
          <el-icon size="24"><Monitor /></el-icon>
          <h3>设备检测</h3>
          <p>快速诊断设备问题</p>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="action-card" shadow="hover" @click="handlePriceQuery">
          <el-icon size="24"><Money /></el-icon>
          <h3>价格查询</h3>
          <p>查询维修价格和配件</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待处理订单 -->
    <el-card class="pending-orders">
      <template #header>
        <div class="card-header">
          <h3>待处理订单</h3>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table :data="pendingOrders" style="width: 100%">
        <el-table-column prop="orderId" label="订单号" width="120" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="deviceType" label="设备类型" width="120" />
        <el-table-column prop="problem" label="问题描述" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleProcess(row)">
              <el-icon><Edit /></el-icon>处理
            </el-button>
            <el-button type="success" link @click="handleContact(row)">
              <el-icon><Phone /></el-icon>联系客户
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 工程师状态 -->
    <el-card class="engineer-status">
      <template #header>
        <div class="card-header">
          <h3>工程师状态</h3>
          <el-tag type="success">{{ availableCount }}/{{ totalCount }} 可用</el-tag>
        </div>
      </template>
      <el-table :data="engineerList" style="width: 100%">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="specialty" label="专长" width="150" />
        <el-table-column prop="currentTask" label="当前任务" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'available' ? 'success' : 'warning'">
              {{ row.status === 'available' ? '空闲' : '忙碌' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="estimatedTime" label="预计空闲时间" width="180" />
      </el-table>
    </el-card>

    <!-- 创建订单对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      title="创建维修订单"
      width="600px"
    >
      <el-form :model="orderForm" label-width="100px">
        <el-form-item label="客户姓名" required>
          <el-input v-model="orderForm.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="orderForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="设备类型" required>
          <el-select v-model="orderForm.deviceType" placeholder="请选择设备类型">
            <el-option label="笔记本电脑" value="laptop" />
            <el-option label="台式电脑" value="desktop" />
            <el-option label="打印机" value="printer" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" required>
          <el-input
            v-model="orderForm.problem"
            type="textarea"
            rows="4"
            placeholder="请详细描述设备问题"
          />
        </el-form-item>
        <el-form-item label="预约时间">
          <el-date-picker
            v-model="orderForm.appointmentTime"
            type="datetime"
            placeholder="请选择预约时间"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="orderForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
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

    <!-- 客户查询对话框 -->
    <el-dialog
      v-model="customerDialogVisible"
      title="客户查询"
      width="500px"
    >
      <el-form :inline="true" :model="customerQuery">
        <el-form-item label="手机号">
          <el-input v-model="customerQuery.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchCustomer">
            <el-icon><Search /></el-icon>查询
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="customerInfo" class="customer-info">
        <el-descriptions title="客户信息" :column="2" border>
          <el-descriptions-item label="姓名">{{ customerInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ customerInfo.phone }}</el-descriptions-item>
          <el-descriptions-item label="维修次数">{{ customerInfo.repairCount }}</el-descriptions-item>
          <el-descriptions-item label="最近维修">{{ customerInfo.lastRepair }}</el-descriptions-item>
        </el-descriptions>
        
        <h4>维修历史</h4>
        <el-table :data="customerInfo.history" style="width: 100%">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="device" label="设备" width="120" />
          <el-table-column prop="problem" label="问题" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                {{ row.status === 'completed' ? '已完成' : '处理中' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 待处理订单
const pendingOrders = ref([
  {
    orderId: 'ORD20240319001',
    customerName: '张三',
    deviceType: '笔记本电脑',
    problem: '无法开机，按电源键无反应',
    createTime: '2024-03-19 10:00:00'
  }
])

// 工程师状态
const engineerList = ref([
  {
    name: '张工',
    specialty: '笔记本维修',
    currentTask: '处理订单 #12345',
    status: 'busy',
    estimatedTime: '2024-03-19 14:00'
  },
  {
    name: '李工',
    specialty: '台式机维修',
    currentTask: '-',
    status: 'available',
    estimatedTime: '-'
  }
])

const availableCount = ref(1)
const totalCount = ref(2)

// 创建订单相关
const orderDialogVisible = ref(false)
const orderForm = reactive({
  customerName: '',
  phone: '',
  deviceType: '',
  problem: '',
  appointmentTime: '',
  remark: ''
})

// 客户查询相关
const customerDialogVisible = ref(false)
const customerQuery = reactive({
  phone: ''
})
const customerInfo = ref(null)

// 处理订单
const handleProcess = (row) => {
  ElMessage.success(`正在处理订单 ${row.orderId}`)
}

// 联系客户
const handleContact = (row) => {
  ElMessage.success(`正在拨打客户 ${row.customerName} 的电话`)
}

// 创建订单
const handleCreateOrder = () => {
  orderDialogVisible.value = true
}

// 提交订单
const submitOrder = async () => {
  try {
    // 调用创建订单 API
    ElMessage.success('订单创建成功')
    orderDialogVisible.value = false
  } catch (error) {
    ElMessage.error('订单创建失败')
  }
}

// 客户查询
const handleCustomerQuery = () => {
  customerDialogVisible.value = true
}

// 搜索客户
const searchCustomer = async () => {
  if (!customerQuery.phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  // 模拟客户数据
  customerInfo.value = {
    name: '张三',
    phone: customerQuery.phone,
    repairCount: 3,
    lastRepair: '2024-02-15',
    history: [
      {
        date: '2024-02-15',
        device: '笔记本电脑',
        problem: '更换硬盘',
        status: 'completed'
      }
    ]
  }
}

// 设备检测
const handleDeviceCheck = () => {
  ElMessage.info('打开设备检测工具')
}

// 价格查询
const handlePriceQuery = () => {
  ElMessage.info('打开价格查询工具')
}
</script>

<style lang="less" scoped>
.receptionist-dashboard {
  .quick-actions {
    margin-bottom: 20px;
    
    .action-card {
      height: 160px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
      }
      
      .el-icon {
        font-size: 24px;
        color: var(--el-color-primary);
        margin-bottom: 12px;
      }
      
      h3 {
        margin: 0 0 8px;
        font-size: 18px;
        color: var(--el-text-color-primary);
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .pending-orders,
  .engineer-status {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 16px;
      }
    }
  }
  
  .customer-info {
    margin-top: 20px;
    
    h4 {
      margin: 16px 0;
      color: var(--el-text-color-primary);
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .receptionist-dashboard {
    .quick-actions {
      .el-col {
        margin-bottom: 20px;
      }
    }
  }
}
</style> 