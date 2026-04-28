<template>
  <div class="performance-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>绩效详情</span>
          <el-button type="primary" @click="loadPerformance">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <div class="performance-content" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-section">
              <h3>基本信息</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="姓名">{{ performanceData.name }}</el-descriptions-item>
                <el-descriptions-item label="工号">{{ performanceData.employeeNo }}</el-descriptions-item>
                <el-descriptions-item label="部门">{{ performanceData.department }}</el-descriptions-item>
                <el-descriptions-item label="职位">{{ performanceData.position }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
          
          <el-col :span="12">
            <div class="info-section">
              <h3>绩效数据</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="绩效分数">
                  <el-tag type="success" size="large">
                    {{ performanceData.performanceScore || 0 }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="完成对话数">
                  <el-tag type="primary" size="large">
                    {{ performanceData.completedOrders || 0 }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="平均评分">
                  <el-rate
                    v-model="averageRating"
                    disabled
                    show-score
                    text-color="#ff9900"
                  />
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>
        

      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPerformance } from '@/api/service'
import { ElMessage } from 'element-plus'

const loading = ref(false)

const performanceData = reactive({
  name: '',
  employeeNo: '',
  department: '',
  position: '',
  performanceScore: 0,
  completedOrders: 0,
  averageRating: 0
})

const averageRating = ref(0)

const loadPerformance = async () => {
  loading.value = true
  try {
    const res = await getPerformance()
    const data = res.data
    performanceData.name = data.name
    performanceData.employeeNo = data.employeeNo
    performanceData.department = data.department
    performanceData.position = data.position
    performanceData.performanceScore = data.performanceScore
    performanceData.completedOrders = data.completedOrders
    performanceData.averageRating = data.averageRating
    averageRating.value = data.averageRating || 0
  } catch (error) {
    ElMessage.error('加载绩效数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPerformance()
})
</script>

<style scoped>
.performance-container {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.performance-content {
  padding: 10px;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}


</style>
