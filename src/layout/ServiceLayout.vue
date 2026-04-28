<template>
  <div class="service-layout-container">
    <el-header class="service-header">
      <div class="header-left">
        <div class="logo">医疗智能客服 工作台</div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ currentUser.name || '客服' }}</span>
        </div>
        <el-dropdown>
          <span class="dropdown-btn">
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <el-container class="main-container">
      <el-aside :width="serviceStore.sidebarCollapsed ? '64px' : '200px'" class="aside">
        <el-menu
          :default-active="activeMenu"
          :collapse="serviceStore.sidebarCollapsed"
          :collapse-transition="false"
          router
          class="side-menu"
        >
          <el-menu-item index="/service/workbench">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>工作台</template>
          </el-menu-item>
          
          <el-menu-item index="/service/performance">
            <el-icon><TrendCharts /></el-icon>
            <template #title>绩效查看</template>
          </el-menu-item>
          
          <el-menu-item index="/service/chats">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>聊天记录</template>
          </el-menu-item>
          
          <el-menu-item index="/service/ai-chat">
            <el-icon><Cpu /></el-icon>
            <template #title>AI 对话</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container class="content-container">
        <div class="collapse-btn" @click="serviceStore.toggleSidebar">
          <el-icon>
            <component :is="serviceStore.sidebarCollapsed ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentUser } from '@/api/service'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const serviceStore = reactive({
  sidebarCollapsed: false,
  toggleSidebar: () => {
    serviceStore.sidebarCollapsed = !serviceStore.sidebarCollapsed
  }
})

const currentUser = reactive({
  name: '',
  employeeNo: '',
  department: ''
})

const activeMenu = computed(() => route.path)

onMounted(async () => {
  const userStr = localStorage.getItem('service_user')
  if (userStr) {
    const user = JSON.parse(userStr)
    currentUser.name = user.name
    currentUser.employeeNo = user.employeeNo
    currentUser.department = user.department
  } else {
    try {
      const res = await getCurrentUser()
      currentUser.name = res.data.name
      currentUser.employeeNo = res.data.employeeNo
      currentUser.department = res.data.department
      localStorage.setItem('service_user', JSON.stringify(res.data))
    } catch (error) {
      ElMessage.error('获取用户信息失败')
      router.push('/service/login')
    }
  }
})

const handleLogout = () => {
  localStorage.removeItem('service_token')
  localStorage.removeItem('service_user')
  ElMessage.success('已退出登录')
  router.push('/service/login')
}
</script>

<style scoped>
.service-layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.service-header {
  background: #67C23A;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: #fff;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dropdown-btn {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.main-container {
  flex: 1;
  overflow: hidden;
}

.aside {
  background: #fff;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  transition: width 0.3s;
  overflow: hidden;
}

.side-menu {
  border-right: none;
  height: 100%;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}

.collapse-btn {
  background: #fff;
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.collapse-btn:hover {
  background: #f5f5f5;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}
</style>
