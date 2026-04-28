<template>
  <div class="chats-container">
    <el-row :gutter="20" style="height: calc(100vh - 140px);">
      <el-col :span="8">
        <el-card class="sessions-card">
          <template #header>
            <div class="card-header">
              <span>会话列表</span>
              <el-input
                v-model="searchText"
                placeholder="搜索用户..."
                prefix-icon="Search"
                clearable
                @input="handleSearch"
              />
            </div>
          </template>
          
          <div class="sessions-list" v-loading="sessionsLoading">
            <div
              v-for="session in filteredSessions"
              :key="session.id"
              :class="['session-item', { active: currentSessionId === session.id }]"
              @click="selectSession(session)"
            >
              <div class="session-avatar">
                <el-avatar :size="50" :src="session.avatar">
                  {{ session.userName?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="session-info">
                <div class="session-header">
                  <span class="session-user">{{ session.userName }}</span>
                  <span class="session-time">{{ formatTime(session.lastMessageTime) }}</span>
                </div>
                <div class="session-preview">{{ session.lastMessage }}</div>
              </div>
            </div>
            
            <el-empty v-if="filteredSessions.length === 0" description="暂无会话" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <span v-if="currentSession">
                <el-icon><User /></el-icon>
                {{ currentSession.userName }}
              </span>
              <span v-else>请选择会话</span>
            </div>
          </template>
          
          <div class="chat-content" v-loading="messagesLoading">
            <div v-if="currentSession" class="messages-container">
              <div
                v-for="message in messages"
                :key="message.id"
                :class="['message', message.senderType === 'USER' ? 'message-user' : 'message-service']"
              >
                <div class="message-avatar">
                  <el-avatar :size="40">
                    <el-icon v-if="message.senderType === 'SERVICE'"><Service /></el-icon>
                    <span v-else>{{ message.userName?.charAt(0) || 'U' }}</span>
                  </el-avatar>
                </div>
                <div class="message-body">
                  <div class="message-info">
                    <span class="message-name">{{ message.userName || '客服' }}</span>
                    <span class="message-time">{{ formatMessageTime(message.createTime) }}</span>
                  </div>
                  <div class="message-text">{{ message.content }}</div>
                </div>
              </div>
            </div>
            
            <el-empty v-else description="请选择一个会话进行查看" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getChatSessions, getChatMessages } from '@/api/service'
import { ElMessage } from 'element-plus'

const sessionsLoading = ref(false)
const messagesLoading = ref(false)
const searchText = ref('')
const sessions = ref([])
const messages = ref([])
const currentSessionId = ref(null)
const currentSession = ref(null)

const filteredSessions = computed(() => {
  if (!searchText.value) return sessions.value
  return sessions.value.filter(session =>
    session.userName?.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatMessageTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    const res = await getChatSessions()
    sessions.value = res.data || []
  } catch (error) {
    ElMessage.error('加载会话列表失败')
  } finally {
    sessionsLoading.value = false
  }
}

const selectSession = async (session) => {
  currentSessionId.value = session.id
  currentSession.value = session
  await loadMessages(session.id)
}

const loadMessages = async (sessionId) => {
  messagesLoading.value = true
  try {
    const res = await getChatMessages(sessionId)
    messages.value = res.data || []
  } catch (error) {
    ElMessage.error('加载消息记录失败')
  } finally {
    messagesLoading.value = false
  }
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
.chats-container {
  padding: 0;
  height: calc(100vh - 140px);
}

.sessions-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.sessions-list {
  height: calc(100vh - 220px);
  overflow-y: auto;
}

.session-item {
  display: flex;
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #f5f7fa;
}

.session-item.active {
  background-color: #e6f7ff;
  border-left: 3px solid #409EFF;
}

.session-avatar {
  margin-right: 12px;
}

.session-info {
  flex: 1;
  overflow: hidden;
}

.session-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.session-user {
  font-weight: bold;
  color: #303133;
}

.session-time {
  font-size: 12px;
  color: #909399;
}

.session-preview {
  font-size: 13px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
}

.message-user {
  flex-direction: row;
}

.message-service {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-body {
  max-width: 60%;
}

.message-info {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 12px;
  color: #909399;
}

.message-name {
  font-weight: bold;
}

.message-text {
  padding: 12px 15px;
  border-radius: 8px;
  background-color: #f0f2f5;
  word-wrap: break-word;
}

.message-service .message-text {
  background-color: #e6f7ff;
}
</style>
