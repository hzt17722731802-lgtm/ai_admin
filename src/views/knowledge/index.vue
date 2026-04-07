<template>
  <div class="knowledge-page">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="疾病管理" name="disease">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索疾病"
            style="width: 300px; margin-right: 10px"
            clearable
            @keyup.enter="handleSearchDisease"
          />
          <el-button type="primary" @click="handleSearchDisease">搜索</el-button>
          <el-button type="success" @click="handleAddDisease">添加疾病</el-button>
        </div>

        <el-table :data="diseaseList" v-loading="loading" style="margin-top: 20px">
          <el-table-column prop="name" label="疾病名称" width="150" />
          <el-table-column prop="desc" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="cureDepartment" label="科室" width="150">
            <template #default="{ row }">
              <el-tag v-for="(dept, index) in row.cureDepartment" :key="index" size="small" style="margin-right: 5px">
                {{ dept }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditDisease(row)">编辑</el-button>
              <el-button type="info" size="small" @click="handleViewGraph(row.name)">图谱</el-button>
              <el-button type="danger" size="small" @click="handleDeleteDisease(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="药物管理" name="drug">
        <div class="search-bar">
          <el-input
            v-model="drugKeyword"
            placeholder="搜索药物"
            style="width: 300px; margin-right: 10px"
            clearable
            @keyup.enter="handleSearchDrug"
          />
          <el-button type="primary" @click="handleSearchDrug">搜索</el-button>
          <el-button type="success" @click="handleAddDrug">添加药物</el-button>
        </div>

        <el-table :data="drugList" v-loading="loading" style="margin-top: 20px">
          <el-table-column prop="name" label="药物名称" width="200" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditDrug(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDeleteDrug(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="关系管理" name="relationship">
        <div class="relationship-page">
          <el-card class="relationship-card">
            <template #header>
              <div class="card-header">
                <span>创建关系</span>
              </div>
            </template>
            <el-form :model="relationshipForm" label-width="120px">
              <el-form-item label="关系类型">
                <el-select v-model="relationshipForm.type" style="width: 100%" @change="handleRelationshipTypeChange">
                  <el-option label="推荐药物" value="recommand_drug" />
                  <el-option label="常用药物" value="common_drug" />
                  <el-option label="拥有症状" value="has_symptom" />
                  <el-option label="所属科室" value="belongs_to" />
                  <el-option label="需要检查" value="need_check" />
                  <el-option label="并发疾病" value="acompany_with" />
                </el-select>
              </el-form-item>

              <el-form-item label="疾病名称 1" v-if="relationshipForm.type === 'acompany_with'">
                <el-select
                  v-model="relationshipForm.diseaseName1"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入疾病名称"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in diseaseList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="疾病名称 2" v-if="relationshipForm.type === 'acompany_with'">
                <el-select
                  v-model="relationshipForm.diseaseName2"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入疾病名称"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in diseaseList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="疾病名称" v-else>
                <el-select
                  v-model="relationshipForm.diseaseName"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入疾病名称"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in diseaseList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="药物名称" v-if="['recommand_drug', 'common_drug'].includes(relationshipForm.type)">
                <el-select
                  v-model="relationshipForm.drugName"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或输入药物名称"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in drugList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="症状名称" v-if="relationshipForm.type === 'has_symptom'">
                <el-input
                  v-model="relationshipForm.symptomName"
                  placeholder="请输入症状名称"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="科室名称" v-if="relationshipForm.type === 'belongs_to'">
                <el-input
                  v-model="relationshipForm.departmentName"
                  placeholder="请输入科室名称"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="检查项目名称" v-if="relationshipForm.type === 'need_check'">
                <el-input
                  v-model="relationshipForm.checkName"
                  placeholder="请输入检查项目名称"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSubmitRelationship" :loading="submitting">创建关系</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <el-card class="relationship-card" style="margin-top: 20px">
            <template #header>
              <div class="card-header">
                <span>删除关系</span>
              </div>
            </template>
            <el-form :model="deleteRelationshipForm" label-width="120px">
              <el-form-item label="起始节点">
                <el-input v-model="deleteRelationshipForm.startNodeName" placeholder="请输入起始节点名称" />
              </el-form-item>
              <el-form-item label="结束节点">
                <el-input v-model="deleteRelationshipForm.endNodeName" placeholder="请输入结束节点名称" />
              </el-form-item>
              <el-form-item label="关系类型">
                <el-select v-model="deleteRelationshipForm.relationshipType" style="width: 100%">
                  <el-option label="推荐药物" value="recommand_drug" />
                  <el-option label="常用药物" value="common_drug" />
                  <el-option label="拥有症状" value="has_symptom" />
                  <el-option label="所属科室" value="belongs_to" />
                  <el-option label="需要检查" value="need_check" />
                  <el-option label="并发疾病" value="acompany_with" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="danger" @click="handleDeleteRelationship" :loading="submitting">删除关系</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="图谱可视化" name="graph">
        <div class="graph-toolbar">
          <el-input
            v-model="graphDiseaseName"
            placeholder="输入疾病名称查看相关图谱"
            style="width: 300px; margin-right: 10px"
            clearable
          />
          <el-button type="primary" @click="handleLoadDiseaseGraph" :loading="chartLoading">加载疾病图谱</el-button>
          <el-button @click="handleLoadFullGraph" :loading="chartLoading">加载完整图谱</el-button>
        </div>

        <div ref="graphContainer" class="graph-container">
          <div v-if="graphData.nodes.length === 0" class="empty-graph">
            <el-empty description="请点击按钮加载图谱数据" />
          </div>
          <div v-else class="graph-wrapper" v-loading="chartLoading">
            <div ref="chartContainer" class="chart-container"></div>
            <div class="graph-info">
              <p>节点数：{{ graphData.nodes.length }}</p>
              <p>关系数：{{ graphData.links.length }}</p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="diseaseDialogVisible"
      :title="diseaseDialogTitle"
      width="700px"
      @close="handleDiseaseDialogClose"
    >
      <el-form :model="diseaseForm" :rules="diseaseFormRules" ref="diseaseFormRef" label-width="120px">
        <el-form-item label="疾病名称" prop="name">
          <el-input v-model="diseaseForm.name" :disabled="isEditDisease" />
        </el-form-item>
        <el-form-item label="疾病描述" prop="desc">
          <el-input v-model="diseaseForm.desc" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="病因" prop="cause">
          <el-input v-model="diseaseForm.cause" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="预防措施" prop="prevent">
          <el-input v-model="diseaseForm.prevent" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="易感人群" prop="easyGet">
          <el-input v-model="diseaseForm.easyGet" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="治疗周期" prop="cureLasttime">
          <el-input v-model="diseaseForm.cureLasttime" />
        </el-form-item>
        <el-form-item label="治愈率" prop="curedProb">
          <el-input v-model="diseaseForm.curedProb" />
        </el-form-item>
        <el-form-item label="所属科室" prop="cureDepartment">
          <el-select v-model="diseaseForm.cureDepartment" multiple style="width: 100%">
            <el-option label="内分泌科" value="内分泌科" />
            <el-option label="心血管内科" value="心血管内科" />
            <el-option label="神经内科" value="神经内科" />
            <el-option label="呼吸内科" value="呼吸内科" />
            <el-option label="消化内科" value="消化内科" />
            <el-option label="骨科" value="骨科" />
            <el-option label="外科" value="外科" />
            <el-option label="儿科" value="儿科" />
          </el-select>
        </el-form-item>
        <el-form-item label="治疗方式" prop="cureWay">
          <el-select v-model="diseaseForm.cureWay" multiple style="width: 100%">
            <el-option label="药物治疗" value="药物治疗" />
            <el-option label="手术治疗" value="手术治疗" />
            <el-option label="物理治疗" value="物理治疗" />
            <el-option label="饮食控制" value="饮食控制" />
            <el-option label="运动治疗" value="运动治疗" />
            <el-option label="胰岛素治疗" value="胰岛素治疗" />
            <el-option label="生活方式干预" value="生活方式干预" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="diseaseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitDisease" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="drugDialogVisible"
      :title="drugDialogTitle"
      width="500px"
      @close="handleDrugDialogClose"
    >
      <el-form :model="drugForm" :rules="drugFormRules" ref="drugFormRef" label-width="100px">
        <el-form-item label="药物名称" prop="name">
          <el-input v-model="drugForm.name" :disabled="isEditDrug" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drugDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitDrug" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { knowledgeAPI } from '@/api/knowledge'
import * as echarts from 'echarts'

const activeTab = ref('disease')
const loading = ref(false)
const submitting = ref(false)
const chartLoading = ref(false)

const searchKeyword = ref('')
const diseaseList = ref([])

const drugKeyword = ref('')
const drugList = ref([])

const graphContainer = ref(null)
const chartContainer = ref(null)
const graphData = reactive({
  nodes: [],
  links: []
})
const graphDiseaseName = ref('')
let chartInstance = null

const diseaseDialogVisible = ref(false)
const diseaseDialogTitle = ref('添加疾病')
const isEditDisease = ref(false)
const diseaseFormRef = ref(null)

const diseaseForm = ref({
  id: '',
  name: '',
  desc: '',
  cause: '',
  prevent: '',
  easyGet: '',
  cureLasttime: '',
  curedProb: '',
  cureDepartment: [],
  cureWay: []
})

const diseaseFormRules = {
  name: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }]
}

const drugDialogVisible = ref(false)
const drugDialogTitle = ref('添加药物')
const isEditDrug = ref(false)
const drugFormRef = ref(null)

const drugForm = ref({
  id: '',
  name: ''
})

const drugFormRules = {
  name: [{ required: true, message: '请输入药物名称', trigger: 'blur' }]
}

const fetchDiseases = async () => {
  loading.value = true
  try {
    const result = await knowledgeAPI.getAllDiseases()
    diseaseList.value = result.data
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleSearchDisease = async () => {
  if (!searchKeyword.value.trim()) {
    fetchDiseases()
    return
  }
  loading.value = true
  try {
    const result = await knowledgeAPI.searchDiseases(searchKeyword.value)
    diseaseList.value = result.data
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleAddDisease = () => {
  diseaseDialogTitle.value = '添加疾病'
  isEditDisease.value = false
  diseaseForm.value = {
    id: '',
    name: '',
    desc: '',
    cause: '',
    prevent: '',
    easyGet: '',
    cureLasttime: '',
    curedProb: '',
    cureDepartment: [],
    cureWay: []
  }
  diseaseDialogVisible.value = true
}

const handleEditDisease = (row) => {
  diseaseDialogTitle.value = '编辑疾病'
  isEditDisease.value = true
  diseaseForm.value = {
    id: row.id,
    name: row.name,
    desc: row.desc || '',
    cause: row.cause || '',
    prevent: row.prevent || '',
    easyGet: row.easyGet || '',
    cureLasttime: row.cureLasttime || '',
    curedProb: row.curedProb || '',
    cureDepartment: row.cureDepartment || [],
    cureWay: row.cureWay || []
  }
  diseaseDialogVisible.value = true
}

const handleDeleteDisease = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该疾病吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await knowledgeAPI.deleteDisease(id)
    ElMessage.success('删除成功')
    fetchDiseases()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

const handleSubmitDisease = async () => {
  try {
    await diseaseFormRef.value.validate()
    submitting.value = true
    const submitData = {
      ...diseaseForm.value,
      cureDepartment: diseaseForm.value.cureDepartment.filter(item => item),
      cureWay: diseaseForm.value.cureWay.filter(item => item)
    }
    if (isEditDisease.value) {
      await knowledgeAPI.updateDisease(diseaseForm.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await knowledgeAPI.createDisease(submitData)
      ElMessage.success('添加成功')
    }
    diseaseDialogVisible.value = false
    fetchDiseases()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleDiseaseDialogClose = () => {
  diseaseFormRef.value?.resetFields()
}

const fetchDrugs = async () => {
  loading.value = true
  try {
    const result = await knowledgeAPI.getAllDrugs()
    drugList.value = result.data
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleSearchDrug = async () => {
  if (!drugKeyword.value.trim()) {
    fetchDrugs()
    return
  }
  loading.value = true
  try {
    const result = await knowledgeAPI.searchDrugs(drugKeyword.value)
    drugList.value = result.data
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const handleAddDrug = () => {
  drugDialogTitle.value = '添加药物'
  isEditDrug.value = false
  drugForm.value = { id: '', name: '' }
  drugDialogVisible.value = true
}

const handleEditDrug = (row) => {
  drugDialogTitle.value = '编辑药物'
  isEditDrug.value = true
  drugForm.value = { id: row.id, name: row.name }
  drugDialogVisible.value = true
}

const handleDeleteDrug = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该药物吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await knowledgeAPI.deleteDrug(id)
    ElMessage.success('删除成功')
    fetchDrugs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

const handleSubmitDrug = async () => {
  try {
    await drugFormRef.value.validate()
    submitting.value = true
    if (isEditDrug.value) {
      await knowledgeAPI.updateDrug(drugForm.value.id, { name: drugForm.value.name })
      ElMessage.success('更新成功')
    } else {
      await knowledgeAPI.createDrug({ name: drugForm.value.name })
      ElMessage.success('添加成功')
    }
    drugDialogVisible.value = false
    fetchDrugs()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}

const handleDrugDialogClose = () => {
  drugFormRef.value?.resetFields()
}

// 关系管理相关变量
const relationshipForm = ref({
  type: 'recommand_drug',
  diseaseName: '',
  diseaseName1: '',
  diseaseName2: '',
  drugName: '',
  symptomName: '',
  departmentName: '',
  checkName: ''
})
const deleteRelationshipForm = ref({
  startNodeName: '',
  endNodeName: '',
  relationshipType: 'recommand_drug'
})

// 关系管理函数
const handleRelationshipTypeChange = () => {
  relationshipForm.value.diseaseName = ''
  relationshipForm.value.diseaseName1 = ''
  relationshipForm.value.diseaseName2 = ''
  relationshipForm.value.drugName = ''
  relationshipForm.value.symptomName = ''
  relationshipForm.value.departmentName = ''
  relationshipForm.value.checkName = ''
}

const handleSubmitRelationship = async () => {
  try {
    submitting.value = true
    const { type, diseaseName, diseaseName1, diseaseName2, drugName, symptomName, departmentName, checkName } = relationshipForm.value
    
    switch (type) {
      case 'recommand_drug':
        await knowledgeAPI.createRecommandDrugRelationship(diseaseName, drugName)
        break
      case 'common_drug':
        await knowledgeAPI.createCommonDrugRelationship(diseaseName, drugName)
        break
      case 'has_symptom':
        await knowledgeAPI.createHasSymptomRelationship(diseaseName, symptomName)
        break
      case 'belongs_to':
        await knowledgeAPI.createBelongsToRelationship(diseaseName, departmentName)
        break
      case 'need_check':
        await knowledgeAPI.createNeedCheckRelationship(diseaseName, checkName)
        break
      case 'acompany_with':
        await knowledgeAPI.createAcompanyWithRelationship(diseaseName1, diseaseName2)
        break
      default:
        throw new Error('未知的关系类型')
    }
    
    ElMessage.success('关系创建成功')
    relationshipForm.value = {
      type: 'recommand_drug',
      diseaseName: '',
      diseaseName1: '',
      diseaseName2: '',
      drugName: '',
      symptomName: '',
      departmentName: '',
      checkName: ''
    }
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    submitting.value = false
  }
}

const handleDeleteRelationship = async () => {
  try {
    const { startNodeName, endNodeName, relationshipType } = deleteRelationshipForm.value
    
    if (!startNodeName || !endNodeName) {
      ElMessage.warning('请输入起始节点和结束节点名称')
      return
    }
    
    await ElMessageBox.confirm('确定要删除该关系吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await knowledgeAPI.deleteRelationship(startNodeName, endNodeName, relationshipType)
    ElMessage.success('关系删除成功')
    
    deleteRelationshipForm.value = {
      startNodeName: '',
      endNodeName: '',
      relationshipType: 'recommand_drug'
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

const handleViewGraph = async (diseaseName) => {
  graphDiseaseName.value = diseaseName
  activeTab.value = 'graph'
  chartLoading.value = true
  try {
    const result = await knowledgeAPI.getDiseaseGraph(diseaseName)
    graphData.nodes = result.data.nodes || []
    graphData.links = result.data.links || []
    await nextTick()
    initChart()
    ElMessage.success('疾病图谱加载成功')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    setTimeout(() => {
      chartLoading.value = false
    }, 300)
  }
}

const initChart = () => {
  if (!chartContainer.value) return
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartContainer.value)
  }
  
  const categoryMap = {}
  const categories = []
  
  graphData.nodes.forEach(node => {
    if (!categoryMap[node.type]) {
      categoryMap[node.type] = categories.length
      categories.push({ name: getNodeTypeName(node.type) })
    }
  })
  
  const nodes = graphData.nodes.map(node => ({
    id: node.id,
    name: node.name,
    symbolSize: getNodeSymbolSize(node.type),
    category: categoryMap[node.type],
    value: node.properties ? Object.values(node.properties).join('\n') : '',
    draggable: true
  }))
  
  const links = graphData.links.map(link => ({
    source: link.source,
    target: link.target,
    value: link.type
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#666'
      },
      formatter: function(params) {
        if (params.dataType === 'node') {
          return `<div style="padding: 5px;">
            <strong style="font-size: 14px; color: #333;">${params.data.name}</strong><br/>
            <span style="font-size: 12px; color: #999;">类型：${getNodeTypeName(params.data.category)}</span><br/>
            <span style="font-size: 12px; color: #666;">${params.data.value || ''}</span>
          </div>`
        } else {
          return `<div style="padding: 5px;">
            <span style="font-size: 12px;">${params.data.source} → ${params.data.target}</span><br/>
            <span style="font-size: 12px; color: #999;">关系：${params.data.value}</span>
          </div>`
        }
      }
    },
    legend: [{
      data: categories.map(c => c.name),
      orient: 'vertical',
      left: 10,
      top: 10,
      itemWidth: 15,
      itemHeight: 15,
      textStyle: {
        color: '#666'
      }
    }],
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        categories: categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: '#333',
          fontSize: 12
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
          width: 1.5,
          opacity: 0.7
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 8,
        emphasis: {
          focus: 'none',
          label: {
            show: true,
            color: '#409EFF',
            fontSize: 14,
            fontWeight: 'bold'
          },
          lineStyle: {
            width: 3,
            opacity: 1
          },
          itemStyle: {
            opacity: 1
          }
        },
        force: {
          repulsion: 500,
          edgeLength: [150, 300],
          gravity: 0.1
        },
        nodeCategory: 0
      }
    ]
  }
  
  chartInstance.setOption(option, { notMerge: false })
  
  if (!chartInstance._isResizeListenerAdded) {
    window.addEventListener('resize', () => {
      chartInstance && chartInstance.resize()
    })
    chartInstance._isResizeListenerAdded = true
  }
}

const getNodeTypeName = (type) => {
  const typeMap = {
    Disease: '疾病',
    Drug: '药物',
    Department: '科室',
    Symptom: '症状',
    Check: '检查'
  }
  return typeMap[type] || type
}

const getNodeSymbolSize = (type) => {
  const sizeMap = {
    Disease: 50,
    Drug: 30,
    Department: 35,
    Symptom: 25,
    Check: 25
  }
  return sizeMap[type] || 30
}

const handleLoadFullGraph = async () => {
  chartLoading.value = true
  try {
    const result = await knowledgeAPI.getFullGraph()
    graphData.nodes = result.data.nodes || []
    graphData.links = result.data.links || []
    await nextTick()
    initChart()
    ElMessage.success('图谱加载成功')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    setTimeout(() => {
      chartLoading.value = false
    }, 300)
  }
}

const handleLoadDiseaseGraph = async () => {
  if (!graphDiseaseName.value.trim()) {
    ElMessage.warning('请输入疾病名称')
    return
  }
  chartLoading.value = true
  try {
    const result = await knowledgeAPI.getDiseaseGraph(graphDiseaseName.value)
    graphData.nodes = result.data.nodes || []
    graphData.links = result.data.links || []
    await nextTick()
    initChart()
    ElMessage.success('疾病图谱加载成功')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    setTimeout(() => {
      chartLoading.value = false
    }, 300)
  }
}

const cleanupChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

onMounted(() => {
  fetchDiseases()
  fetchDrugs()
})

onUnmounted(() => {
  cleanupChart()
})
</script>

<style scoped>
.knowledge-page {
  padding: 0;
}

.search-bar {
  display: flex;
  align-items: center;
}

.graph-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.graph-container {
  height: 600px;
  background: #f5f7fa;
  border-radius: 4px;
  position: relative;
}

.empty-graph {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.graph-wrapper {
  display: flex;
  height: 100%;
  position: relative;
}

.chart-container {
  flex: 1;
  height: 100%;
  min-height: 500px;
}

.graph-info {
  position: absolute;
  left: 20px;
  bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.graph-info p {
  margin: 5px 0;
  color: #666;
  font-size: 12px;
}

.relationship-page {
  padding: 20px;
}

.relationship-card {
  max-width: 800px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}
</style>
