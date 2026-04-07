<template>
  <div class="layout-container">
    <el-header class="header">
      <div class="header-left">
        <div class="logo">医疗智能客服 管理系统</div>
      </div>
      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            管理员
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <el-container class="main-container">
      <el-aside :width="appStore.sidebarCollapsed ? '64px' : '200px'" class="aside">
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapsed"
          :collapse-transition="false"
          router
          class="side-menu"
        >
          <el-menu-item index="/employee">
            <el-icon><user /></el-icon>
            <template #title>员工管理</template>
          </el-menu-item>
          
          <el-menu-item index="/user">
            <el-icon><avatar /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <el-menu-item index="/knowledge">
            <el-icon><connection /></el-icon>
            <template #title>知识图谱管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container class="content-container">
        <div class="collapse-btn" @click="appStore.toggleSidebar">
          <el-icon>
            <component :is="appStore.sidebarCollapsed ? 'expand' : 'fold'" />
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store'

const route = useRoute()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #409EFF;
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
}

.user-info {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
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
