import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/admin/employee',
    children: [
      {
        path: '/admin/employee',
        name: 'Employee',
        component: () => import('@/views/employee/index.vue'),
        meta: { title: '员工管理' }
      },
      {
        path: '/admin/user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: '/admin/knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/index.vue'),
        meta: { title: '知识图谱管理' }
      }
    ]
  },
  {
    path: '/chat',
    name: 'ChatLayout',
    component: () => import('@/layout/ChatLayout.vue'),
    children: [
      {
        path: '',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
        meta: { title: 'AI 智能对话' }
      }
    ]
  },
  {
    path: '/service/login',
    name: 'ServiceLogin',
    component: () => import('@/views/service/Login.vue'),
    meta: { title: '客服登录' }
  },
  {
    path: '/service',
    name: 'ServiceLayout',
    component: () => import('@/layout/ServiceLayout.vue'),
    redirect: '/service/workbench',
    children: [
      {
        path: 'workbench',
        name: 'ServiceWorkbench',
        component: () => import('@/views/service/Workbench.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'performance',
        name: 'ServicePerformance',
        component: () => import('@/views/service/Performance.vue'),
        meta: { title: '绩效查看' }
      },
      {
        path: 'chats',
        name: 'ServiceChats',
        component: () => import('@/views/service/Chats.vue'),
        meta: { title: '聊天记录' }
      },
      {
        path: 'ai-chat',
        name: 'ServiceAiChat',
        component: () => import('@/views/service/AiChat.vue'),
        meta: { title: 'AI 对话' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
