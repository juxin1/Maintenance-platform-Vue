<template>
  <div class="engineer-dashboard">
    <!-- 工作状态卡片 -->
    <el-card class="status-card">
      <div class="status-content">
        <div class="status-info">
          <h2>{{ engineerInfo.name }}</h2>
          <p>{{ engineerInfo.specialty }}</p>
          <el-tag :type="engineerInfo.status === 'available' ? 'success' : 'warning'">
            {{ engineerInfo.status === 'available' ? '空闲' : '工作中' }}
          </el-tag>
        </div>
        <div class="status-actions">
          <el-button 
            :type="engineerInfo.status === 'available' ? 'danger' : 'success'"
            @click="toggleStatus"
          >
            {{ engineerInfo.status === 'available' ? '设为忙碌' : '设为空闲' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 今日任务统计 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-number">{{ stats.pending }}</div>
          <div class="stat-label">待处理</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-number">{{ stats.inProgress }}</div>
          <div class="stat-label">进行中</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-number">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-number">{{ stats.totalTime }}h</div>
          <div class="stat-label">工作时长</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 当前维修任务 -->
    <el-card class="current-task" v-if="currentTask">
      <template #header>
        <div class="card-header">
          <h3>当前维修任务</h3>
          <el-button type="primary" @click="handleUpdateProgress">更新进度</el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="维修单号">{{ currentTask.repairId }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentTask.deviceType }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ currentTask.problem }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentTask.startTime }}</el-descriptions-item>
        <el-descriptions-item label="预计用时">{{ currentTask.estimatedTime }}小时</el-descriptions-item>
        <el-descriptions-item label="已用时间">{{ currentTask.usedTime }}小时</el-descriptions-item>
      </el-descriptions>
      
      <div class="progress-info">
        <h4>维修进度</h4>
        <el-progress 
          :percentage="currentTask.progress" 
          :status="currentTask.progress === 100 ? 'success' : ''"
        />
      </div>
    </el-card>

    <!-- 待处理维修单 -->
    <el-card class="task-list">
      <template #header>
        <div class="card-header">
          <h3>待处理维修单</h3>
          <el-radio-group v-model="taskFilter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="pending">待处理</el-radio-button>
            <el-radio-button label="inProgress">进行中</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-table :data="filteredTasks" style="width: 100%">
        <el-table-column prop="repairId" label="维修单号" width="120" />
        <el-table-column prop="deviceType" label="设备类型" width="120" />
        <el-table-column prop="problem" label="问题描述" show-overflow-tooltip />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              v-if="row.status === 'pending'"
              @click="handleStartRepair(row)"
            >
              开始维修
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="row.status === 'inProgress'"
              @click="handleComplete(row)"
            >
              完成维修
            </el-button>
            <el-button type="info" link @click="handleDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 更新进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="更新维修进度"
      width="500px"
    >
      <el-form :model="progressForm" label-width="100px">
        <el-form-item label="当前进度">
          <el-slider
            v-model="progressForm.progress"
            :step="10"
            show-stops
          />
        </el-form-item>
        <el-form-item label="进度说明">
          <el-input
            v-model="progressForm.description"
            type="textarea"
            rows="4"
            placeholder="请输入进度说明"
          />
        </el-form-item>
        <el-form-item label="是否完成">
          <el-switch v-model="progressForm.completed" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="progressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProgress">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 工程师信息
const engineerInfo = reactive({
  name: '张工',
  specialty: '笔记本电脑维修',
  status: 'busy'
})

// 今日统计
const stats = reactive({
  pending: 3,
  inProgress: 1,
  completed: 5,
  totalTime: 8
})

// 当前任务
const currentTask = ref({
  repairId: 'REP20240319001',
  deviceType: '笔记本电脑',
  problem: '无法开机，按电源键无反应',
  startTime: '2024-03-19 10:00:00',
  estimatedTime: 2,
  usedTime: 1.5,
  progress: 70
})

// 任务列表
const taskList = ref([
  {
    repairId: 'REP20240319002',
    deviceType: '台式电脑',
    problem: '蓝屏',
    priority: 'high',
    status: 'pending'
  },
  {
    repairId: 'REP20240319003',
    deviceType: '打印机',
    problem: '卡纸',
    priority: 'medium',
    status: 'inProgress'
  }
])

// 任务筛选
const taskFilter = ref('all')
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') return taskList.value
  return taskList.value.filter(task => task.status === taskFilter.value)
})

// 更新进度相关
const progressDialogVisible = ref(false)
const progressForm = reactive({
  progress: 70,
  description: '',
  completed: false
})

// 切换工作状态
const toggleStatus = () => {
  engineerInfo.status = engineerInfo.status === 'available' ? 'busy' : 'available'
  ElMessage.success(`状态已更新为${engineerInfo.status === 'available' ? '空闲' : '忙碌'}`)
}

// 开始维修
const handleStartRepair = (row) => {
  ElMessage.success(`开始维修 ${row.repairId}`)
}

// 完成维修
const handleComplete = (row) => {
  ElMessage.success(`维修完成 ${row.repairId}`)
}

// 查看详情
const handleDetail = (row) => {
  ElMessage.info(`查看维修单 ${row.repairId} 详情`)
}

// 更新进度
const handleUpdateProgress = () => {
  progressDialogVisible.value = true
}

// 提交进度
const submitProgress = async () => {
  try {
    // 调用更新进度 API
    ElMessage.success('进度更新成功')
    progressDialogVisible.value = false
  } catch (error) {
    ElMessage.error('进度更新失败')
  }
}

// 工具函数
const getPriorityType = (priority) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority]
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: '紧急',
    medium: '普通',
    low: '低优先级'
  }
  return labels[priority]
}

const getStatusType = (status) => {
  const types = {
    pending: 'info',
    inProgress: 'warning',
    completed: 'success'
  }
  return types[status]
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    inProgress: '进行中',
    completed: '已完成'
  }
  return labels[status]
}
</script>

<style lang="less" scoped>
.engineer-dashboard {
  .status-card {
    margin-bottom: 20px;
    
    .status-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .status-info {
        h2 {
          margin: 0 0 8px;
          font-size: 24px;
        }
        
        p {
          margin: 0 0 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
  
  .stat-cards {
    margin-bottom: 20px;
    
    .stat-card {
      text-align: center;
      padding: 20px;
      
      .stat-number {
        font-size: 32px;
        font-weight: bold;
        color: var(--el-color-primary);
        line-height: 1;
        margin-bottom: 8px;
      }
      
      .stat-label {
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  .current-task {
    margin-bottom: 20px;
    
    .progress-info {
      margin-top: 20px;
      
      h4 {
        margin: 0 0 12px;
      }
    }
  }
  
  .task-list {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .engineer-dashboard {
    .stat-cards {
      .el-col {
        margin-bottom: 20px;
      }
    }
    
    .status-content {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }
  }
}
</style> 