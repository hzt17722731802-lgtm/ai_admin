<template>
  <div class="chat-page">
    <!-- 左侧会话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>会话列表</h3>
        <el-button type="primary" size="small" @click="handleNewChat" icon="Plus">新建会话</el-button>
      </div>
      <div class="chat-list">
        <div
          v-for="chatId in chatIdList"
          :key="chatId"
          :class="['chat-item', { active: currentChatId === chatId }]"
          @click="handleSelectChat(chatId)"
        >
          <el-icon><ChatDotRound /></el-icon>
          <span class="chat-id">{{ formatChatId(chatId) }}</span>
        </div>
        <el-empty v-if="chatIdList.length === 0" description="暂无会话" :image-size="80" />
      </div>
    </div>

    <!-- 主对话区 -->
    <div class="main-chat">
      <!-- 消息展示区 -->
      <div ref="messageContainer" class="message-container">
        <div v-if="messages.length === 0" class="empty-chat">
          <el-empty description="开始和 AI 对话吧" />
        </div>
        <div v-else class="message-list">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.role]"
          >
            <div class="message-header">
              <span class="role-label">
                <el-icon v-if="msg.role === 'user'"><Avatar /></el-icon>
                <el-icon v-else><Service /></el-icon>
                {{ msg.role === 'user' ? '我' : 'AI 助手' }}
              </span>
              <span class="time">{{ formatTime(msg.createTime) }}</span>
            </div>
            <div class="message-content">{{ msg.content }}</div>
          </div>
          <div v-if="loading" class="message assistant">
            <div class="message-header">
              <span class="role-label">
                <el-icon><Service /></el-icon>
                AI 助手
              </span>
            </div>
            <div class="message-content">
              <el-tag type="info" size="small">思考中...</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="input-area">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题，按 Enter 发送，Shift+Enter 换行"
          :disabled="loading"
          @keydown.enter.exact.prevent="handleSendMessage"
        />
        <div class="input-buttons">
          <el-button @click="handleClearMessages" :disabled="loading">清空对话</el-button>
          <el-button type="primary" @click="handleSendMessage" :loading="loading" :disabled="!inputText.trim()">
            {{ loading ? '思考中...' : '发送' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Avatar, Service, Plus } from '@element-plus/icons-vue'
import { chat, getChatHistoryList, getChatMessages } from '@/api/chat'

// 响应式数据
const chatIdList = ref([])
const messages = ref([])
const currentChatId = ref(null)
const inputText = ref('')
const loading = ref(false)
const messageContainer = ref(null)

// 格式化会话 ID 显示
const formatChatId = (chatId) => {
  if (!chatId) return ''
  return chatId.length > 20 ? chatId.substring(0, 20) + '...' : chatId
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 加载会话列表
const loadChatHistory = async () => {
  try {
    const result = await getChatHistoryList('chat')
    chatIdList.value = result.data || []
  } catch (error) {
    console.error('加载会话列表失败:', error)
  }
}

// 加载对话历史消息
const loadChatMessages = async (chatId) => {
  try {
    const result = await getChatMessages('chat', chatId)
    messages.value = result.data || []
    await scrollToBottom()
  } catch (error) {
    console.error('加载消息失败:', error)
    ElMessage.error('加载对话历史失败')
  }
}

// 选择会话
const handleSelectChat = async (chatId) => {
  currentChatId.value = chatId
  await loadChatMessages(chatId)
}

// 新建会话
const handleNewChat = () => {
  currentChatId.value = null
  messages.value = []
  inputText.value = ''
}

// 清空对话
const handleClearMessages = () => {
  messages.value = []
  inputText.value = ''
  ElMessage.success('对话已清空')
}

// 发送消息
const handleSendMessage = async () => {
  if (!inputText.value.trim() || loading.value) return

  const prompt = inputText.value.trim()
  inputText.value = ''

  // 添加用户消息
  const userMessage = {
    role: 'user',
    content: prompt,
    createTime: new Date().toISOString()
  }
  messages.value.push(userMessage)
  await scrollToBottom()

  loading.value = true

  try {
    // 流式请求
    const response = await fetch(`/ai/chat?prompt=${encodeURIComponent(prompt)}${currentChatId.value ? `&chatId=${currentChatId.value}` : ''}`)

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let fullResponse = ''

    // 创建 AI 消息占位
    const aiMessage = {
      role: 'assistant',
      content: '',
      createTime: new Date().toISOString()
    }
    messages.value.push(aiMessage)

    // 读取流式数据
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullResponse += chunk
      aiMessage.content = fullResponse

      await scrollToBottom()
    }

    // 如果没有会话 ID，使用 prompt 作为会话 ID
    if (!currentChatId.value) {
      currentChatId.value = prompt
      // 刷新会话列表
      await loadChatHistory()
    }

  } catch (error) {
    console.error('对话失败:', error)
    ElMessage.error('发送失败，请重试')
    // 移除失败的消息
    messages.value.pop()
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadChatHistory()
})
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

/* 左侧边栏 */
.sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
}

.chat-item:hover {
  background: #f5f7fa;
}

.chat-item.active {
  background: #ecf5ff;
  color: #409EFF;
}

.chat-item .el-icon {
  margin-right: 10px;
  font-size: 18px;
}

.chat-id {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

/* 主对话区 */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.message-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.empty-chat {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-list {
  max-width: 900px;
  margin: 0 auto;
}

.message {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  background: #e3f2fd;
  margin-left: 60px;
}

.message.assistant {
  background: #fff;
  margin-right: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.role-label {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.role-label .el-icon {
  margin-right: 6px;
  font-size: 18px;
}

.time {
  font-size: 12px;
  color: #999;
}

.message-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
  font-size: 14px;
}

/* 输入区 */
.input-area {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.input-area .el-textarea {
  margin-bottom: 10px;
}

.input-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 滚动条样式 */
.message-container::-webkit-scrollbar,
.chat-list::-webkit-scrollbar {
  width: 6px;
}

.message-container::-webkit-scrollbar-thumb,
.chat-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.message-container::-webkit-scrollbar-thumb:hover,
.chat-list::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
