import request from '@/utils/request'

export const userAPI = {
  fetchUsers(pageNum = 1, pageSize = 10, params = {}) {
    return request.get('/user/page', {
      params: {
        pageNum,
        pageSize,
        ...params
      }
    })
  },

  getUserById(id) {
    return request.get(`/user/${id}`)
  },

  addUser(data) {
    return request.post('/user', data)
  },

  updateUser(data) {
    return request.put('/user', data)
  },

  deleteUser(id) {
    return request.delete(`/user/${id}`)
  },

  updateUserStatus(id, status) {
    return request.put(`/user/${id}/status`, null, {
      params: { status }
    })
  }
}
