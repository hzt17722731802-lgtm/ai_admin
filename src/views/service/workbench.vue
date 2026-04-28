<template>
  <div class="workbench-container">
    <div class="welcome-card">
      <h1>欢迎回来，{{ userInfo.name }}</h1>
      <p class="subtitle">工号：{{ userInfo.employeeNo }} | 部门：{{ userInfo.department }}</p>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon performance">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ performanceData.performanceScore || 0 }}</div>
              <div class="stat-label">绩效分数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon orders">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ performanceData.completedOrders || 0 }}</div>
              <div class="stat-label">完成对话数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rating">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ performanceData.averageRating || 0 }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="工号">{{ userInfo.employeeNo }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ userInfo.department }}</el-descriptions-item>
            <el-descriptions-item label="职位">{{ userInfo.position }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ userInfo.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/service/performance')">
              <el-icon><TrendCharts /></el-icon>
              查看绩效详情
            </el-button>
            <el-button type="success" @click="$router.push('/service/chats')">
              <el-icon><ChatDotRound /></el-icon>
              查看聊天记录
            </el-button>
            <el-button type="warning" @click="$router.push('/service/ai-chat')">
              <el-icon><Cpu /></el-icon>
              AI 对话
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPerformance } from '@/api/service'
import { ElMessage } from 'element-plus'

const userInfo = reactive({
  name: '',
  employeeNo: '',
  department: '',
  position: '',
  phone: '',
  email: ''
})

const performanceData = ref({
  performanceScore: 0,
  completedOrders: 0,
  averageRating: 0
})

onMounted(async () => {
  const userStr = localStorage.getItem('service_user')
  if (userStr) {
    const user = JSON.parse(userStr)
    userInfo.name = user.name
    userInfo.employeeNo = user.employeeNo
    userInfo.department = user.department
    userInfo.position = user.position
    userInfo.phone = user.phone
    userInfo.email = user.email
  }
  
  try {
    const res = await getPerformance()
    performanceData.value = res.data
  } catch (error) {
    ElMessage.error('加载绩效数据失败')
  }
})
</script>

<style scoped>
.workbench-container {
  padding: 0;
}

.welcome-card {
  background: linear-gradient(135deg, #67C23A 0%, #529b2e 100%);
  color: #fff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.welcome-card h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-icon.performance {
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #E6A23C 0%, #c9882e 100%);
}

.stat-icon.rating {
  background: linear-gradient(135deg, #F56C6C 0%, #d95555 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.content-row {
  margin-bottom: 20px;
}

.info-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.quick-actions {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 25px;
  padding: 25px;
}

.quick-actions .el-button {
  width: 130px;
  height: 130px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  filter: saturate(0.7) brightness(1.1);
}
</style>
