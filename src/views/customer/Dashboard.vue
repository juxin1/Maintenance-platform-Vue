<template>
  <div class="customer-dashboard">
    <!-- 统计卡片区 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="8" :md="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>维修订单</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="number">{{ stats.totalOrders }}</div>
            <div class="label">累计订单数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Timer /></el-icon>
              <span>进行中</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="number">{{ stats.processingOrders }}</div>
            <div class="label">维修中订单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Check /></el-icon>
              <span>已完成</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="number">{{ stats.completedOrders }}</div>
            <div class="label">完成订单数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Money /></el-icon>
              <span>总支出</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="number">¥{{ stats.totalSpent }}</div>
            <div class="label">维修费用</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作区 -->
    <el-card class="quick-actions">
      <template #header>
        <div class="card-header">
          <h3>快捷操作</h3>
        </div>
      </template>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreateOrder">
          <el-icon><Plus /></el-icon>发起维修
        </el-button>
        <el-button type="success" @click="handleTrackOrder">
          <el-icon><Search /></el-icon>订单追踪
        </el-button>
        <el-button type="warning" @click="handleFeedback">
          <el-icon><ChatDotRound /></el-icon>问题反馈
        </el-button>
        <el-button type="info" @click="handleHelp">
          <el-icon><QuestionFilled /></el-icon>使用帮助
        </el-button>
      </div>
    </el-card>

    <!-- 最近订单 -->
    <el-card class="recent-orders">
      <template #header>
        <div class="card-header">
          <h3>最近订单</h3>
          <el-button type="primary" link @click="viewAllOrders">
            查看全部<el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="orderId" label="订单号" width="120" />
        <el-table-column prop="deviceType" label="设备类型" width="120" />
        <el-table-column prop="problem" label="故障描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 维修进度追踪 -->
    <el-card class="repair-progress" v-if="currentRepair">
      <template #header>
        <div class="card-header">
          <h3>当前维修进度</h3>
          <el-tag type="warning">进行中</el-tag>
        </div>
      </template>
      <el-steps :active="currentRepair.step" finish-status="success">
        <el-step title="提交订单" description="2024-03-19 10:00" />
        <el-step title="接单处理" description="2024-03-19 10:30" />
        <el-step title="维修中" description="预计2小时" />
        <el-step title="维修完成" />
      </el-steps>
      <div class="progress-detail">
        <p class="engineer-info">
          <el-icon><User /></el-icon>维修工程师：{{ currentRepair.engineerName }}
        </p>
        <p class="estimate-info">
          <el-icon><Timer /></el-icon>预计完成时间：{{ currentRepair.estimatedTime }}
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 统计数据
const stats = ref({
  totalOrders: 12,
  processingOrders: 2,
  completedOrders: 9,
  totalSpent: '2,380.00'
})

// 最近订单
const recentOrders = ref([
  {
    orderId: 'ORD20240319001',
    deviceType: '笔记本电脑',
    problem: '无法开机，按电源键无反应',
    status: 'processing',
    createTime: '2024-03-19 10:00:00'
  }
])

// 当前维修信息
const currentRepair = ref({
  step: 2,
  engineerName: '张工',
  estimatedTime: '2024-03-19 12:30'
})

// 处理函数
const handleCreateOrder = () => {
  router.push('/customer/orders')
}

const handleTrackOrder = () => {
  router.push('/customer/orders')
}

const handleFeedback = () => {
  // 实现反馈功能
}

const handleHelp = () => {
  // 实现帮助功能
}

const viewAllOrders = () => {
  router.push('/customer/orders')
}

const handleDetail = (order) => {
  // 查看订单详情
}

// 工具函数
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
</script>

<style lang="less" scoped>
.customer-dashboard {
  .stat-cards {
    margin-bottom: 20px;
    
    .stat-card {
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--el-text-color-regular);
        
        .el-icon {
          font-size: 16px;
        }
      }
      
      .stat-content {
        text-align: center;
        padding: 12px 0;
        
        .number {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-color-primary);
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
  
  .quick-actions {
    margin-bottom: 20px;
    
    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  }
  
  .recent-orders {
    margin-bottom: 20px;
  }
  
  .repair-progress {
    .progress-detail {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--el-border-color-lighter);
      
      p {
        margin: 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--el-text-color-regular);
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .customer-dashboard {
    .stat-cards {
      .el-col {
        margin-bottom: 20px;
      }
    }
    
    .quick-actions {
      .action-buttons {
        flex-direction: column;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style> 