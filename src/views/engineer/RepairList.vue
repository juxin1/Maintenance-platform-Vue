<template>
  <div class="repair-list">
    <!-- 搜索和筛选 -->
    <el-card class="filter-section">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="维修单号">
          <el-input v-model="searchForm.repairId" placeholder="请输入维修单号" clearable />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="searchForm.deviceType" placeholder="请选择设备类型" clearable>
            <el-option label="笔记本电脑" value="laptop" />
            <el-option label="台式电脑" value="desktop" />
            <el-option label="打印机" value="printer" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待接单" value="waiting" />
            <el-option label="维修中" value="repairing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 维修单列表 -->
    <el-card class="list-section">
      <template #header>
        <div class="card-header">
          <div class="left">
            <h3>维修单列表</h3>
            <el-tag type="success">共 {{ total }} 条</el-tag>
          </div>
          <div class="right">
            <el-radio-group v-model="viewType" size="small">
              <el-radio-button label="table">表格视图</el-radio-button>
              <el-radio-button label="card">卡片视图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 表格视图 -->
      <el-table
        v-if="viewType === 'table'"
        v-loading="loading"
        :data="repairList"
        border
        style="width: 100%"
      >
        <el-table-column prop="repairId" label="维修单号" width="120" />
        <el-table-column prop="deviceType" label="设备类型" width="120" />
        <el-table-column prop="problem" label="故障描述" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
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
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              v-if="row.status === 'waiting'"
              @click="handleAccept(row)"
            >
              接单
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="row.status === 'repairing'"
              @click="handleUpdate(row)"
            >
              更新进度
            </el-button>
            <el-button 
              type="warning" 
              link 
              v-if="row.status === 'repairing'"
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

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <el-row :gutter="20">
          <el-col 
            v-for="item in repairList" 
            :key="item.repairId"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card class="repair-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <span class="repair-id">{{ item.repairId }}</span>
                  <el-tag :type="getStatusType(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </el-tag>
                </div>
              </template>
              <div class="card-content">
                <p class="device-type">
                  <el-icon><Monitor /></el-icon>
                  {{ item.deviceType }}
                </p>
                <p class="problem" :title="item.problem">{{ item.problem }}</p>
                <p class="customer">
                  <el-icon><User /></el-icon>
                  {{ item.customerName }}
                </p>
                <div class="priority">
                  <el-tag :type="getPriorityType(item.priority)" size="small">
                    {{ getPriorityLabel(item.priority) }}
                  </el-tag>
                </div>
                <div class="actions">
                  <el-button 
                    type="primary" 
                    link 
                    v-if="item.status === 'waiting'"
                    @click="handleAccept(item)"
                  >
                    接单
                  </el-button>
                  <el-button 
                    type="success" 
                    link 
                    v-if="item.status === 'repairing'"
                    @click="handleUpdate(item)"
                  >
                    更新进度
                  </el-button>
                  <el-button type="info" link @click="handleDetail(item)">
                    详情
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 更新进度对话框 -->
    <el-dialog
      v-model="updateDialogVisible"
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
        <el-form-item label="预计完成">
          <el-time-picker
            v-model="progressForm.estimatedTime"
            placeholder="选择预计完成时间"
            format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="是否完成">
          <el-switch v-model="progressForm.completed" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProgress">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  repairId: '',
  deviceType: '',
  status: '',
  dateRange: []
})

// 视图类型
const viewType = ref('table')

// 列表数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const repairList = ref([
  {
    repairId: 'REP20240319001',
    deviceType: '笔记本电脑',
    problem: '无法开机，按电源键无反应',
    customerName: '张三',
    priority: 'high',
    status: 'waiting',
    createTime: '2024-03-19 10:00:00'
  },
  // 更多测试数据...
])

// 更新进度相关
const updateDialogVisible = ref(false)
const progressForm = reactive({
  progress: 0,
  description: '',
  estimatedTime: null,
  completed: false
})

// 搜索
const handleSearch = () => {
  fetchRepairList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.dateRange = []
  fetchRepairList()
}

// 接单
const handleAccept = (row) => {
  ElMessageBox.confirm(
    `确定接受维修单 ${row.repairId} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('接单成功')
    fetchRepairList()
  })
}

// 更新进度
const handleUpdate = (row) => {
  updateDialogVisible.value = true
  progressForm.progress = 0
  progressForm.description = ''
  progressForm.estimatedTime = null
  progressForm.completed = false
}

// 完成维修
const handleComplete = (row) => {
  ElMessageBox.confirm(
    `确定完成维修单 ${row.repairId} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('维修已完成')
    fetchRepairList()
  })
}

// 查看详情
const handleDetail = (row) => {
  ElMessage.info(`查看维修单 ${row.repairId} 详情`)
}

// 提交进度
const submitProgress = async () => {
  try {
    // 调用更新进度 API
    ElMessage.success('进度更新成功')
    updateDialogVisible.value = false
    fetchRepairList()
  } catch (error) {
    ElMessage.error('进度更新失败')
  }
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchRepairList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchRepairList()
}

// 获取维修单列表
const fetchRepairList = async () => {
  loading.value = true
  try {
    // 调用获取维修单列表 API
    // const res = await getRepairList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   ...searchForm
    // })
    // repairList.value = res.data.list
    // total.value = res.data.total
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    total.value = repairList.value.length
  } catch (error) {
    console.error('获取维修单列表失败:', error)
    ElMessage.error('获取维修单列表失败')
  } finally {
    loading.value = false
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
    waiting: 'info',
    repairing: 'warning',
    completed: 'success'
  }
  return types[status]
}

const getStatusLabel = (status) => {
  const labels = {
    waiting: '待接单',
    repairing: '维修中',
    completed: '已完成'
  }
  return labels[status]
}

// 初始化
fetchRepairList()
</script>

<style lang="less" scoped>
.repair-list {
  .filter-section {
    margin-bottom: 20px;
  }
  
  .list-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .left {
        display: flex;
        align-items: center;
        gap: 12px;
        
        h3 {
          margin: 0;
        }
      }
    }
  }
  
  .card-view {
    .repair-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .repair-id {
          font-weight: bold;
        }
      }
      
      .card-content {
        p {
          margin: 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          
          .el-icon {
            font-size: 16px;
          }
        }
        
        .problem {
          color: var(--el-text-color-regular);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .priority {
          margin: 12px 0;
        }
        
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--el-border-color-lighter);
        }
      }
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 