<template>
  <div class="employee-page">
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="科室">
              <el-input v-model="searchForm.department" placeholder="请输入科室" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 100%">
                <el-option label="在职" value="ACTIVE" />
                <el-option label="离职" value="INACTIVE" />
                <el-option label="休假" value="ON_LEAVE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleAdd">添加</el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="employeeList" v-loading="loading" style="width: 100%">
        <el-table-column prop="employeeNo" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="performanceScore" label="绩效分数" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="formData.employeeNo" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="科室" prop="department">
          <el-input v-model="formData.department" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="formData.position" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="在职" value="ACTIVE" />
            <el-option label="离职" value="INACTIVE" />
            <el-option label="休假" value="ON_LEAVE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { employeeAPI } from '@/api/employee'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加员工')
const isEdit = ref(false)
const formRef = ref(null)

const searchForm = ref({
  name: '',
  department: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const employeeList = ref([])

const formData = ref({
  employeeNo: '',
  name: '',
  department: '',
  position: '',
  phone: '',
  email: '',
  status: 'ACTIVE'
})

const formRules = {
  employeeNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入科室', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const getStatusType = (status) => {
  const types = {
    ACTIVE: 'success',
    INACTIVE: 'danger',
    ON_LEAVE: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    ACTIVE: '在职',
    INACTIVE: '离职',
    ON_LEAVE: '休假'
  }
  return texts[status] || status
}

const fetchEmployees = async () => {
  loading.value = true
  try {
    const result = await employeeAPI.fetchEmployees(
      pagination.current,
      pagination.size,
      searchForm.value
    )
    employeeList.value = result.data.records
    pagination.total = result.data.total
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchEmployees()
}

const handleReset = () => {
  searchForm.value = { name: '', department: '', status: '' }
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '添加员工'
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑员工'
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该员工吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await employeeAPI.deleteEmployee(row.id)
    ElMessage.success('删除成功')
    fetchEmployees()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    if (isEdit.value) {
      await employeeAPI.updateEmployee(formData.value)
      ElMessage.success('更新成功')
    } else {
      await employeeAPI.addEmployee(formData.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchEmployees()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  formData.value = {
    employeeNo: '',
    name: '',
    department: '',
    position: '',
    phone: '',
    email: '',
    status: 'ACTIVE'
  }
}

const handleSizeChange = () => {
  fetchEmployees()
}

const handleCurrentChange = () => {
  fetchEmployees()
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.employee-page {
  padding: 0;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 500px;
}
</style>
