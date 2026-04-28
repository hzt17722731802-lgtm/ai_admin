import request from '@/utils/serviceRequest'

export function login(data) {
  return request({
    url: '/service/login',
    method: 'post',
    data
  })
}

export function getCurrentUser() {
  return request({
    url: '/service/current',
    method: 'get'
  })
}

export function getPerformance() {
  return request({
    url: '/service/performance',
    method: 'get'
  })
}

export function getChatSessions(params) {
  return request({
    url: '/service/chat/sessions',
    method: 'get',
    params
  })
}

export function getChatMessages(sessionId, params) {
  return request({
    url: `/service/chat/messages/${sessionId}`,
    method: 'get',
    params
  })
}

export function sendAiMessage(data) {
  return request({
    url: '/service/ai/chat',
    method: 'post',
    data
  })
}
