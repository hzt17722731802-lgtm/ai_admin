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
            <div class="message-avatar">
              <div class="avatar-circle">
                <el-icon v-if="msg.role === 'user'"><Avatar /></el-icon>
                <el-icon v-else><Service /></el-icon>
              </div>
            </div>
            <div class="message-body">
              <div class="message-header">
                <span class="role-name">{{ msg.role === 'user' ? '我' : 'AI 助手' }}</span>
                <span class="time">{{ formatTime(msg.createTime) }}</span>
              </div>
              <div class="message-bubble">
                <div v-if="msg.role === 'assistant'" class="markdown-content" v-html="renderMarkdown(msg.content)"></div>
                <div v-else class="plain-text">{{ msg.content }}</div>
              </div>
            </div>
          </div>
          <!-- 等待回复时的加载状态 -->
          <div v-if="loading && messages[messages.length - 1]?.role === 'user'" class="message assistant loading-message">
            <div class="message-avatar">
              <div class="avatar-circle">
                <el-icon><Service /></el-icon>
              </div>
            </div>
            <div class="message-body">
              <div class="message-header">
                <span class="role-name">AI 助手</span>
              </div>
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Avatar, Service, Plus } from '@element-plus/icons-vue'
import { chat, getChatHistoryList, getChatMessages } from '@/api/chat'
import MarkdownIt from 'markdown-it'

// 初始化 markdown-it
const md = new MarkdownIt()

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

// 渲染 Markdown
const renderMarkdown = (content) => {
  if (!content) return ''
  return md.render(content)
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
    let hasStartedReceiving = false

    // 读取流式数据
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullResponse += chunk
      
      // 收到第一个数据块后，创建 AI 消息
      if (!hasStartedReceiving && fullResponse.trim()) {
        hasStartedReceiving = true
        const aiMessage = {
          role: 'assistant',
          content: fullResponse,
          createTime: new Date().toISOString()
        }
        messages.value.push(aiMessage)
      } else if (hasStartedReceiving) {
        // 更新最后一条消息的内容
        const lastMessage = messages.value[messages.value.length - 1]
        if (lastMessage) {
          lastMessage.content = fullResponse
        }
      }

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
    if (messages.value[messages.value.length - 1]?.role === 'assistant') {
      messages.value.pop()
    }
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
  padding: 24px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.sidebar-header .el-button {
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  height: 44px;
}

.sidebar-header .el-button--primary {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  border: none;
}

.sidebar-header .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  border: 1px solid transparent;
}

.chat-item:hover {
  background: #f5f7fa;
  transform: translateX(4px);
}

.chat-item.active {
  background: linear-gradient(135deg, #ecf5ff 0%, #e6f0ff 100%);
  color: #409EFF;
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.chat-item .el-icon {
  margin-right: 12px;
  font-size: 20px;
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
  padding: 30px;
  background: #f5f7fa;
}

.empty-chat {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.message {
  display: flex;
  margin-bottom: 24px;
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
  flex-direction: row-reverse;
}

.message.assistant {
  flex-direction: row;
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.message.assistant .avatar-circle {
  background: #67C23A;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.message-body {
  max-width: 85%;
  display: flex;
  flex-direction: column;
}

.message.user .message-body {
  align-items: flex-end;
}

.message.assistant .message-body {
  align-items: flex-start;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.role-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.time {
  font-size: 12px;
  color: #999;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 14px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message.user .message-bubble {
  background: #409EFF;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-bubble {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
}

.plain-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.markdown-content {
  color: #333;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(p:first-child) {
  margin-top: 0;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.markdown-content :deep(pre) {
  background: #f8f8f8;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.markdown-content :deep(li) {
  margin: 4px 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #409EFF;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 12px 0 8px;
  font-weight: 600;
  line-height: 1.4;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 6px;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 4px;
}

.markdown-content :deep(h3) {
  font-size: 1.2em;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e4e7ed;
  padding: 8px 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.markdown-content :deep(a) {
  color: #409EFF;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

/* 打字动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.loading-message {
  animation: fadeIn 0.3s ease;
}

/* 输入区 */
.input-area {
  padding: 24px 30px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
}

.input-area .el-textarea {
  margin-bottom: 16px;
}

.input-area .el-textarea__inner {
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.input-area .el-textarea__inner:focus {
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  border-color: #409EFF;
}

.input-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.input-buttons .el-button {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.input-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.input-buttons .el-button:active {
  transform: translateY(0);
}

.input-buttons .el-button--primary {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.input-buttons .el-button--primary:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #409EFF 100%);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.input-buttons .el-button--primary:active {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
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
