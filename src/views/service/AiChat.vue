<template>
  <div class="ai-chat-container">
    <el-card class="chat-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><Cpu /></el-icon> AI 智能助手</span>
          <el-button @click="handleNewChat" icon="Plus">新建对话</el-button>
        </div>
      </template>
      
      <div class="chat-content">
        <div ref="messageContainer" class="messages-container">
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
            <el-button 
              type="primary" 
              @click="handleSendMessage" 
              :loading="loading" 
              :disabled="!inputText.trim()"
            >
              {{ loading ? '思考中...' : '发送' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Avatar, Service, Plus, Cpu } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import { sendAiMessage } from '@/api/service'

const md = new MarkdownIt()

const messages = ref([])
const inputText = ref('')
const loading = ref(false)
const messageContainer = ref(null)
const currentChatId = ref(null)

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const renderMarkdown = (content) => {
  if (!content) return ''
  return md.render(content)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const handleNewChat = () => {
  currentChatId.value = null
  messages.value = []
  inputText.value = ''
}

const handleClearMessages = () => {
  messages.value = []
  inputText.value = ''
  ElMessage.success('对话已清空')
}

const handleSendMessage = async () => {
  if (!inputText.value.trim() || loading.value) return

  const prompt = inputText.value.trim()
  inputText.value = ''

  const userMessage = {
    role: 'user',
    content: prompt,
    createTime: new Date().toISOString()
  }
  messages.value.push(userMessage)
  await scrollToBottom()

  loading.value = true

  try {
    const response = await sendAiMessage({ 
      prompt,
      chatId: currentChatId.value 
    })
    
    const aiMessage = {
      role: 'assistant',
      content: response.data.content || response.data.message || 'AI 回复内容',
      createTime: new Date().toISOString()
    }
    messages.value.push(aiMessage)
    
    if (!currentChatId.value && response.data.chatId) {
      currentChatId.value = response.data.chatId
    }
    
    await scrollToBottom()
  } catch (error) {
    console.error('对话失败:', error)
    ElMessage.error('发送失败，请重试')
    if (messages.value[messages.value.length - 1]?.role === 'assistant') {
      messages.value.pop()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.ai-chat-container {
  padding: 0;
  height: calc(100vh - 140px);
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
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
  max-width: 1000px;
  margin: 0 auto;
}

.message {
  display: flex;
  margin-bottom: 20px;
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
  max-width: 80%;
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

.input-area {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.input-area .el-textarea {
  margin-bottom: 16px;
}

.input-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
