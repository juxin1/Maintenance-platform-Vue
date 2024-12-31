<template>
  <div class="order-management">
    <!-- 搜索和操作栏 -->
    <div class="action-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="客户名">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
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
        <el-icon><Download /></el-icon>导出订单
      </el-button>
    </div>

    <!-- 订单列表 -->
    <el-card class="order-table">
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        style="width: 100%"
      >
        <el-table-column prop="orderId" label="订单号" width="120" />
        <el-table-column prop="customerName" label="客户名" width="120" />
        <el-table-column prop="description" label="维修描述" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            ¥{{ row.amount.toFixed(2) }}
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
        <el-table-column prop="engineerName" label="维修工程师" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="row.status === 'pending'"
              @click="handleAssign(row)"
            >
              <el-icon><UserFilled /></el-icon>分配
            </el-button>
            <el-button 
              type="danger" 
              link 
              v-if="row.status === 'pending'"
              @click="handleCancel(row)"
            >
              <el-icon><Close /></el-icon>取消
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderId }}</el-descriptions-item>
        <el-descriptions-item label="客户名">{{ currentOrder.customerName }}</el-descriptions-item>
        <el-descriptions-item label="维修描述">{{ currentOrder.description }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentOrder?.amount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ getStatusLabel(currentOrder.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="维修工程师">{{ currentOrder.engineerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 进度时间线 -->
      <div class="progress-timeline">
        <h4>订单进度</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(progress, index) in currentOrder.progress"
            :key="index"
            :type="progress.type"
            :timestamp="progress.time"
          >
            {{ progress.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 分配工程师对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配工程师"
      width="500px"
    >
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="选择工程师">
          <el-select v-model="assignForm.engineerId" placeholder="请选择工程师">
            <el-option
              v-for="engineer in engineerList"
              :key="engineer.id"
              :label="engineer.name"
              :value="engineer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="assignForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssign">确定</el-button>
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
  orderId: '',
  customerName: '',
  status: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const orderList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const detailDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const currentOrder = ref({})
const assignForm = reactive({
  engineerId: '',
  remark: ''
})

// 工程师列表
const engineerList = ref([
  { id: 1, name: '张工' },
  { id: 2, name: '李工' },
  { id: 3, name: '王工' }
])

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const labels = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return labels[status] || '未知状态'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOrderList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.orderId = ''
  searchForm.customerName = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 查看详情
const handleDetail = (row) => {
  currentOrder.value = {
    ...row,
    progress: [
      { time: '2024-03-19 10:00', content: '订单创建', type: 'primary' },
      { time: '2024-03-19 10:30', content: '分配工程师', type: 'success' },
      { time: '2024-03-19 14:00', content: '开始维修', type: 'warning' },
      { time: '2024-03-19 16:00', content: '维修完成', type: 'success' }
    ]
  }
  detailDialogVisible.value = true
}

// 分配工程师
const handleAssign = (row) => {
  currentOrder.value = row
  assignDialogVisible.value = true
}

// 提交分配
const submitAssign = async () => {
  if (!assignForm.engineerId) {
    ElMessage.warning('请选择工程师')
    return
  }
  
  try {
    // 调用分配 API
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    fetchOrderList()
  } catch (error) {
    ElMessage.error('分配失败')
  }
}

// 取消订单
const handleCancel = (row) => {
  ElMessageBox.confirm(
    `确定要取消订单 ${row.orderId} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 调用取消订单 API
    ElMessage.success('订单已取消')
    fetchOrderList()
  })
}

// 导出订单
const handleExport = () => {
  ElMessage.success('订单导出成功')
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchOrderList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrderList()
}

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    // 调用获取订单列表 API
    // const res = await getOrderList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   ...searchForm
    // })
    // orderList.value = res.data.list
    // total.value = res.data.total

    // 模拟数据
    orderList.value = [
      {
        orderId: 'ORD20240319001',
        customerName: '张三',
        description: '电脑无法开机',
        amount: 299.99,
        status: 'pending',
        createTime: '2024-03-19 10:00:00',
        engineerName: '-',
        phone: '13800138000',
        remark: '客户要求当天完成'
      }
    ]
    total.value = 1
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style lang="less" scoped>
.order-management {
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .search-form {
      flex: 1;
    }
  }
  
  .order-table {
    margin-bottom: 20px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .progress-timeline {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-light);
    
    h4 {
      margin-bottom: 16px;
      color: var(--el-text-color-primary);
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .order-management {
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