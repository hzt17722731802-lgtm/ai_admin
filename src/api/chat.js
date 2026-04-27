import axios from 'axios'

const BASE_URL = '/ai'

// 创建 axios 实例（不使用默认的 request，因为不需要 token）
const chatRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 30000 // 对话接口需要更长的超时时间
})


// AI 对话接口（流式）
export function chat(prompt, chatId = null) {
  const params = new URLSearchParams()
  params.append('prompt', prompt)
  if (chatId) {
    params.append('chatId', chatId)
  }
  return chatRequest({
    url: `/chat?${params.toString()}`,
    method: 'get',
    responseType: 'text'
  })
}

// 获取会话 ID 列表
export function getChatHistoryList(type = 'chat') {
  return chatRequest({
    url: `/history/${type}`,
    method: 'get'
  })
}

// 获取对话历史消息
export function getChatMessages(type = 'chat', chatId) {
  return chatRequest({
    url: `/history/${type}/${chatId}`,
    method: 'get'
  })
}
