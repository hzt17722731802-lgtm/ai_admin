import request from '@/utils/request'

export const employeeAPI = {
  fetchEmployees(pageNum = 1, pageSize = 10, params = {}) {
    return request.get('/employee/page', {
      params: {
        pageNum,
        pageSize,
        ...params
      }
    })
  },

  getEmployeeById(id) {
    return request.get(`/employee/${id}`)
  },

  addEmployee(data) {
    return request.post('/employee', data)
  },

  updateEmployee(data) {
    return request.put('/employee', data)
  },

  deleteEmployee(id) {
    return request.delete(`/employee/${id}`)
  },

  updatePerformance(id, performanceData) {
    return request.put(`/employee/${id}/performance`, null, {
      params: performanceData
    })
  },

  getStatistics() {
    return request.get('/employee/statistics')
  }
}
