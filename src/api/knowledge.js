import request from '@/utils/request'

export const knowledgeAPI = {
  createDisease(data) {
    return request.post('/neo4j/disease', data)
  },

  getAllDiseases() {
    return request.get('/neo4j/diseases')
  },

  searchDiseases(keyword) {
    return request.get('/neo4j/disease/search', {
      params: { keyword }
    })
  },

  getDiseaseByName(name) {
    return request.get(`/neo4j/disease/${encodeURIComponent(name)}`)
  },

  updateDisease(id, data) {
    return request.put(`/neo4j/disease/${id}`, data)
  },

  deleteDisease(id) {
    return request.delete(`/neo4j/disease/${id}`)
  },

  createDrug(data) {
    return request.post('/neo4j/drug', data)
  },

  getAllDrugs() {
    return request.get('/neo4j/drugs')
  },

  searchDrugs(keyword) {
    return request.get('/neo4j/drug/search', {
      params: { keyword }
    })
  },

  updateDrug(id, data) {
    return request.put(`/neo4j/drug/${id}`, data)
  },

  deleteDrug(id) {
    return request.delete(`/neo4j/drug/${id}`)
  },

  getFullGraph() {
    return request.get('/neo4j/graph/full')
  },

  getDiseaseGraph(diseaseName) {
    return request.get('/neo4j/graph/disease', {
      params: { diseaseName }
    })
  },

  getDiseaseRelatedInfo(name) {
    return request.get(`/neo4j/disease/${encodeURIComponent(name)}/info`)
  },

  createRecommandDrugRelationship(diseaseName, drugName) {
    return request.post('/neo4j/relationship/recommand-drug', null, {
      params: { diseaseName, drugName }
    })
  },

  createCommonDrugRelationship(diseaseName, drugName) {
    return request.post('/neo4j/relationship/common-drug', null, {
      params: { diseaseName, drugName }
    })
  },

  createHasSymptomRelationship(diseaseName, symptomName) {
    return request.post('/neo4j/relationship/has-symptom', null, {
      params: { diseaseName, symptomName }
    })
  },

  createBelongsToRelationship(diseaseName, departmentName) {
    return request.post('/neo4j/relationship/belongs-to', null, {
      params: { diseaseName, departmentName }
    })
  },

  createNeedCheckRelationship(diseaseName, checkName) {
    return request.post('/neo4j/relationship/need-check', null, {
      params: { diseaseName, checkName }
    })
  },

  createAcompanyWithRelationship(diseaseName1, diseaseName2) {
    return request.post('/neo4j/relationship/accompany-with', null, {
      params: { diseaseName1, diseaseName2 }
    })
  },

  deleteRelationship(startNodeName, endNodeName, relationshipType) {
    return request.delete('/neo4j/relationship', {
      params: { startNodeName, endNodeName, relationshipType }
    })
  }
}
