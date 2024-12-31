<template>
  <div class="admin-dashboard">
    <h2>管理员控制台</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">
              <span>总用户数</span>
              <el-tag size="small">实时</el-tag>
            </div>
            <div class="stat-value">1,234</div>
            <div class="stat-footer">
              <span>较上月</span>
              <span class="trend up">
                <span>5.2%</span>
                <el-icon><CaretTop /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">
              <span>维修单数</span>
              <el-tag size="small" type="warning">待处理</el-tag>
            </div>
            <div class="stat-value">45</div>
            <div class="stat-footer">
              <span>完成率</span>
              <span class="completion-rate">85%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">
              <span>本月订单</span>
              <el-tag size="small" type="success">进行中</el-tag>
            </div>
            <div class="stat-value">89</div>
            <div class="stat-footer">
              <span>较上月</span>
              <span class="trend up">
                <span>12.5%</span>
                <el-icon><CaretTop /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-title">
              <span>本月收入</span>
              <el-tag size="small" type="info">实时</el-tag>
            </div>
            <div class="stat-value">¥45,678</div>
            <div class="stat-footer">
              <span>较上月</span>
              <span class="trend down">
                <span>2.3%</span>
                <el-icon><CaretBottom /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-container">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <h3>订单趋势</h3>
              <el-radio-group v-model="orderChartType" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-placeholder">
            订单趋势图表
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <h3>维修类型分布</h3>
              <el-select v-model="repairChartTime" size="small">
                <el-option label="最近一周" value="week" />
                <el-option label="最近一月" value="month" />
                <el-option label="最近一年" value="year" />
              </el-select>
            </div>
          </template>
          <div class="chart-placeholder">
            维修类型饼图
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-card shadow="hover" class="recent-activities">
      <template #header>
        <div class="card-header">
          <h3>最近活动</h3>
          <el-button type="primary" link>查看更多</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :type="activity.type"
          :timestamp="activity.time"
          :hollow="activity.hollow"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

// 图表类型选择
const orderChartType = ref('week')
const repairChartTime = ref('week')

// 活动列表数据
const activities = ref([
  {
    content: '新用户注册: 张三',
    time: '2024-03-20 10:30:00',
    type: 'success'
  },
  {
    content: '新维修单分配: #12345',
    time: '2024-03-20 09:15:00',
    type: 'warning'
  },
  {
    content: '订单完成: #98765',
    time: '2024-03-20 08:45:00',
    type: 'primary'
  }
])
</script>

<style lang="less" scoped>
.admin-dashboard {
  h2 {
    margin-bottom: 24px;
    font-weight: 500;
  }

  .stat-cards {
    margin-bottom: 20px;

    .stat-item {
      .stat-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 12px;
      }

      .stat-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--el-text-color-secondary);

        .trend {
          display: flex;
          align-items: center;
          gap: 4px;

          &.up {
            color: #67c23a;
          }

          &.down {
            color: #f56c6c;
          }
        }

        .completion-rate {
          color: #409eff;
        }
      }
    }
  }

  .charts-container {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .chart-placeholder {
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--el-text-color-secondary);
      border: 1px dashed var(--el-border-color);
      border-radius: 4px;
    }
  }

  .recent-activities {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}
</style> 