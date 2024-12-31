<template>
  <div class="repair-management">
    <!-- 搜索和操作栏 -->
    <div class="action-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="维修单号">
          <el-input v-model="searchForm.repairId" placeholder="请输入维修单号" clearable />
        </el-form-item>
        <el-form-item label="工程师">
          <el-select v-model="searchForm.engineerId" placeholder="请选择工程师" clearable>
            <el-option
              v-for="engineer in engineerList"
              :key="engineer.id"
              :label="engineer.name"
              :value="engineer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待接单" value="waiting" />
            <el-option label="维修中" value="repairing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
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
      
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>导出维修单
      </el-button>
    </div>

    <!-- 维修单列表 -->
    <el-card class="repair-table">
      <el-table
        v-loading="loading"
        :data="repairList"
        border
        style="width: 100%"
      >
        <el-table-column prop="repairId" label="维修单号" width="120" />
        <el-table-column prop="orderId" label="关联订单" width="120" />
        <el-table-column prop="deviceType" label="设备类型" width="120" />
        <el-table-column prop="problem" label="故障描述" show-overflow-tooltip />
        <el-table-column prop="engineerName" label="维修工程师" width="120" />
        <el-table-column prop="estimatedTime" label="预计时长" width="100">
          <template #default="{ row }">
            {{ row.estimatedTime }}小时
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
            <el-button type="primary" link @click="handleDetail(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="row.status === 'waiting'"
              @click="handleAssign(row)"
            >
              <el-icon><UserFilled /></el-icon>分配
            </el-button>
            <el-button 
              type="warning" 
              link 
              v-if="row.status === 'repairing'"
              @click="handleUpdate(row)"
            >
              <el-icon><Edit /></el-icon>更新进度
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 维修单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="维修单详情"
      width="800px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="维修单号">{{ currentRepair.repairId }}</el-descriptions-item>
            <el-descriptions-item label="关联订单">{{ currentRepair.orderId }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{ currentRepair.deviceType }}</el-descriptions-item>
            <el-descriptions-item label="故障描述">{{ currentRepair.problem }}</el-descriptions-item>
            <el-descriptions-item label="维修工程师">{{ currentRepair.engineerName }}</el-descriptions-item>
            <el-descriptions-item label="预计时长">{{ currentRepair.estimatedTime }}小时</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentRepair.status)">
                {{ getStatusLabel(currentRepair.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentRepair.createTime }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ currentRepair.remark }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        
        <el-tab-pane label="维修进度" name="progress">
          <el-timeline>
            <el-timeline-item
              v-for="(progress, index) in currentRepair.progressList"
              :key="index"
              :type="progress.type"
              :timestamp="progress.time"
              :hollow="progress.hollow"
            >
              <h4>{{ progress.title }}</h4>
              <p>{{ progress.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <el-tab-pane label="维修报告" name="report" v-if="currentRepair.status === 'completed'">
          <div class="repair-report">
            <h4>维修结果</h4>
            <p>{{ currentRepair.report?.result }}</p>
            
            <h4>使用配件</h4>
            <el-table :data="currentRepair.report?.parts" border>
              <el-table-column prop="name" label="配件名称" />
              <el-table-column prop="quantity" label="数量" width="100" />
              <el-table-column prop="price" label="单价" width="120">
                <template #default="{ row }">
                  ¥{{ row.price.toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>

            <h4>维修建议</h4>
            <p>{{ currentRepair.report?.suggestion }}</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 更新进度对话框 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="更新维修进度"
      width="500px"
    >
      <el-form :model="progressForm" label-width="100px">
        <el-form-item label="进度标题">
          <el-input v-model="progressForm.title" placeholder="请输入进度标题" />
        </el-form-item>
        <el-form-item label="进度详情">
          <el-input
            v-model="progressForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入进度详情"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  repairId: '',
  engineerId: '',
  status: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const repairList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 工程师列表
const engineerList = ref([
  { id: 1, name: '张工' },
  { id: 2, name: '李工' },
  { id: 3, name: '王工' }
])

// 对话框相关
const detailDialogVisible = ref(false)
const updateDialogVisible = ref(false)
const activeTab = ref('basic')
const currentRepair = ref({})
const progressForm = reactive({
  title: '',
  content: '',
  completed: false
})

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    waiting: 'info',
    repairing: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const labels = {
    waiting: '待接单',
    repairing: '维修中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status] || '未知状态'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchRepairList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.repairId = ''
  searchForm.engineerId = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 查看详情
const handleDetail = (row) => {
  currentRepair.value = {
    ...row,
    progressList: [
      {
        time: '2024-03-19 10:00',
        title: '创建维修单',
        content: '系统自动创建维修单',
        type: 'primary'
      },
      {
        time: '2024-03-19 10:30',
        title: '分配工程师',
        content: '分配给张工处理',
        type: 'success'
      },
      {
        time: '2024-03-19 14:00',
        title: '开始维修',
        content: '正在检查故障原因',
        type: 'warning'
      }
    ],
    report: {
      result: '更换主板后恢复正常',
      parts: [
        { name: '主板', quantity: 1, price: 1299 },
        { name: '散热器', quantity: 1, price: 199 }
      ],
      suggestion: '建议定期清理灰尘，保持通风'
    }
  }
  detailDialogVisible.value = true
}

// 更新进度
const handleUpdate = (row) => {
  currentRepair.value = row
  updateDialogVisible.value = true
  progressForm.title = ''
  progressForm.content = ''
  progressForm.completed = false
}

// 提交进度
const submitProgress = async () => {
  if (!progressForm.title || !progressForm.content) {
    ElMessage.warning('请填写完整的进度信息')
    return
  }
  
  try {
    // 调用更新进度 API
    ElMessage.success('进度更新成功')
    updateDialogVisible.value = false
    fetchRepairList()
  } catch (error) {
    ElMessage.error('进度更新失败')
  }
}

// 导出维修单
const handleExport = () => {
  ElMessage.success('维修单导出成功')
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

    // 模拟数据
    repairList.value = [
      {
        repairId: 'REP20240319001',
        orderId: 'ORD20240319001',
        deviceType: '笔记本电脑',
        problem: '无法开机，按电源键无反应',
        engineerName: '张工',
        estimatedTime: 2,
        status: 'repairing',
        createTime: '2024-03-19 10:00:00',
        remark: '客户要求当天完成'
      }
    ]
    total.value = 1
  } catch (error) {
    console.error('获取维修单列表失败:', error)
    ElMessage.error('获取维修单列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRepairList()
})
</script>

<style lang="less" scoped>
.repair-management {
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .search-form {
      flex: 1;
    }
  }
  
  .repair-table {
    margin-bottom: 20px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .repair-report {
    h4 {
      margin: 16px 0;
      color: var(--el-text-color-primary);
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    p {
      color: var(--el-text-color-regular);
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .el-table {
      margin: 16px 0;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .repair-management {
    .action-bar {
      flex-direction: column;
      gap: 10px;
      
      .search-form {
        width: 100%;
      }
    }
  }
}
</style> 